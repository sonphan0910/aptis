'use client';

import { useState, useEffect } from 'react';
import { 
  DEFAULT_APTIS_TYPES, 
  DEFAULT_QUESTION_TYPES, 
  DEFAULT_SKILLS,
  transformApiDataToFilterOptions 
} from '@/constants/filterOptions';
import { apiClient } from '@/services/apiClient';

/**
 * Custom hook for managing criteria filter options
 * Fetches data from API endpoints and falls back to constants
 */
export const useCriteriaFilters = () => {
  const [aptisTypes, setAptisTypes] = useState(DEFAULT_APTIS_TYPES);
  const [questionTypes, setQuestionTypes] = useState(DEFAULT_QUESTION_TYPES);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        
        // Fetch all filter options in parallel
        const [aptisResponse, questionTypesResponse, skillsResponse] = await Promise.allSettled([
          apiClient.get('/public/aptis-types'),
          apiClient.get('/public/question-types'),
          apiClient.get('/public/skill-types')
        ]);

        // Process APTIS types
        if (aptisResponse.status === 'fulfilled' && aptisResponse.value.data) {
          const transformedAptis = transformApiDataToFilterOptions(
            aptisResponse.value.data, 
            'aptis_type_name'
          );
          if (transformedAptis.length > 0) {
            setAptisTypes(transformedAptis);
          }
        }

        // Process Question types
        if (questionTypesResponse.status === 'fulfilled' && questionTypesResponse.value?.data) {
          try {
            const data = questionTypesResponse.value.data;
            if (Array.isArray(data)) {
              const transformedQuestionTypes = data.map(item => ({
                value: item.id,
                label: item.question_type_name || item.question_type_code,
                code: item.question_type_code || item.code,
                skillId: item.skill_type_id
              }));
              if (transformedQuestionTypes.length > 0) {
                setQuestionTypes(transformedQuestionTypes);
              }
            }
          } catch (err) {
            console.warn('Failed to process question types:', err);
          }
        }

        // Process Skills
        if (skillsResponse.status === 'fulfilled' && skillsResponse.value.data) {
          const transformedSkills = transformApiDataToFilterOptions(
            skillsResponse.value.data, 
            'skill_type_name'
          );
          if (transformedSkills.length > 0) {
            setSkills(transformedSkills);
          }
        }

      } catch (err) {
        console.warn('Failed to fetch filter options, using fallback constants:', err);
        setError(err);
        // Keep using the default constants
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Helper functions
  const getAptisTypeLabel = (aptisTypeId) => {
    const type = aptisTypes.find(t => t.value === aptisTypeId);
    return type ? type.label : 'Không xác định';
  };

  const getQuestionTypeLabel = (questionTypeId) => {
    const type = questionTypes.find(t => t.value === questionTypeId);
    return type ? type.label : 'Không xác định';
  };

  const getSkillLabel = (skillId) => {
    const skill = skills.find(s => s.value === skillId);
    return skill ? skill.label : 'Không xác định';
  };

  const getSkillByQuestionType = (questionTypeId) => {
    const questionType = questionTypes.find(t => t.value === questionTypeId);
    return questionType ? getSkillLabel(questionType.skillId) : 'Không xác định';
  };

  const getQuestionTypesBySkill = (skillId) => {
    if (!skillId) return questionTypes;
    return questionTypes.filter(type => type.skillId === parseInt(skillId));
  };

  return {
    // Data
    aptisTypes,
    questionTypes,
    skills,
    
    // State
    loading,
    error,
    
    // Helper functions
    getAptisTypeLabel,
    getQuestionTypeLabel,
    getSkillLabel,
    getSkillByQuestionType,
    getQuestionTypesBySkill
  };
};

export default useCriteriaFilters;