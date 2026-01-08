'use client';

import { useState, useEffect } from 'react';
import { publicApi } from '@/services/publicService';

export const usePublicData = () => {
  const [aptisTypes, setAptisTypes] = useState([]);
  const [skillTypes, setSkillTypes] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        setLoading(true);
        console.log('[usePublicData] Starting to load public data...');
        
        const [aptisResponse, skillsResponse, questionsResponse] = await Promise.all([
          publicApi.getAptisTypes(),
          publicApi.getSkillTypes(),
          publicApi.getQuestionTypes()
        ]);

        console.log('[usePublicData] APTIS Response:', aptisResponse);
        console.log('[usePublicData] Skills Response:', skillsResponse);
        console.log('[usePublicData] Questions Response:', questionsResponse);

        // Handle APTIS Types
        if (aptisResponse) {
          const aptisData = aptisResponse.success ? aptisResponse.data : aptisResponse.data || aptisResponse;
          if (Array.isArray(aptisData)) {
            // Transform to ensure consistency - backend returns 'name', we normalize to 'aptis_type_name'
            const normalized = aptisData.map(item => ({
              ...item,
              aptis_type_name: item.aptis_type_name || item.name
            }));
            console.log('[usePublicData] Setting APTIS types:', normalized);
            setAptisTypes(normalized);
          } else {
            console.warn('[usePublicData] APTIS data is not an array:', aptisData);
          }
        }
        
        // Handle Skill Types
        if (skillsResponse) {
          const skillsData = skillsResponse.success ? skillsResponse.data : skillsResponse.data || skillsResponse;
          if (Array.isArray(skillsData)) {
            // Transform to ensure consistency - backend returns 'name', we normalize to 'skill_type_name'
            const normalized = skillsData.map(item => ({
              ...item,
              skill_type_name: item.skill_type_name || item.name
            }));
            console.log('[usePublicData] Setting skill types:', normalized);
            setSkillTypes(normalized);
          } else {
            console.warn('[usePublicData] Skills data is not an array:', skillsData);
          }
        }

        // Handle Question Types
        if (questionsResponse) {
          const questionsData = questionsResponse.success ? questionsResponse.data : questionsResponse.data || questionsResponse;
          if (Array.isArray(questionsData)) {
            console.log('[usePublicData] Setting question types:', questionsData);
            setQuestionTypes(questionsData);
          } else {
            console.warn('[usePublicData] Questions data is not an array:', questionsData);
          }
        }
      } catch (err) {
        console.error('[usePublicData] Error loading public data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadPublicData();
  }, []);

  return {
    aptisTypes,
    skillTypes,
    questionTypes,
    loading,
    error
  };
};