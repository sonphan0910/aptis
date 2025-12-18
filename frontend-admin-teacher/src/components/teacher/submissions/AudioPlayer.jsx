'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeOff,
  Replay,
  SkipNext,
  SkipPrevious,
  Download,
  Speed
} from '@mui/icons-material';

export default function AudioPlayer({ 
  src, 
  onTimeUpdate, 
  onPlay,
  onPause,
  onEnded,
  autoplay = false,
  showControls = true,
  showDownload = false 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setLoading(true);
    const handleLoadedData = () => {
      setLoading(false);
      setDuration(audio.duration);
      setError(null);
    };
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };
    const handleError = (e) => {
      setLoading(false);
      setError('Không thể tải audio');
      console.error('Audio error:', e);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onPlay, onPause, onEnded]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Play error:', error);
        setError('Không thể phát audio');
      });
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const seek = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSeekChange = (event, value) => {
    seek(value);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (event, value) => {
    setVolume(value / 100);
    setIsMuted(value === 0);
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipBackward = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    seek(Math.min(duration, currentTime + 10));
  };

  const downloadAudio = () => {
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `audio_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!src) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100' }}>
        <Typography color="text.secondary">
          Không có file audio
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.50' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        autoPlay={autoplay}
      />

      {loading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {showControls && !loading && (
        <Box>
          {/* Progress Slider */}
          <Box mb={2}>
            <Slider
              value={currentTime}
              max={duration || 100}
              onChange={handleSeekChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatTime}
              sx={{ height: 8 }}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption">
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption">
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>

          {/* Main Controls */}
          <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
            <Tooltip title="Lui 10s">
              <IconButton onClick={skipBackward} disabled={loading}>
                <SkipPrevious />
              </IconButton>
            </Tooltip>

            <Tooltip title={isPlaying ? "Tạm dừng" : "Phát"}>
              <IconButton 
                onClick={togglePlay} 
                disabled={loading}
                color="primary"
                size="large"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Dừng">
              <IconButton onClick={stop} disabled={loading}>
                <Stop />
              </IconButton>
            </Tooltip>

            <Tooltip title="Tiến 10s">
              <IconButton onClick={skipForward} disabled={loading}>
                <SkipNext />
              </IconButton>
            </Tooltip>

            <Tooltip title="Phát lại">
              <IconButton onClick={() => seek(0)} disabled={loading}>
                <Replay />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Secondary Controls */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Volume Control */}
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <IconButton onClick={toggleMute} size="small">
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <Slider
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                sx={{ width: 80 }}
                size="small"
              />
            </Box>

            {/* Playback Speed */}
            <Box display="flex" alignItems="center" gap={1}>
              <Speed fontSize="small" />
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                style={{ border: 'none', outline: 'none', fontSize: '12px' }}
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </Box>

            {/* Download Button */}
            {showDownload && (
              <Tooltip title="Tải xuống">
                <IconButton onClick={downloadAudio} size="small">
                  <Download />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}