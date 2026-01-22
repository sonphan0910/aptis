'use client';

import { 
  Box, 
  Typography, 
  Chip, 
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Grid
} from '@mui/material';
import { 
  CheckCircle,
  Cancel,
  VolumeUp,
  TextFields,
  FormatAlignJustify,
  RadioButtonChecked
} from '@mui/icons-material';

/**
 * Component hiển thị chi tiết câu trả lời của học sinh
 */
export default function DetailedAnswerRenderer({ question, answer }) {
  if (!answer) {
    return (
      <Alert severity="info">
        Học sinh chưa trả lời câu hỏi này
      </Alert>
    );
  }

  const questionType = question?.questionType || question?.question_type;
  const questionTypeCode = questionType?.code || '';
  const answerType = answer.answer_type;

  // Parse JSON answer if exists
  let parsedAnswerJson = null;
  try {
    if (answer.answer_json && typeof answer.answer_json === 'string') {
      parsedAnswerJson = JSON.parse(answer.answer_json);
    } else if (answer.answer_json && typeof answer.answer_json === 'object') {
      parsedAnswerJson = answer.answer_json;
    }
  } catch (e) {
    console.warn('Could not parse answer JSON:', e);
  }

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <FormatAlignJustify sx={{ mr: 1 }} />
          Câu trả lời của học sinh
        </Typography>

        {/* Answer Type Badge */}
        <Box mb={2}>
          <Chip 
            label={getAnswerTypeLabel(answerType)}
            color={getAnswerTypeColor(answerType)}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Render different answer types */}
        {answerType === 'text' && answer.text_answer && (
          <TextAnswerRenderer answer={answer} question={question} />
        )}

        {answerType === 'audio' && answer.audio_url && (
          <AudioAnswerRenderer answer={answer} question={question} />
        )}

        {answerType === 'option' && answer.selected_option_id && (
          <OptionAnswerRenderer answer={answer} question={question} />
        )}

        {answerType === 'json' && parsedAnswerJson && (
          <JsonAnswerRenderer 
            answer={answer} 
            question={question} 
            parsedAnswerJson={parsedAnswerJson}
            questionTypeCode={questionTypeCode}
          />
        )}

        {/* AI Feedback Section */}
        {answer.ai_feedback && (
          <Box mt={3} sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="info.main" mb={1}>
              Phản hồi AI:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {answer.ai_feedback}
            </Typography>
          </Box>
        )}

        {/* Manual Feedback Section */}
        {answer.manual_feedback && (
          <Box mt={2} sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="warning.main" mb={1}>
              Nhận xét trước đó:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {answer.manual_feedback}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function getAnswerTypeLabel(answerType) {
  switch (answerType) {
    case 'text': return 'Văn bản';
    case 'audio': return 'Thu âm';
    case 'option': return 'Trắc nghiệm';
    case 'json': return 'Cấu trúc phức hợp';
    default: return 'Khác';
  }
}

function getAnswerTypeColor(answerType) {
  switch (answerType) {
    case 'text': return 'primary';
    case 'audio': return 'secondary';
    case 'option': return 'info';
    case 'json': return 'warning';
    default: return 'default';
  }
}

// Text Answer Renderer
function TextAnswerRenderer({ answer, question }) {
  const wordCount = answer.text_answer?.split(/\s+/).length || 0;
  
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <TextFields color="primary" />
        <Typography variant="subtitle2">Câu trả lời văn bản:</Typography>
        <Chip label={`${wordCount} từ`} size="small" color="info" />
      </Box>
      
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid #ddd' }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {answer.text_answer}
        </Typography>
      </Box>
    </Box>
  );
}

// Audio Answer Renderer
function AudioAnswerRenderer({ answer, question }) {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <VolumeUp color="secondary" />
        <Typography variant="subtitle2">Bài thu âm:</Typography>
      </Box>
      
      <Box sx={{ p: 2, bgcolor: 'secondary.50', borderRadius: 1 }}>
        <audio controls style={{ width: '100%', marginBottom: '16px' }}>
          <source src={answer.audio_url} type="audio/mpeg" />
          Trình duyệt không hỗ trợ audio.
        </audio>
        
        {/* Transcribed text if available */}
        {answer.transcribed_text && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold" color="text.secondary" mb={1}>
              Văn bản đã chuyển đổi:
            </Typography>
            <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #ddd' }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                {answer.transcribed_text}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Option Answer Renderer
function OptionAnswerRenderer({ answer, question }) {
  // Find the selected option
  const selectedOption = question.options?.find(opt => opt.id === answer.selected_option_id);
  const isCorrect = selectedOption?.is_correct || false;
  
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <RadioButtonChecked color="info" />
        <Typography variant="subtitle2">Lựa chọn đã chọn:</Typography>
      </Box>
      
      <Box sx={{ p: 2, bgcolor: isCorrect ? 'success.50' : 'error.50', borderRadius: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {isCorrect ? (
            <CheckCircle color="success" />
          ) : (
            <Cancel color="error" />
          )}
          <Typography variant="body2" fontWeight="bold">
            {isCorrect ? 'Đáp án đúng' : 'Đáp án sai'}
          </Typography>
        </Box>
        
        {selectedOption && (
          <Typography variant="body1">
            <strong>Option {answer.selected_option_id}:</strong> {selectedOption.option_text}
          </Typography>
        )}

        {/* Show all options for reference */}
        {question.options && question.options.length > 0 && (
          <Box mt={2}>
            <Typography variant="body2" fontWeight="bold" mb={1}>
              Tất cả các lựa chọn:
            </Typography>
            {question.options.map((option, index) => (
              <Box 
                key={option.id} 
                display="flex" 
                alignItems="center" 
                gap={1}
                sx={{ 
                  p: 1, 
                  borderRadius: 1,
                  bgcolor: option.id === answer.selected_option_id ? 'primary.100' : 'transparent',
                  border: option.id === answer.selected_option_id ? '1px solid' : '1px solid transparent',
                  borderColor: option.id === answer.selected_option_id ? 'primary.main' : 'transparent'
                }}
              >
                {option.is_correct ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <Cancel color="disabled" fontSize="small" />
                )}
                <Typography 
                  variant="body2"
                  fontWeight={option.id === answer.selected_option_id ? 'bold' : 'normal'}
                >
                  {String.fromCharCode(65 + index)}: {option.option_text}
                  {option.id === answer.selected_option_id && ' (Selected)'}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// JSON Answer Renderer (for complex question types)
function JsonAnswerRenderer({ answer, question, parsedAnswerJson, questionTypeCode }) {
  // Render based on question type
  switch (questionTypeCode) {
    case 'READING_GAP_FILL':
      return <GapFillJsonRenderer parsedAnswerJson={parsedAnswerJson} question={question} />;
    case 'READING_ORDERING':
      return <OrderingJsonRenderer parsedAnswerJson={parsedAnswerJson} question={question} />;
    case 'READING_MATCHING':
    case 'READING_MATCHING_HEADINGS':
    case 'READING_SHORT_TEXT':
      return <MatchingJsonRenderer parsedAnswerJson={parsedAnswerJson} question={question} questionTypeCode={questionTypeCode} />;
    default:
      return <DefaultJsonRenderer parsedAnswerJson={parsedAnswerJson} question={question} />;
  }
}

// Gap Fill JSON Renderer
function GapFillJsonRenderer({ parsedAnswerJson, question }) {
  const answers = parsedAnswerJson.answers || parsedAnswerJson;
  const correctAnswers = question.items?.reduce((acc, item) => {
    acc[item.item_text] = item.answer_text;
    return acc;
  }, {}) || {};
  
  return (
    <Box>
      <Typography variant="subtitle2" mb={2}>Câu trả lời Gap Filling:</Typography>
      
      <Grid container spacing={1}>
        {Object.entries(answers).map(([gap, studentAnswer]) => {
          const correctAnswer = correctAnswers[gap];
          const isCorrect = studentAnswer === correctAnswer;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={gap}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 1, 
                  border: '1px solid',
                  borderColor: isCorrect ? 'success.main' : 'error.main',
                  bgcolor: isCorrect ? 'success.50' : 'error.50'
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {gap}:
                </Typography>
                <Typography variant="body2">
                  Trả lời: <strong>{studentAnswer}</strong>
                </Typography>
                <Typography variant="caption" color={isCorrect ? 'success.main' : 'error.main'}>
                  Đúng: {correctAnswer} {isCorrect ? '✓ Đúng' : '✗ Sai'}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

// Ordering JSON Renderer
function OrderingJsonRenderer({ parsedAnswerJson, question }) {
  const orderAnswers = parsedAnswerJson.order || parsedAnswerJson;
  const correctOrder = question.items?.reduce((acc, item) => {
    acc[item.item_order] = parseInt(item.answer_text);
    return acc;
  }, {}) || {};
  
  return (
    <Box>
      <Typography variant="subtitle2" mb={2}>Thứ tự sắp xếp:</Typography>
      
      <List dense>
        {Object.entries(orderAnswers).map(([position, studentOrder]) => {
          const correctPos = correctOrder[parseInt(position)];
          const isCorrect = parseInt(studentOrder) === correctPos;
          
          return (
            <ListItem 
              key={position}
              sx={{ 
                bgcolor: isCorrect ? 'success.50' : 'error.50',
                borderRadius: 1,
                mb: 1,
                border: '1px solid',
                borderColor: isCorrect ? 'success.main' : 'error.main'
              }}
            >
              <ListItemText 
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {isCorrect ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                    <span>Vị trí {position}: {studentOrder} (Đúng: {correctPos})</span>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

// Matching JSON Renderer
function MatchingJsonRenderer({ parsedAnswerJson, question, questionTypeCode }) {
  const matches = parsedAnswerJson.matches || parsedAnswerJson;
  
  return (
    <Box>
      <Typography variant="subtitle2" mb={2}>
        Câu trả lời {questionTypeCode.includes('HEADINGS') ? 'Matching Headings' : 'Matching'}:
      </Typography>
      
      <List dense>
        {Object.entries(matches).map(([questionKey, selectedAnswer]) => {
          const questionItem = question.items?.find(item => 
            item.item_text === questionKey || item.id.toString() === questionKey
          );
          const isCorrect = questionItem?.answer_text === selectedAnswer;
          
          return (
            <ListItem 
              key={questionKey}
              sx={{ 
                bgcolor: isCorrect ? 'success.50' : 'error.50',
                borderRadius: 1,
                mb: 1,
                border: '1px solid',
                borderColor: isCorrect ? 'success.main' : 'error.main'
              }}
            >
              <ListItemText 
                primary={
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      {isCorrect ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                      <Typography variant="body2" fontWeight="bold">
                        {questionKey}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      Chọn: <strong>{selectedAnswer}</strong>
                    </Typography>
                    {questionItem && (
                      <Typography variant="caption" color={isCorrect ? 'success.main' : 'error.main'}>
                        Đáp án đúng: {questionItem.answer_text} {isCorrect ? '✓ Đúng' : '✗ Sai'}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

// Default JSON Renderer
function DefaultJsonRenderer({ parsedAnswerJson, question }) {
  return (
    <Box>
      <Typography variant="subtitle2" mb={1}>Dữ liệu câu trả lời:</Typography>
      <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
          {JSON.stringify(parsedAnswerJson, null, 2)}
        </pre>
      </Box>
    </Box>
  );
}