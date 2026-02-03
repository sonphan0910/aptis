'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  PlayArrow,
  Pause,
  VolumeUp
} from '@mui/icons-material';
import { getAssetUrl } from '@/services/api';

export default function ListeningMCQQuestionResult({ answer, question, showCorrectAnswer = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Parse structured data from question content
  const structuredData = useMemo(() => {
    try {
      const parsed = typeof question.content === 'string' ? JSON.parse(question.content) : question.content;

      // Handle Single MCQ structure in JSON
      if (parsed && typeof parsed === 'object') {
        const qData = parsed.questions ? parsed.questions[0] : (parsed.items ? parsed.items[0] : null);

        if (qData) {
          return {
            instruction: parsed.instructions || parsed.instruction || parsed.title || "Listen to the audio and answer the question.",
            transcript: parsed.transcript || [],
            audioUrl: parsed.audioUrl || question.media_url || question.audio_url,
            questionText: qData.question || qData.text || "",
            correctAnswerIndex: qData.correctAnswer,
            options: (qData.options || []).map((opt, idx) => ({
              text: opt.option_text || opt.text || opt,
              isCorrect: opt.is_correct || opt.correct || (String(qData.correctAnswer) === String(idx))
            }))
          };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [question.content, question.media_url, question.audio_url]);

  // Unified options list - Merge DB and JSON
  const displayOptions = useMemo(() => {
    const dbOptions = question.options || [];

    if (dbOptions.length > 0) {
      return dbOptions.map((opt, idx) => {
        const jsonOpt = structuredData?.options?.[idx];
        // A choice is correct if the DB says so OR if the JSON index matches
        const isJsonCorrect = structuredData && (String(structuredData.correctAnswerIndex) === String(idx));

        return {
          id: opt.id,
          text: opt.option_text || jsonOpt?.text || `Option ${idx + 1}`,
          isCorrect: opt.is_correct || isJsonCorrect
        };
      });
    }

    if (structuredData) {
      return structuredData.options.map((opt, idx) => ({
        id: `json-opt-${idx}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
        index: idx
      }));
    }

    return [];
  }, [question.options, structuredData]);

  // Determine user answer
  const userAnswerId = answer.selected_option_id;
  let selectedOption = displayOptions.find(opt => String(opt.id) === String(userAnswerId));

  // Fallback if not found by ID (maybe index in answer_json)
  if (!selectedOption && answer.answer_json) {
    try {
      const parsedJson = JSON.parse(answer.answer_json);
      const index = typeof parsedJson === 'number' ? parsedJson : (parsedJson.answer !== undefined ? parsedJson.answer : parsedJson.index);
      if (typeof index === 'number') {
        selectedOption = displayOptions[index];
      }
    } catch (e) { }
  }

  // Result logic
  const isCorrectResult = selectedOption ? selectedOption.isCorrect : false;

  // Audio setup
  const audioUrl = structuredData?.audioUrl || question.media_url || question.audio_url;
  const fullAudioUrl = getAssetUrl(audioUrl);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Box>
      {/* Audio player */}
      {fullAudioUrl && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <VolumeUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Listen to the audio
            </Typography>

            <audio
              ref={audioRef}
              src={fullAudioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              style={{ display: 'none' }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={handlePlayPause}
                color="primary"
                size="large"
                sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{formatTime(currentTime)}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{formatTime(duration)}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Main instruction */}
      <Paper sx={{ p: 3, mb: 2, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {structuredData?.instruction || "Listen to the audio and answer the question."}
        </Typography>
        {structuredData?.questionText && (
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
            {structuredData.questionText}
          </Typography>
        )}
      </Paper>

      {/* Transcript */}
      {structuredData?.transcript?.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50', border: '1px dashed grey.400' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
            Transcript
          </Typography>
          <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1 }}>
            {structuredData.transcript.map((line, idx) => (
              <Typography key={idx} variant="body2" sx={{ mb: 1.5, fontStyle: 'italic', lineHeight: 1.5 }}>
                {line}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      {/* Options list */}
      <List sx={{ p: 0 }}>
        {displayOptions.map((option, index) => {
          const isUserSelected = selectedOption && String(selectedOption.id) === String(option.id);
          const isRight = option.isCorrect;

          let itemBgColor = 'transparent';
          let itemBorderColor = 'divider';

          if (isUserSelected) {
            itemBgColor = isRight ? 'success.100' : 'error.100';
            itemBorderColor = isRight ? 'success.main' : 'error.main';
          } else if (isRight && showCorrectAnswer) {
            itemBgColor = 'success.50';
            itemBorderColor = 'success.light';
          }

          return (
            <ListItem key={option.id} sx={{
              bgcolor: itemBgColor,
              border: '1px solid',
              borderColor: itemBorderColor,
              borderRadius: 1.5,
              mb: 1,
              px: 2,
              py: 1.5
            }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {isUserSelected ? (
                  isRight ? <CheckCircle color="success" /> : <Cancel color="error" />
                ) : (
                  isRight && showCorrectAnswer ? <CheckCircle color="success" sx={{ opacity: 0.5 }} /> : null
                )}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: isUserSelected || (isRight && showCorrectAnswer) ? 700 : 400 }}>
                    <span style={{ marginRight: '8px', opacity: 0.7 }}>{String.fromCharCode(65 + index)}.</span>
                    {option.text}
                  </Typography>
                }
                secondary={
                  isUserSelected ? (
                    <Typography variant="caption" color={isRight ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
                      Your answer {isRight ? '(Correct)' : '(Incorrect)'}
                    </Typography>
                  ) : (
                    isRight && showCorrectAnswer ? (
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                        Correct answer
                      </Typography>
                    ) : null
                  )
                }
              />
            </ListItem>
          );
        })}
      </List>

      {/* Result summary */}
      <Paper sx={{
        p: 2,
        mt: 2,
        borderRadius: 2,
        bgcolor: isCorrectResult ? 'success.50' : 'error.50',
        border: '2px solid',
        borderColor: isCorrectResult ? 'success.light' : 'error.light'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {isCorrectResult ? <CheckCircle color="success" /> : <Cancel color="error" />}
          <Typography variant="subtitle1" fontWeight="700">
            Result: {isCorrectResult ? 'Correct' : 'Incorrect'}
          </Typography>
        </Box>

        {selectedOption ? (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Your answer: <strong>{String.fromCharCode(65 + displayOptions.indexOf(selectedOption))}. {selectedOption.text}</strong>
          </Typography>
        ) : (
          <Typography variant="body2" color="error.dark" sx={{ mb: 0.5 }}>
            No answer selected
          </Typography>
        )}

        {showCorrectAnswer && !isCorrectResult && (
          <Typography variant="body2" color="success.dark">
            Correct answer(s): <strong>
              {displayOptions
                .filter(opt => opt.isCorrect)
                .map(opt => `${String.fromCharCode(65 + displayOptions.indexOf(opt))}. ${opt.text}`)
                .join(', ')}
            </strong>
          </Typography>
        )}
      </Paper>
    </Box>
  );
}