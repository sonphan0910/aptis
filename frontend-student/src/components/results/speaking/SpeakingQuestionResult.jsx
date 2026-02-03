'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Download,
  Mic,
  Timer
} from '@mui/icons-material';

export default function SpeakingQuestionResult({ answer, question, feedback = null }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Build full URL for audio file
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  const audioUrl = answer.audio_url
    ? (answer.audio_url.startsWith('http')
      ? answer.audio_url
      : `${backendUrl}${answer.audio_url}`)
    : null;

  const transcription = answer.transcribed_text || answer.transcription || '';

  // Get question type specific info
  const questionType = question.questionType?.type_name || '';
  const preparationTime = getPreparationTime(questionType);
  const recordingTime = getRecordingTime(questionType);

  function getPreparationTime(type) {
    const times = {
      'SPEAKING_INTRO': 10,
      'SPEAKING_DESCRIPTION': 15,
      'SPEAKING_COMPARISON': 20,
      'SPEAKING_DISCUSSION': 60
    };
    return times[type] || 0;
  }

  function getRecordingTime(type) {
    const times = {
      'SPEAKING_INTRO': 45,
      'SPEAKING_DESCRIPTION': 60,
      'SPEAKING_COMPARISON': 90,
      'SPEAKING_DISCUSSION': 120
    };
    return times[type] || 60;
  }

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


  const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
    return `${baseUrl}${cleanPath}`;
  };

  const parentQuestion = question.parentQuestion;
  // Determine which media to show: Parent's media takes precedence for sub-questions
  const mediaSource = parentQuestion || question;

  // Parse additional_media if it exists
  let additionalMedia = mediaSource.additional_media;
  if (typeof additionalMedia === 'string') {
    try {
      additionalMedia = JSON.parse(additionalMedia);
    } catch (e) {
      console.error('Failed to parse additional_media', e);
      additionalMedia = null;
    }
  }

  // Handle content with newlines
  const formattedContent = question.content?.replace(/\\n/g, '\n');

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Box>
      {/* Question prompt and media */}
      <Paper sx={{ p: 3, mb: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, mb: 2 }}>
          {formattedContent}
        </Typography>

        {/* Media Rendering - Only show for main questions (not child questions) */}
        {!parentQuestion && additionalMedia && Array.isArray(additionalMedia) && additionalMedia.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <Grid container spacing={2}>
              {additionalMedia.map((media, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box>
                    {media.description && (
                      <Typography variant="caption" display="block" color="text.secondary" fontWeight="bold">
                        {media.description}
                      </Typography>
                    )}
                    {media.type === 'image' && (
                      <img
                        src={getAssetUrl(media.url)}
                        alt={media.description || 'Question Image'}
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px', border: '1px solid #ddd' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Load+Error'; }}
                      />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : !parentQuestion && mediaSource.media_url ? (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img
              src={getAssetUrl(mediaSource.media_url)}
              alt="Question Media"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
            />
          </Box>
        ) : null}

        {/* Question type and timing info */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip
            icon={<Timer />}
            label={`Prep: ${preparationTime}s`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<Mic />}
            label={`Record: ${recordingTime}s`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={questionType.replace('SPEAKING_', '').replace('_', ' ')}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Paper>


      {/* Audio player */}
      {audioUrl && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <VolumeUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Your Recording
            </Typography>

            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
              style={{ display: 'none' }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconButton
                onClick={handlePlayPause}
                color="primary"
                size="large"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">{formatTime(currentTime)}</Typography>
                  <Typography variant="caption">{formatTime(duration)}</Typography>
                </Box>
              </Box>

              <IconButton
                component="a"
                href={audioUrl}
                download
                color="primary"
              >
                <Download />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* No audio message */}
      {!audioUrl && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.main' }}>
          <Typography variant="body1" color="warning.dark">
            No audio recording found for this question.
          </Typography>
        </Paper>
      )}

      {/* Transcription */}
      {transcription && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Transcription:</Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {transcription}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Teacher Feedback */}
      {answer.manual_feedback && (
        <Card sx={{ mt: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              👨‍🏫 Teacher Review
            </Typography>
            {answer.final_score !== null && (
              <Chip
                label={`Score: ${answer.final_score}/${question.max_score || answer.max_score || 10}`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#1565c0',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
                size="medium"
              />
            )}
          </Box>
          <CardContent sx={{ bgcolor: '#f8faff', p: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary', mb: 2 }}>
              {answer.manual_feedback}
            </Typography>
            {answer.reviewed_at && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, borderTop: '1px solid #e3e8ef' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  📅 Reviewed on: {new Date(answer.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Feedback */}
      {feedback ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🤖 AI Feedback
            {feedback.score !== undefined && <Chip label={`Score: ${feedback.score}/5`} color="secondary" size="small" />}
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.main' }}>
            {feedback.feedback && (
              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight="bold">Comments:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                  {feedback.feedback}
                </Typography>
              </Box>
            )}

            {feedback.comment && (
              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight="bold">Detailed Analysis:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {feedback.comment}
                </Typography>
              </Box>
            )}

            {feedback.suggestions && (
              <Box mt={2}>
                <Typography variant="subtitle2" fontWeight="bold">Suggestions for Improvement:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                  {feedback.suggestions}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      ) : (!answer.score && answer.score !== 0 && !answer.ai_feedback && !answer.ai_graded_at && !answer.manual_feedback) ? (
        <Box sx={{ mt: 2 }}>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', border: '1px dashed grey' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Scoring is pending or not available for this question.
            </Typography>
          </Paper>
        </Box>
      ) : null}
    </Box>
  );
}