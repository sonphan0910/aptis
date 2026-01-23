import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api.config';

// Helper to ensure response data is always defined (handles 304 responses)
const getResponseData = (response, defaultValue = null) => {
  return response.data ?? defaultValue;
};

export const questionApi = {
  // Get all questions with pagination and filters
  getQuestions: async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.LIST, { params });
    const data = getResponseData(response, { questions: [], total: 0 });
    console.log('[questionService.getQuestions] Response data:', data);
    return data;
  },

  // Get a single question by ID
  getQuestionById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.BY_ID(id));
    // Ensure we return the data even if response is 304
    return getResponseData(response, {});
  },

  // Create a new question with proper backend structure
  createQuestion: async (questionData) => {
    // Transform frontend data to backend structure
    const backendData = {
      question_type_id: questionData.question_type_id,
      aptis_type_id: questionData.aptis_type_id,
      difficulty: questionData.difficulty,
      content: questionData.content, // JSON string from forms
      media_url: questionData.media_url || null,
      duration_seconds: questionData.duration_seconds || null,
      parent_question_id: questionData.parent_question_id || null,
      additional_media: questionData.additional_media || null,
      status: questionData.status || 'draft'
    };

    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.CREATE, backendData);
    return response.data;
  },

  // Update an existing question
  updateQuestion: async (id, questionData) => {
    const backendData = {
      question_type_id: questionData.question_type_id,
      aptis_type_id: questionData.aptis_type_id,
      difficulty: questionData.difficulty,
      content: questionData.content,
      media_url: questionData.media_url || null,
      duration_seconds: questionData.duration_seconds || null,
      status: questionData.status || 'draft'
    };

    const response = await apiClient.put(API_ENDPOINTS.TEACHER.QUESTIONS.UPDATE(id), backendData);
    return response.data;
  },

  // Get APTIS types
  getAptisTypes: async () => {
    const response = await apiClient.get('/api/aptis-types');
    return getResponseData(response, []);
  },

  // Get skill types
  getSkillTypes: async () => {
    const response = await apiClient.get('/api/skill-types');
    return getResponseData(response, []);
  },

  // Get question types by skill
  getQuestionTypes: async (skillCode = null) => {
    const params = skillCode ? { skill_code: skillCode } : {};
    const response = await apiClient.get('/api/question-types', { params });
    return getResponseData(response, []);
  },

  // Get question type by code
  getQuestionTypeByCode: async (code) => {
    const response = await apiClient.get(`/api/question-types/${code}`);
    return getResponseData(response, {});
  },

  // Get APTIS type by code  
  getAptisTypeByCode: async (code) => {
    const response = await apiClient.get(`/api/aptis-types/${code}`);
    return getResponseData(response, {});
  },

  // Delete a question
  deleteQuestion: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.TEACHER.QUESTIONS.DELETE(id));
    return response.data;
  },

  // Get question usage
  getQuestionUsage: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.USAGE(id));
    return getResponseData(response, []);
  },

  // Delete multiple questions
  deleteMultipleQuestions: async (ids) => {
    const response = await apiClient.delete(API_ENDPOINTS.TEACHER.QUESTIONS.DELETE_MULTIPLE, {
      data: { ids }
    });
    return response.data;
  },

  // Duplicate a question
  duplicateQuestion: async (id) => {
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.DUPLICATE(id));
    return response.data;
  },

  // Import questions
  importQuestions: async (file, format) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  },

  // Export questions
  exportQuestions: async (filters, format) => {
    const response = await apiClient.post(API_ENDPOINTS.TEACHER.QUESTIONS.EXPORT, {
      filters,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get question types
  getQuestionTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.TYPES);
    return getResponseData(response, []);
  },

  // Get categories
  getCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.CATEGORIES);
    return getResponseData(response, []);
  },

  // Bulk update questions
  bulkUpdateQuestions: async (ids, updateData) => {
    const response = await apiClient.put(API_ENDPOINTS.TEACHER.QUESTIONS.BULK_UPDATE, {
      ids,
      updateData
    });
    return response.data;
  },

  // Get question details by ID
  getQuestionDetails: async (questionId) => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.BY_ID(questionId));
    const data = getResponseData(response);
    // Handle nested data structure from backend
    return data?.data || data;
  },

  // Get filter options from API
  // Get filter options for dropdowns
  getFilterOptions: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.QUESTIONS.FILTER_OPTIONS);
    // Response structure: { success: true, data: { aptisTypes, questionTypes, skills, difficulties, statuses } }
    const responseData = response.data?.data || response.data || {};
    console.log('[getFilterOptions] Response:', responseData);
    return responseData;
  },

  // Upload images for a question
  uploadQuestionImages: async (questionId, imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const response = await apiClient.post(
      `/teacher/questions/${questionId}/upload-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Upload audio files for a question (similar to uploadQuestionImages)
  uploadQuestionAudios: async (questionId, audioFiles) => {
    const formData = new FormData();
    
    if (audioFiles.mainAudio) {
      formData.append('mainAudio', audioFiles.mainAudio);
    }
    
    if (audioFiles.speakerAudios && audioFiles.speakerAudios.length > 0) {
      audioFiles.speakerAudios.forEach(file => {
        formData.append('speakerAudios', file);
      });
    }

    const response = await apiClient.post(
      `/teacher/questions/${questionId}/upload-audios`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Upload audio files for questions
  uploadAudioFile: async (audioFile, type = 'general') => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('type', type);

    const response = await apiClient.post(
      '/teacher/upload/audio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Update question media URL after upload
  updateQuestionMediaUrl: async (questionId, mediaUrl) => {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.TEACHER.QUESTIONS.BASE}/${questionId}`,
      { media_url: mediaUrl }
    );
    return response.data;
  },

  // Create question and upload audio files workflow
  createQuestionWithAudio: async (formData, audioFiles) => {
    try {
      // Step 1: Create question first (using existing createQuestion method)
      console.log('🔹 Step 1: Creating question...');
      const question = await questionApi.createQuestion(formData);
      const questionId = question.id;
      console.log('✅ Question created with ID:', questionId);

      let mainAudioUrl = null;
      const audioUrls = {};

      // Step 2: Upload main audio if provided
      if (audioFiles.mainAudio) {
        console.log('🔹 Step 2: Uploading main audio...');
        const uploadResult = await questionApi.uploadAudioFile(audioFiles.mainAudio, 'listening_main');
        if (uploadResult.success) {
          mainAudioUrl = `/uploads/audio/${uploadResult.audioUrl}`;
          console.log('✅ Main audio uploaded:', mainAudioUrl);
        }
      }

      // Step 3: Upload speaker audio files if provided
      if (audioFiles.speakerAudios && audioFiles.speakerAudios.length > 0) {
        console.log('🔹 Step 3: Uploading speaker audios...');
        for (let i = 0; i < audioFiles.speakerAudios.length; i++) {
          const speakerFile = audioFiles.speakerAudios[i];
          if (speakerFile) {
            const uploadResult = await questionApi.uploadAudioFile(speakerFile, 'speaker_sample');
            if (uploadResult.success) {
              audioUrls[`speaker_${i}`] = `/uploads/audio/${uploadResult.audioUrl}`;
              console.log(`✅ Speaker ${i} audio uploaded:`, audioUrls[`speaker_${i}`]);
            }
          }
        }
      }

      // Step 4: Update question with main audio URL if uploaded
      if (mainAudioUrl) {
        console.log('🔹 Step 4: Updating question media URL...');
        await questionApi.updateQuestionMediaUrl(questionId, mainAudioUrl);
      }

      // Step 5: Update question content with all audio URLs
      if (Object.keys(audioUrls).length > 0 || mainAudioUrl) {
        console.log('🔹 Step 5: Updating question content with audio URLs...');
        const contentData = JSON.parse(formData.content);
        if (mainAudioUrl) {
          contentData.audioUrl = mainAudioUrl;
        }
        if (Object.keys(audioUrls).length > 0) {
          contentData.audioUrls = audioUrls;
          
          // Update speakers with their audio URLs
          if (contentData.speakers) {
            contentData.speakers = contentData.speakers.map((speaker, index) => ({
              ...speaker,
              audioUrl: audioUrls[`speaker_${index}`] || speaker.audioUrl
            }));
          }
        }

        // Update question with new content containing audio URLs
        await questionApi.updateQuestion(questionId, {
          ...formData,
          content: JSON.stringify(contentData)
        });
        console.log('✅ Question content updated with audio URLs');
      }

      return {
        success: true,
        question: question,
        audioUrls: {
          main: mainAudioUrl,
          ...audioUrls
        }
      };
    } catch (error) {
      console.error('❌ Error creating question with audio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

};