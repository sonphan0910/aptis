'use client';

import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context to manage audio play counts across listening questions
 * This ensures play counts are preserved when navigating between questions
 */
const AudioPlayContext = createContext();

export const useAudioPlay = () => {
  const context = useContext(AudioPlayContext);
  if (!context) {
    throw new Error('useAudioPlay must be used within AudioPlayProvider');
  }
  return context;
};

export const AudioPlayProvider = ({ children }) => {
  // Store play counts by questionId and itemIndex (for matching questions)
  // Format: { questionId: { itemIndex: count } } or { questionId: count }
  const [playCountsByQuestion, setPlayCountsByQuestion] = useState({});
  
  // Get play count for a specific question (single audio)
  const getPlayCount = (questionId) => {
    return playCountsByQuestion[questionId] || 0;
  };
  
  // Get play count for a specific item in matching question
  const getItemPlayCount = (questionId, itemIndex) => {
    const questionData = playCountsByQuestion[questionId];
    if (!questionData || typeof questionData === 'number') return 0;
    return questionData[itemIndex] || 0;
  };
  
  // Increment play count for single audio question
  const incrementPlayCount = (questionId) => {
    setPlayCountsByQuestion(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1
    }));
  };
  
  // Increment play count for item in matching question
  const incrementItemPlayCount = (questionId, itemIndex) => {
    setPlayCountsByQuestion(prev => {
      const questionData = prev[questionId] || {};
      // If it's a number, convert to object
      const normalizedData = typeof questionData === 'number' ? {} : questionData;
      
      return {
        ...prev,
        [questionId]: {
          ...normalizedData,
          [itemIndex]: (normalizedData[itemIndex] || 0) + 1
        }
      };
    });
  };
  
  // Reset all play counts (when exam ends)
  const resetAllPlayCounts = () => {
    setPlayCountsByQuestion({});
  };
  
  // Reset play counts for specific question
  const resetQuestionPlayCount = (questionId) => {
    setPlayCountsByQuestion(prev => {
      const newState = { ...prev };
      delete newState[questionId];
      return newState;
    });
  };
  
  const value = {
    getPlayCount,
    getItemPlayCount,
    incrementPlayCount,
    incrementItemPlayCount,
    resetAllPlayCounts,
    resetQuestionPlayCount,
    playCountsByQuestion // For debugging
  };
  
  return (
    <AudioPlayContext.Provider value={value}>
      {children}
    </AudioPlayContext.Provider>
  );
};