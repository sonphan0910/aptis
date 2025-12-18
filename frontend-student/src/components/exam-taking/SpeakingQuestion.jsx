'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Delete,
  VolumeUp,
} from '@mui/icons-material';

export default function SpeakingQuestion({ question, onAnswerChange }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [preparationTime, setPreparationTime] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const preparationTimerRef = useRef(null);

  const requirements = question.question_content?.requirements || {};
  const maxRecordingTime = requirements.max_recording_time || 60; // seconds
  const preparationTimeLimit = requirements.preparation_time || 30; // seconds
  const hasPreparationTime = preparationTimeLimit > 0;

  useEffect(() => {
    if (question.answer_data?.audio_url) {
      setAudioUrl(question.answer_data.audio_url);
    }
  }, [question.answer_data]);

  // Reset all recording states when question changes
  useEffect(() => {
    return () => {
      // Stop any ongoing recording
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      // Clear timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (preparationTimerRef.current) {
        clearInterval(preparationTimerRef.current);
      }
    };
  }, [question.id, isRecording]);

  // Reset audio state when question ID changes
  useEffect(() => {
    // Check if this question has a saved answer
    if (question.answer_data?.audio_url) {
      setAudioUrl(question.answer_data.audio_url);
      setRecordingTime(question.answer_data.recording_duration || 0);
    } else {
      // Reset to empty state if no saved answer
      setAudioUrl('');
      setAudioBlob(null);
      setRecordingTime(0);
      setIsRecording(false);
      setIsPlaying(false);
      setIsPreparing(false);
      setPreparationTime(0);
      
      // Clear any active timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (preparationTimerRef.current) {
        clearInterval(preparationTimerRef.current);
      }
    }
  }, [question.id]);

  const startPreparation = () => {
    setIsPreparing(true);
    setPreparationTime(preparationTimeLimit);
    
    preparationTimerRef.current = setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          clearInterval(preparationTimerRef.current);
          setIsPreparing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Upload audio file to backend immediately
        uploadAudioToBackend(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxRecordingTime) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };
  
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const uploadAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `speaking_${question.id}_${Date.now()}.webm`);
      formData.append('question_id', question.id);

      const response = await fetch(`/api/student/attempts/${question.attemptId}/answers/audio`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Audio uploaded successfully:', result.data);
        // Notify parent component with server URL
        onAnswerChange({
          audio_url: result.data.audio_url,
          recording_duration: recordingTime
        });
      } else {
        console.error('Failed to upload audio:', result.message);
        alert('Lỗi tải lên audio. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi tải lên audio. Vui lòng thử lại.');
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
    onAnswerChange({ audio_url: null });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingProgress = () => {
    return (recordingTime / maxRecordingTime) * 100;
  };

  // Get appropriate title based on question type
  const getTitle = () => {
    const questionType = question.questionType?.code;
    switch (questionType) {
      case 'SPEAKING_INTRO':
        return 'Giới thiệu bản thân:';
      case 'SPEAKING_DESCRIPTION':
        return 'Mô tả hình ảnh:';
      case 'SPEAKING_COMPARISON':
        return 'So sánh và phân tích:';
      case 'SPEAKING_DISCUSSION':
        return 'Thảo luận chủ đề:';
      default:
        return 'Ghi âm câu trả lời:';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {getTitle()}
      </Typography>
      
      {/* Speaking requirements */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom>
          Yêu cầu:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {hasPreparationTime && (
            <Chip
              size="small"
              label={`Chuẩn bị: ${preparationTimeLimit}s`}
              variant="outlined"
            />
          )}
          <Chip
            size="small"
            label={`Ghi âm tối đa: ${maxRecordingTime}s`}
            variant="outlined"
          />
        </Box>
        
        {requirements.prompt && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Yêu cầu:</strong> {requirements.prompt}
          </Typography>
        )}
      </Paper>

      {/* Preparation Phase */}
      {hasPreparationTime && !isPreparing && !audioUrl && (
        <Paper sx={{ p: 3, mb: 2, textAlign: 'center', backgroundColor: 'warning.light' }}>
          <Typography variant="h6" gutterBottom>
            Thời gian chuẩn bị
          </Typography>
          <Typography variant="body2" paragraph>
            Bạn có {preparationTimeLimit} giây để chuẩn bị trước khi ghi âm.
          </Typography>
          <Button
            variant="contained"
            color="warning"
            onClick={startPreparation}
            startIcon={<VolumeUp />}
          >
            Bắt đầu chuẩn bị
          </Button>
        </Paper>
      )}

      {/* Preparation Timer */}
      {isPreparing && (
        <Paper sx={{ p: 3, mb: 2, textAlign: 'center', backgroundColor: 'warning.light' }}>
          <Typography variant="h4" gutterBottom color="warning.dark">
            {formatTime(preparationTime)}
          </Typography>
          <Typography variant="body1">
            Thời gian chuẩn bị còn lại
          </Typography>
          <LinearProgress
            variant="determinate"
            value={((preparationTimeLimit - preparationTime) / preparationTimeLimit) * 100}
            sx={{ mt: 1, height: 8, borderRadius: 4 }}
          />
        </Paper>
      )}

      {/* Recording Controls */}
      {!isPreparing && (
        <Paper sx={{ p: 3, mb: 2, textAlign: 'center' }}>
          {!isRecording && !audioUrl && (
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={startRecording}
              startIcon={<Mic />}
              sx={{ mb: 2 }}
            >
              Bắt đầu ghi âm
            </Button>
          )}
          
          {isRecording && (
            <Box>
              <Typography variant="h4" gutterBottom color="error.main">
                {formatTime(recordingTime)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Đang ghi âm... (Tối đa: {formatTime(maxRecordingTime)})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getRecordingProgress()}
                color="error"
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={stopRecording}
                startIcon={<Stop />}
              >
                Dừng ghi âm
              </Button>
            </Box>
          )}
          
          {audioUrl && !isRecording && (
            <Box>
              <Typography variant="h6" gutterBottom color="success.main">
                ✓ Đã ghi âm ({formatTime(recordingTime)})
              </Typography>
              
              <Box display="flex" justifyContent="center" gap={1} mb={2}>
                <IconButton
                  onClick={isPlaying ? pauseAudio : playAudio}
                  color="primary"
                  size="large"
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                
                <IconButton
                  onClick={deleteRecording}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
              
              <Button
                variant="outlined"
                onClick={() => {
                  deleteRecording();
                  setRecordingTime(0);
                }}
                startIcon={<Mic />}
              >
                Ghi lại
              </Button>
              
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />
            </Box>
          )}
        </Paper>
      )}
      
      {/* Speaking tips */}
      <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Gợi ý nói:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
          <li>Nói rõ ràng và với tốc độ vừa phải</li>
          <li>Sử dụng thời gian chuẩn bị để lên dàn ý</li>
          <li>Trả lời đúng trọng tâm câu hỏi</li>
          <li>Sử dụng từ vựng và cấu trúc đa dạng</li>
          <li>Đảm bảo microphone hoạt động tốt</li>
        </Typography>
      </Paper>
    </Box>
  );
}