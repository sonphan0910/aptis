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

export default function ListeningMultiMCQQuestionResult({ answer, question, showCorrectAnswer = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Parse user answers from answer_json
  const userAnswers = useMemo(() => {
    try {
      if (!answer.answer_json) return {};
      const parsed = typeof answer.answer_json === 'string' ? JSON.parse(answer.answer_json) : answer.answer_json;
      if (Array.isArray(parsed)) {
        return parsed.reduce((acc, val, idx) => {
          acc[idx] = val;
          return acc;
        }, {});
      }
      return parsed || {};
    } catch (e) {
      console.error('Error parsing answer_json', e);
      return {};
    }
  }, [answer.answer_json]);

  // Parse structured data from question content
  const structuredData = useMemo(() => {
    try {
      const parsed = typeof question.content === 'string' ? JSON.parse(question.content) : question.content;
      if (parsed && typeof parsed === 'object' && (parsed.questions || parsed.items)) {
        const questionsSource = parsed.questions || parsed.items;
        return {
          instructions: parsed.instructions || parsed.instruction || parsed.title || "Listen to the audio and answer all questions.",
          transcript: parsed.transcript || [],
          audioUrl: parsed.audioUrl || question.media_url || question.audio_url,
          questions: questionsSource.map((q, idx) => {
            // Determine correct index from JSON
            let correctIdx = -1;
            if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
              if (typeof q.correctAnswer === 'string' && /^[A-E]$/i.test(q.correctAnswer)) {
                correctIdx = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;
              } else {
                correctIdx = parseInt(q.correctAnswer);
              }
            }

            return {
              text: q.question || q.text || `Question ${idx + 1}`,
              correctIdx: correctIdx,
              options: (q.options || []).map((opt, optIdx) => ({
                text: opt.option_text || opt.text || opt,
                // Primary source: explicit flag. Fallback: index match.
                // WE REMOVED +1 logic to prevent double correct answers.
                isCorrect: !!(opt.is_correct || opt.correct || (correctIdx === optIdx))
              }))
            };
          })
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [question.content, question.media_url, question.audio_url]);

  // Unified items and options for rendering - Merge DB and JSON
  const itemsToRender = useMemo(() => {
    const dbItems = [...(question.items || [])].sort((a, b) => (a.item_order || 0) - (b.item_order || 0));
    const allDbOptions = question.options || [];

    if (dbItems.length > 0) {
      return dbItems.map((item, idx) => {
        let subOptions = allDbOptions.filter(opt => String(opt.item_id) === String(item.id));
        if (subOptions.length === 0 && allDbOptions.length > 0) {
          const optionsPerItem = Math.floor(allDbOptions.length / dbItems.length);
          const startIdx = idx * optionsPerItem;
          subOptions = allDbOptions.slice(startIdx, startIdx + optionsPerItem);
        }

        const jsonQ = structuredData?.questions?.[idx];

        return {
          id: item.id,
          text: item.item_text || jsonQ?.text || `Question ${idx + 1}`,
          options: subOptions.map((opt, optIdx) => {
            // A choice is correct if DB says so OR if JSON metadata for this specific index says so
            const isJsonCorrect = jsonQ?.options?.[optIdx]?.isCorrect;
            return {
              id: opt.id,
              text: opt.option_text || jsonQ?.options?.[optIdx]?.text || `Option ${optIdx + 1}`,
              isCorrect: !!(opt.is_correct || isJsonCorrect)
            };
          }),
          index: idx
        };
      });
    }

    // Fallback if no DB items/options exist (fully dynamic JSON question)
    if (structuredData) {
      return structuredData.questions.map((q, idx) => ({
        id: `json-q-${idx}`,
        text: q.text,
        options: q.options.map((opt, optIdx) => ({
          id: `json-opt-${idx}-${optIdx}`,
          text: opt.text,
          isCorrect: opt.isCorrect,
          index: optIdx
        })),
        index: idx
      }));
    }

    return [];
  }, [question.items, question.options, structuredData]);

  // Audio configuration
  const audioUrl = structuredData?.audioUrl || question.media_url || question.audio_url;
  const fullAudioUrl = getAssetUrl(audioUrl);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      {/* Audio card */}
      {fullAudioUrl && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <VolumeUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Listen to the audio
            </Typography>
            <audio ref={audioRef} src={fullAudioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} style={{ display: 'none' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handlePlayPause} color="primary" size="large" sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress variant="determinate" value={duration > 0 ? (currentTime / duration) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{formatTime(currentTime)}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{formatTime(duration)}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 3, mb: 2, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {structuredData?.instructions || "Listen to the audio and answer the questions."}
        </Typography>
      </Paper>

      {/* Questions mapping */}
      {itemsToRender.map((item, itemIdx) => {
        const userAnswerVal = userAnswers[item.id] !== undefined ? userAnswers[item.id] : (userAnswers[itemIdx] !== undefined ? userAnswers[itemIdx] : userAnswers[String(itemIdx)]);

        const selectedOption = item.options.find(opt =>
          (userAnswerVal !== undefined && userAnswerVal !== null && opt.id && String(opt.id) === String(userAnswerVal)) ||
          (typeof userAnswerVal === 'object' && userAnswerVal !== null && String(opt.id) === String(userAnswerVal?.id)) ||
          (typeof userAnswerVal === 'number' && item.options.indexOf(opt) === userAnswerVal) ||
          (typeof userAnswerVal === 'string' && userAnswerVal !== '' && !isNaN(parseInt(userAnswerVal)) && item.options.indexOf(opt) === parseInt(userAnswerVal))
        );

        const isCorrectResult = selectedOption ? !!selectedOption.isCorrect : false;

        return (
          <Box key={item.id} sx={{ mb: 3 }}>
            <Paper sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isCorrectResult ? 'success.50' : (selectedOption ? 'error.50' : 'grey.50'),
              border: '2px solid',
              borderColor: isCorrectResult ? 'success.light' : (selectedOption ? 'error.light' : 'grey.200'),
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1, fontSize: '1.1rem', fontWeight: 700 }}>
                  Question {itemIdx + 1}: {item.text}
                </Typography>
                <Box>
                  {selectedOption ? (isCorrectResult ? <CheckCircle color="success" sx={{ fontSize: '2rem' }} /> : <Cancel color="error" sx={{ fontSize: '2rem' }} />)
                    : <Typography variant="caption" color="text.disabled">Not answered</Typography>}
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                {item.options.map((option, optIdx) => {
                  const isUserChosen = selectedOption && String(selectedOption.id) === String(option.id);
                  const isRight = !!option.isCorrect;
                  const itemBgColor = isUserChosen ? (isRight ? 'success.100' : 'error.100') : (isRight && showCorrectAnswer ? 'success.50' : 'transparent');
                  const itemBorderColor = isUserChosen ? (isRight ? 'success.main' : 'error.main') : (isRight && showCorrectAnswer ? 'success.light' : 'divider');

                  return (
                    <ListItem key={option.id} sx={{ bgcolor: itemBgColor, border: '1px solid', borderColor: itemBorderColor, borderRadius: 1.5, mb: 1, px: 2, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {isUserChosen ? (isRight ? <CheckCircle color="success" /> : <Cancel color="error" />) : (isRight && showCorrectAnswer ? <CheckCircle color="success" sx={{ opacity: 0.5 }} /> : null)}
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body1" sx={{ fontWeight: isUserChosen || (isRight && showCorrectAnswer) ? 700 : 400 }}><span style={{ marginRight: '8px', opacity: 0.7 }}>{String.fromCharCode(65 + optIdx)}.</span>{option.text}</Typography>}
                        secondary={isUserChosen ? <Typography variant="caption" color={isRight ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>Your answer {isRight ? '(Correct)' : '(Incorrect)'}</Typography>
                          : (isRight && showCorrectAnswer ? <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>Correct answer</Typography> : null)}
                      />
                    </ListItem>
                  );
                })}
              </List>

              <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Answered:</strong> {selectedOption ? `${String.fromCharCode(65 + item.options.indexOf(selectedOption))}. ${selectedOption.text}` : 'Not answered'}
                </Typography>
                <Chip label={isCorrectResult ? 'CORRECT' : 'INCORRECT'} size="small" color={isCorrectResult ? 'success' : 'error'} sx={{ fontWeight: 700, borderRadius: 1 }} />
              </Box>
            </Paper>
          </Box>
        );
      })}

      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Section Summary:</Typography>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
          {itemsToRender.filter((item, idx) => {
            const val = userAnswers[item.id] || userAnswers[idx] || userAnswers[String(idx)];
            const sel = item.options.find(opt => (opt.id && String(opt.id) === String(val)) || (typeof val === 'number' && item.options.indexOf(opt) === val));
            return sel && sel.isCorrect;
          }).length} / {itemsToRender.length} Correct
        </Typography>
      </Box>
    </Box>
  );
}