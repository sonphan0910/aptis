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
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  PlayArrow,
  Pause,
  VolumeUp
} from '@mui/icons-material';
import { getAssetUrl } from '@/services/api';

export default function ListeningStatementMatchingQuestionResult({ answer, question, showCorrectAnswer = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Parse user answers from answer_json with robustness
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

  const items = question.items || [];
  const options = question.options || [];

  // Parse JSON content for fallback
  const contentData = useMemo(() => {
    try {
      if (!question.content) return null;
      return typeof question.content === 'string' ? JSON.parse(question.content) : question.content;
    } catch (e) {
      return null;
    }
  }, [question.content]);

  // Audio configuration
  const audioUrl = question.media_url || question.audio_url || contentData?.audioUrl;
  const fullAudioUrl = getAssetUrl(audioUrl);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.item_order || 0) - (b.item_order || 0));
  }, [items]);

  const instructionText = contentData?.instructions || contentData?.instruction || "Listen to the conversation and decide which speaker said each statement.";

  return (
    <Box>
      {/* Audio player */}
      {fullAudioUrl && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <VolumeUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Listen to the conversation
            </Typography>
            <audio ref={audioRef} src={fullAudioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} style={{ display: 'none' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handlePlayPause} color="primary" size="large" sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.100' } }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress variant="determinate" value={duration > 0 ? (currentTime / duration) * 100 : 0} sx={{ height: 8, borderRadius: 4 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>{Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {instructionText}
        </Typography>
      </Paper>

      {/* Speaker Options Legend */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f1f3f4', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Possible Speakers:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {options.map((option) => (
            <Chip key={option.id} label={option.option_text} variant="outlined" sx={{ bgcolor: 'white', fontWeight: 600, border: '1.5px solid #ccc' }} />
          ))}
        </Box>
      </Paper>

      {/* Statements list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sortedItems.map((item, index) => {
          const ansKey = item.id ? String(item.id) : String(index);
          const userAnswerId = userAnswers[ansKey] !== undefined ? userAnswers[ansKey] : userAnswers[index];
          const selectedOption = options.find(opt =>
            (userAnswerId !== undefined && userAnswerId !== null && String(opt.id) === String(userAnswerId)) ||
            (typeof userAnswerId === 'number' && options.indexOf(opt) === userAnswerId)
          );

          // Correct answer detection (DB or JSON fallback)
          const findCorrectOption = () => {
            if (item.correct_option_id) {
              return options.find(opt => String(opt.id) === String(item.correct_option_id));
            }
            if (contentData?.statements && Array.isArray(contentData.statements)) {
              // Statements in JSON match items in DB
              const itemText = (item.item_text || item.content || "").toLowerCase();
              const match = contentData.statements.find(s =>
                (s.text && s.text.toLowerCase().includes(itemText)) ||
                (itemText.includes(s.text?.toLowerCase()))
              );
              if (match && match.speaker) {
                return options.find(opt => opt.option_text.toLowerCase() === match.speaker.toLowerCase());
              }
            }
            return null;
          };

          const correctOption = findCorrectOption();
          const isCorrect = selectedOption && correctOption && String(selectedOption.id) === String(correctOption.id);

          return (
            <Paper key={item.id} sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: isCorrect ? 'success.50' : (selectedOption ? 'error.50' : 'grey.50'),
              border: '2px solid',
              borderColor: isCorrect ? 'success.light' : (selectedOption ? 'error.light' : 'grey.200'),
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={7}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.dark' }}>{index + 1}.</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{item.item_text}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end' }}>
                    <Box sx={{
                      flex: 1, maxWidth: '180px', px: 2, py: 1.2, borderRadius: 1.5, bgcolor: 'white', border: '1.5px solid',
                      borderColor: isCorrect ? 'success.main' : (selectedOption ? 'error.main' : 'grey.300'),
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: selectedOption ? 'text.primary' : 'text.disabled' }}>
                        {selectedOption?.option_text || 'No answer'}
                      </Typography>
                    </Box>
                    {selectedOption && (isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />)}
                  </Box>
                  {showCorrectAnswer && !isCorrect && correctOption && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', mr: 4 }}>
                      <Typography variant="caption" color="success.dark" sx={{ fontWeight: 700 }}>Correct:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.dark', bgcolor: 'success.100', px: 1.5, py: 0.5, borderRadius: 1, border: '1px solid', borderColor: 'success.light' }}>
                        {correctOption.option_text}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Box>

      {/* Summary Chips */}
      <Divider sx={{ my: 4 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Section Summary:</Typography>
        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
          {sortedItems.filter((item, idx) => {
            const ansKey = item.id ? String(item.id) : String(idx);
            const uaId = userAnswers[ansKey] || userAnswers[idx];
            const sel = options.find(o => String(o.id) === String(uaId) || (typeof uaId === 'number' && options.indexOf(o) === uaId));

            const findC = () => {
              if (item.correct_option_id) return options.find(o => String(o.id) === String(item.correct_option_id));
              const itemText = (item.item_text || item.content || "").toLowerCase();
              const match = contentData?.statements?.find?.(s => (s.text && s.text.toLowerCase().includes(itemText)) || (itemText.includes(s.text?.toLowerCase())));
              return (match && match.speaker) ? options.find(o => o.option_text.toLowerCase() === match.speaker.toLowerCase()) : null;
            };
            const cor = findC();
            return sel && cor && String(sel.id) === String(cor.id);
          }).length} / {sortedItems.length} Correct
        </Typography>
      </Box>
    </Box>
  );
}