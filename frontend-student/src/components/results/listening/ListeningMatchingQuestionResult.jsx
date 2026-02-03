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
  VolumeUp,
  Speaker
} from '@mui/icons-material';
import { getAssetUrl } from '@/services/api';

export default function ListeningMatchingQuestionResult({ answer, question, showCorrectAnswer = true }) {
  const [isPlaying, setIsPlaying] = useState({});
  const audioRefs = useRef({});

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

  // Parse JSON content for fallback correct answers
  const contentData = useMemo(() => {
    try {
      if (!question.content) return null;
      return typeof question.content === 'string' ? JSON.parse(question.content) : question.content;
    } catch (e) {
      return null;
    }
  }, [question.content]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.item_order || 0) - (b.item_order || 0));
  }, [items]);

  const handlePlayPause = (itemId, url) => {
    const audio = audioRefs.current[itemId];
    if (!audio) return;

    if (isPlaying[itemId]) {
      audio.pause();
    } else {
      // Pause all other audios
      Object.keys(audioRefs.current).forEach(id => {
        if (id !== String(itemId) && audioRefs.current[id]) {
          audioRefs.current[id].pause();
        }
      });
      audio.play();
    }

    setIsPlaying(prev => ({
      ...Object.keys(prev).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
      [itemId]: !prev[itemId]
    }));
  };

  const getAudioUrl = (item) => {
    let url = item.media_url || item.audio_url || question.media_url || question.audio_url;
    return getAssetUrl(url);
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.50', borderLeft: '4px solid', borderColor: 'info.main' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {contentData?.instructions || contentData?.instruction || "Listen to the speakers and match them with the correct options."}
        </Typography>
      </Paper>

      {/* Available options legend */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
          Available Options:
        </Typography>
        <Grid container spacing={1}>
          {options.map((option, idx) => (
            <Grid item xs={12} sm={6} md={4} key={option.id}>
              <Box sx={{ display: 'flex', gap: 1, p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {String.fromCharCode(65 + idx)}.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.option_text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {sortedItems.map((item, index) => {
          const audioUrl = getAudioUrl(item);
          // Permissive matching for user answer
          const ansKey = item.id ? String(item.id) : String(index);
          const userAnswerVal = userAnswers[ansKey] !== undefined ? userAnswers[ansKey] : (userAnswers[index] !== undefined ? userAnswers[index] : undefined);

          const selectedOption = options.find(opt =>
            (userAnswerVal !== undefined && userAnswerVal !== null && opt.id && String(opt.id) === String(userAnswerVal)) ||
            (typeof userAnswerVal === 'object' && userAnswerVal !== null && String(opt.id) === String(userAnswerVal?.id)) ||
            (typeof userAnswerVal === 'number' && options.indexOf(opt) === userAnswerVal) ||
            (typeof userAnswerVal === 'string' && userAnswerVal !== '' && !isNaN(parseInt(userAnswerVal)) && options.indexOf(opt) === parseInt(userAnswerVal))
          );

          // Correct answer detection (DB or JSON fallback)
          const findCorrectOption = () => {
            // 1. Direct DB link
            if (item.correct_option_id) {
              return options.find(opt => String(opt.id) === String(item.correct_option_id));
            }
            // 2. JSON Match (Speaker -> Statement)
            if (contentData?.statements && Array.isArray(contentData.statements)) {
              // If it's Part 2, items are speakers, options are statements
              // If this item is "Speaker A", find statement in JSON where speaker is "Speaker A"
              const itemText = (item.item_text || item.content || "").toLowerCase();
              const match = contentData.statements.find(s =>
                (s.speaker && s.speaker.toLowerCase().includes(itemText)) ||
                (itemText.includes(s.speaker?.toLowerCase()))
              );
              if (match) {
                return options.find(opt => (opt.option_text === match.text));
              }
            }
            return null;
          };

          const correctOption = findCorrectOption();
          const isCorrect = selectedOption && correctOption && String(selectedOption.id) === String(correctOption.id);
          const userLabel = selectedOption ? String.fromCharCode(65 + options.indexOf(selectedOption)) : null;
          const correctLabel = correctOption ? String.fromCharCode(65 + options.indexOf(correctOption)) : null;

          return (
            <Paper key={item.id} sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {index + 1}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {item.item_text || `Speaker ${index + 1}`}
                      </Typography>
                      {audioUrl && (
                        <IconButton
                          onClick={() => handlePlayPause(item.id, audioUrl)}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: isPlaying[item.id] ? 'error.50' : 'success.50',
                            '&:hover': { bgcolor: isPlaying[item.id] ? 'error.100' : 'success.100' }
                          }}
                        >
                          {isPlaying[item.id] ? <Pause fontSize="small" color="error" /> : <PlayArrow fontSize="small" color="success" />}
                          <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700, color: isPlaying[item.id] ? 'error.main' : 'success.main' }}>
                            {isPlaying[item.id] ? 'Playing' : 'Play Audio'}
                          </Typography>
                          <audio
                            ref={el => audioRefs.current[item.id] = el}
                            src={audioUrl}
                            onEnded={() => setIsPlaying(prev => ({ ...prev, [item.id]: false }))}
                            style={{ display: 'none' }}
                          />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                      <Box sx={{
                        flex: 1,
                        maxWidth: '400px',
                        px: 3, py: 1.5, borderRadius: 2,
                        bgcolor: selectedOption ? (isCorrect ? 'success.50' : 'error.50') : 'grey.50',
                        border: '1px solid',
                        borderColor: selectedOption ? (isCorrect ? 'success.main' : 'error.main') : 'grey.300',
                        display: 'flex', alignItems: 'center', gap: 1.5
                      }}>
                        {userLabel && (
                          <Chip
                            label={userLabel}
                            size="small"
                            color={isCorrect ? "success" : "error"}
                            sx={{ fontWeight: 800, borderRadius: 1 }}
                          />
                        )}
                        <Typography variant="body2" sx={{
                          fontWeight: 600,
                          color: selectedOption ? 'text.primary' : 'text.disabled',
                          flexShrink: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {selectedOption?.option_text || 'Not answered'}
                        </Typography>
                      </Box>
                      {selectedOption && (isCorrect ? <CheckCircle color="success" sx={{ fontSize: '2rem' }} /> : <Cancel color="error" sx={{ fontSize: '2rem' }} />)}
                    </Box>

                    {showCorrectAnswer && !isCorrect && correctOption && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', mr: 5 }}>
                        <Typography variant="caption" color="success.dark" sx={{ fontWeight: 700 }}>
                          Correct Answer:
                        </Typography>
                        <Typography variant="caption" sx={{
                          fontWeight: 700,
                          color: 'success.dark',
                          bgcolor: 'success.100',
                          px: 1.5, py: 0.75,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'success.light'
                        }}>
                          {correctLabel}. {correctOption.option_text}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
      </Box>

      <Divider sx={{ my: 4 }} />
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Final Score:</Typography>
        <Chip
          label={`${sortedItems.filter(item => {
            const index = sortedItems.indexOf(item);
            const ansKey = item.id ? String(item.id) : String(index);
            const uaId = userAnswers[ansKey] || userAnswers[index];
            const sel = options.find(o => String(o.id) === String(uaId) || (typeof uaId === 'number' && options.indexOf(o) === uaId));

            const findC = () => {
              if (item.correct_option_id) return options.find(o => String(o.id) === String(item.correct_option_id));
              const itemText = (item.item_text || item.content || "").toLowerCase();
              const match = contentData?.statements?.find?.(s => (s.speaker && s.speaker.toLowerCase().includes(itemText)) || (itemText.includes(s.speaker?.toLowerCase())));
              return match ? options.find(o => o.option_text === match.text) : null;
            };
            const cor = findC();
            return sel && cor && String(sel.id) === String(cor.id);
          }).length} / ${sortedItems.length} Correct`}
          color="primary"
          sx={{ fontWeight: 800, fontSize: '1rem', height: 40, px: 2 }}
        />
      </Box>
    </Box>
  );
}