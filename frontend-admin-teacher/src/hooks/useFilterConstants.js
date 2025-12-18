'use client';

import { useState, useEffect } from 'react';
import { publicApi } from '@/services/publicApi';
import {
  DEFAULT_APTIS_TYPES,
  DEFAULT_SKILLS,
  DEFAULT_QUESTION_TYPES,
  transformApiDataToFilterOptions
} from '@/constants/filterOptions';

/**
 * Custom hook to load constants from API with fallback to hardcoded values
 * This ensures the app works even if the API is temporarily unavailable
 */
export const useFilterConstants = () => {
  const [aptisTypes, setAptisTypes] = useState(DEFAULT_APTIS_TYPES);
  const [skillTypes, setSkillTypes] = useState(DEFAULT_SKILLS);
  const [questionTypes, setQuestionTypes] = useState(DEFAULT_QUESTION_TYPES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConstants = async () => {
      try {
        setLoading(true);
        
        // Load all constants in parallel
        const [aptisData, skillsData, questionsData] = await Promise.allSettled([
          publicApi.getAptisTypes(),
          publicApi.getSkillTypes(),
          publicApi.getQuestionTypes()
        ]).then(results => [
          results[0].status === 'fulfilled' ? results[0].value : null,
          results[1].status === 'fulfilled' ? results[1].value : null,
          results[2].status === 'fulfilled' ? results[2].value : null
        ]);

        // Use API data if available, otherwise use fallback
        if (aptisData && aptisData.length > 0) {
          const transformed = transformApiDataToFilterOptions(aptisData, 'aptis_type_name');
          setAptisTypes(transformed);
        }

        if (skillsData && skillsData.length > 0) {
          const transformed = transformApiDataToFilterOptions(skillsData, 'skill_type_name');
          setSkillTypes(transformed);
        }

        if (questionsData && questionsData.length > 0) {
          const transformed = questionsData.map(item => ({
            value: item.id,
            label: item.question_type_name,
            code: item.code,
            skillId: item.skill_type_id
          }));
          setQuestionTypes(transformed);
        }

        setError(null);
      } catch (err) {
        console.error('Error loading filter constants:', err);
        setError(err.message);
        // Keep using fallback values on error
      } finally {
        setLoading(false);
      }
    };

    loadConstants();
  }, []);

  return {
    aptisTypes,
    skillTypes,
    questionTypes,
    loading,
    error,
    // Helper to get question types by skill
    getQuestionTypesBySkill: (skillId) => {
      return questionTypes.filter(q => q.skillId === skillId || !q.skillId);
    }
  };
};
