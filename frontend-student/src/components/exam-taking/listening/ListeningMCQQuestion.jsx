'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Chip,
    Alert,
} from '@mui/material';
import {
    PlayArrow,
    Stop,
} from '@mui/icons-material';
import { useAudioPlay } from '@/contexts/AudioPlayContext';
import MCQQuestion from '../MCQQuestion';

/**
 * Listening MCQ Question Component
 * Handles multiple choice questions with audio playback
 */
export default function ListeningMCQQuestion({
    question,
    onAnswerChange
}) {

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const audioRef = useRef(null);
    // Use global audio play context
    const { getPlayCount, incrementPlayCount } = useAudioPlay();
    const questionId = question.id;
    const playCount = getPlayCount(questionId);

    // Reset audio state when question changes
    useEffect(() => {
        // Stop any playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Reset states
        setIsPlaying(false);
        setDuration(0);
        setCurrentTime(0);
    }, [question.id]);

    // Calculate audio URL directly
    const finalAudioUrl = useMemo(() => {
        // Check multiple possible paths for media_url depending on data structure
        const audioUrl =
            question.media_url ||
            question.question?.media_url || // Handle nested question object (common in attempt answers)
            question.question_content?.audio_url ||
            question.question_content?.media_url;

        // Fallback: Check additional_media (used in Part 4 and some mixed types)
        if (!audioUrl && question.question?.additional_media) {
            try {
                const additional = typeof question.question.additional_media === 'string'
                    ? JSON.parse(question.question.additional_media)
                    : question.question.additional_media;

                if (Array.isArray(additional)) {
                    const audioItem = additional.find(item => item.type === 'audio' && item.url);
                    if (audioItem) return getFullUrl(audioItem.url);
                }
            } catch (e) {
                console.warn('Error parsing additional_media', e);
            }
        }

        // Fallback: Check additional_media on root question object
        if (!audioUrl && question.additional_media) {
            try {
                const additional = typeof question.additional_media === 'string'
                    ? JSON.parse(question.additional_media)
                    : question.additional_media;

                if (Array.isArray(additional)) {
                    const audioItem = additional.find(item => item.type === 'audio' && item.url);
                    if (audioItem) return getFullUrl(audioItem.url);
                }
            } catch (e) {
                console.warn('Error parsing additional_media', e);
            }
        }

        if (!audioUrl) return null;

        return getFullUrl(audioUrl);
    }, [question, question.media_url, question.question, question.id, question.additional_media]);

    // Helper to resolve full URL
    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        return url.startsWith('/') ? `${serverUrl}${url}` : `${serverUrl}/${url}`;
    };

    const hasAudio = !!finalAudioUrl;

    const canPlay = playCount < 2;
    const canClickButton = playCount < 2 || isPlaying; // Allow stopping if audio is playing

    const handlePlayPause = () => {
        if (!canClickButton) return;

        if (audioRef.current) {
            if (isPlaying) {
                // Stop - don't count
                audioRef.current.pause();
                setIsPlaying(false);
            } else if (playCount < 2) {
                // Play only if we haven't hit the limit
                incrementPlayCount(questionId);
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
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

    const handleProgressClick = (e) => {
        const progressBar = e.currentTarget;
        const clickX = e.clientX - progressBar.getBoundingClientRect().left;
        const percentage = clickX / progressBar.offsetWidth;
        const newTime = percentage * duration;

        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };



    return (
        <Box>
            {/* Audio Player Section */}
            {hasAudio ? (
                <Paper
                    elevation={1}
                    sx={{
                        p: 3,
                        mb: 3,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        {/* Play/Pause Button */}
                        <IconButton
                            onClick={handlePlayPause}
                            disabled={!canClickButton}
                            sx={{
                                backgroundColor: canClickButton ? '#667eea' : '#ccc',
                                color: 'white',
                                border: 'none',
                                '&:hover': {
                                    backgroundColor: canClickButton ? '#5568d3' : '#bbb',
                                },
                                '&:disabled': {
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    backgroundColor: '#ccc'
                                },
                                width: 56,
                                height: 56,
                                flexShrink: 0
                            }}
                        >
                            {isPlaying ? (
                                <Stop sx={{ fontSize: '2rem' }} />
                            ) : (
                                <PlayArrow sx={{ fontSize: '2rem' }} />
                            )}
                        </IconButton>

                        {/* Progress Bar */}
                        <Box sx={{ flex: 1 }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 6,
                                    backgroundColor: '#ddd',
                                    borderRadius: 3,
                                    cursor: 'not-allowed',
                                    position: 'relative',
                                    mb: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        height: '100%',
                                        backgroundColor: '#667eea',
                                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                                        transition: isPlaying ? 'none' : 'width 0.1s'
                                    }}
                                />
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" fontWeight="bold" sx={{ color: '#666' }}>
                                    {formatTime(currentTime)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                    {formatTime(duration)}
                                </Typography>
                            </Box>
                        </Box>

                    </Box>

                    {/* Play Counter & Limit Warning */}
                    <Box mt={2} display="flex" alignItems="center" gap={2}>
                        <Chip
                            label={`${playCount}/2 Số lần phát đã dùng`}
                            size="small"
                            sx={{
                                backgroundColor: playCount < 2 ? '#e3f2fd' : '#ffebee',
                                color: playCount < 2 ? '#1976d2' : '#c62828',
                                border: '1px solid #ccc'
                            }}
                        />
                        {playCount >= 2 && (
                            <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                ⚠ Đã đạt số lượt phát tối đa
                            </Typography>
                        )}
                    </Box>

                    {/* Hidden Audio Element */}
                    <audio
                        ref={audioRef}
                        src={finalAudioUrl}
                        onEnded={handleAudioEnded}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        preload="metadata"
                    />
                </Paper>
            ) : (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    No audio file available for this question.
                </Alert>
            )}

            {/* Question Content */}
            <MCQQuestion
                question={{
                    ...question,
                    answer_data: question.answer_data || null
                }}
                onAnswerChange={onAnswerChange}
            />
        </Box>
    );
}
