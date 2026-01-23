'use client';

import { 
  Box, 
  Typography, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import { 
  PlayArrow, 
  Image as ImageIcon, 
  AudioFile,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';

/**
 * Component hiển thị chi tiết và chính xác cho tất cả 15 loại câu hỏi APTIS
 */
export default function DetailedQuestionRenderer({ question, answer }) {
  if (!question) {
    return (
      <Alert severity="warning">
        Không có thông tin câu hỏi
      </Alert>
    );
  }

  const questionType = question.questionType || question.question_type;
  const questionTypeCode = questionType?.code || '';
  const skillType = questionType?.skillType?.code || '';
  
  // Parse content nếu là JSON string
  let parsedContent = {};
  try {
    if (typeof question.content === 'string') {
      parsedContent = JSON.parse(question.content);
    } else if (question.content && typeof question.content === 'object') {
      parsedContent = question.content;
    }
  } catch (e) {
    // Fallback to plain text content
    parsedContent = { text: question.content };
  }

  // Render theo loại câu hỏi cụ thể
  switch (questionTypeCode) {
    // WRITING QUESTIONS
    case 'WRITING_FORM_FILL':
      return <WritingFormFillRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'WRITING_SHORT_RESPONSE':
      return <WritingShortResponseRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'WRITING_CHAT':
      return <WritingChatRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'WRITING_EMAIL':
      return <WritingEmailRenderer question={question} answer={answer} parsedContent={parsedContent} />;

    // READING QUESTIONS  
    case 'READING_GAP_FILL':
      return <ReadingGapFillRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'READING_ORDERING':
      return <ReadingOrderingRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'READING_MATCHING':
      return <ReadingMatchingRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'READING_MATCHING_HEADINGS':
      return <ReadingMatchingHeadingsRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'READING_SHORT_TEXT':
      return <ReadingShortTextRenderer question={question} answer={answer} parsedContent={parsedContent} />;

    // LISTENING QUESTIONS
    case 'LISTENING_MCQ':
      return <ListeningMCQRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'LISTENING_MATCHING':
      return <ListeningMatchingRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'LISTENING_STATEMENT_MATCHING':
      return <ListeningStatementMatchingRenderer question={question} answer={answer} parsedContent={parsedContent} />;

    // SPEAKING QUESTIONS
    case 'SPEAKING_INTRODUCTION':
      return <SpeakingIntroductionRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'SPEAKING_DESCRIPTION':
      return <SpeakingDescriptionRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'SPEAKING_COMPARISON':
      return <SpeakingComparisonRenderer question={question} answer={answer} parsedContent={parsedContent} />;
    case 'SPEAKING_DISCUSSION':
      return <SpeakingDiscussionRenderer question={question} answer={answer} parsedContent={parsedContent} />;

    default:
      return <DefaultQuestionRenderer question={question} answer={answer} parsedContent={parsedContent} />;
  }
}

// WRITING QUESTION RENDERERS
function WritingFormFillRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Writing Task 1" color="success" size="small" />
          <Chip label="A1 - Form Filling" variant="outlined" size="small" />
        </Box>
        
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.instruction || question.content}
        </Typography>

        {/* Form fields */}
        {parsedContent.fields && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Các trường cần điền:</Typography>
            <Grid container spacing={2}>
              {parsedContent.fields.map((field, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary">
                      {field.label}: _______________
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function WritingShortResponseRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Writing Task 2" color="info" size="small" />
          <Chip label="A2 - Short Response (20-30 words)" variant="outlined" size="small" />
        </Box>
        
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {parsedContent.question || question.content}
        </Typography>

        {parsedContent.wordCount && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Yêu cầu: {parsedContent.wordCount} từ
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function WritingChatRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Writing Task 3" color="primary" size="small" />
          <Chip label="B1 - Chat Responses (30-40 words each)" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.scenario || question.content}
        </Typography>

        {/* Chat prompts */}
        {parsedContent.prompts && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Tin nhắn cần trả lời:</Typography>
            {parsedContent.prompts.map((prompt, index) => (
              <Box key={index} sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>Tin nhắn {index + 1}:</strong> {prompt.text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function WritingEmailRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Writing Task 4" color="warning" size="small" />
          <Chip label="B2+ - Email Writing" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.scenario || question.content}
        </Typography>

        {/* Email details */}
        {(parsedContent.recipient || parsedContent.purpose) && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mt: 2 }}>
            {parsedContent.recipient && (
              <Typography variant="body2">
                <strong>Người nhận:</strong> {parsedContent.recipient}
              </Typography>
            )}
            {parsedContent.purpose && (
              <Typography variant="body2">
                <strong>Mục đích:</strong> {parsedContent.purpose}
              </Typography>
            )}
            {parsedContent.tone && (
              <Typography variant="body2">
                <strong>Tông điệu:</strong> {parsedContent.tone}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// READING QUESTION RENDERERS
function ReadingGapFillRenderer({ question, answer, parsedContent }) {
  const options = question.options || [];
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Reading Part 1" color="success" size="small" />
          <Chip label="Gap Filling - 10 points" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.passage || question.content}
        </Typography>

        {/* Options */}
        {options.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={1}>Từ vựng có sẵn:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {options.map((option, index) => (
                <Chip 
                  key={option.id || index}
                  label={option.option_text} 
                  variant="outlined" 
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Answer guide */}
        {question.items && question.items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Đáp án chính xác:</Typography>
            {question.items.map((item, index) => (
              <Typography key={item.id || index} variant="body2" color="success.main">
                {item.item_text}: <strong>{item.answer_text}</strong>
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ReadingOrderingRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Reading Part 2" color="info" size="small" />
          <Chip label="Ordering - 5 points" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.passage || question.content}
        </Typography>

        {/* Sentences to order */}
        {question.items && question.items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Các câu cần sắp xếp:</Typography>
            {question.items.map((item, index) => (
              <Box key={item.id || index} sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>{index + 1}.</strong> {item.item_text?.replace(/^\d+\.\s*/, '')}
                </Typography>
                <Typography variant="caption" color="success.main">
                  Thứ tự đúng: {item.answer_text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ReadingMatchingRenderer({ question, answer, parsedContent }) {
  const options = question.options || [];
  const items = question.items || [];
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Reading Part 3/5" color="primary" size="small" />
          <Chip label="Matching - 5-14 points" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.passage || question.content}
        </Typography>

        {/* Options */}
        {options.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" mb={1}>Các lựa chọn:</Typography>
            {options.map((option, index) => (
              <Typography key={option.id || index} variant="body2" sx={{ mb: 0.5 }}>
                <strong>{String.fromCharCode(65 + index)}:</strong> {option.option_text}
              </Typography>
            ))}
          </Box>
        )}

        {/* Questions */}
        {items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Câu hỏi và đáp án:</Typography>
            {items.map((item, index) => (
              <Box key={item.id || index} sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>Q{index + 1}:</strong> {item.item_text}
                </Typography>
                <Typography variant="caption" color="success.main">
                  Đáp án: {item.answer_text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ReadingMatchingHeadingsRenderer({ question, answer, parsedContent }) {
  const options = question.options || [];
  const items = question.items || [];
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Reading Part 4" color="warning" size="small" />
          <Chip label="Matching Headings - 16 points" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.passage || question.content}
        </Typography>

        {/* Heading Options */}
        {options.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" mb={1}>Các tiêu đề:</Typography>
            {options.map((option, index) => (
              <Typography key={option.id || index} variant="body2" sx={{ mb: 0.5 }}>
                <strong>{index + 1}:</strong> {option.option_text}
              </Typography>
            ))}
          </Box>
        )}

        {/* Paragraphs */}
        {items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Đoạn văn và tiêu đề phù hợp:</Typography>
            {items.map((item, index) => (
              <Box key={item.id || index} sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>{item.item_text}:</strong> Tiêu đề phù hợp
                </Typography>
                <Typography variant="caption" color="success.main">
                  Đáp án: {item.answer_text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ReadingShortTextRenderer({ question, answer, parsedContent }) {
  const options = question.options || [];
  const items = question.items || [];
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Reading Part 5" color="error" size="small" />
          <Chip label="Short Text Matching - 14 points" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.instruction || question.content}
        </Typography>

        {/* Descriptions */}
        {options.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" mb={1}>Mô tả:</Typography>
            {options.map((option, index) => (
              <Typography key={option.id || index} variant="body2" sx={{ mb: 0.5 }}>
                <strong>{String.fromCharCode(65 + index)}:</strong> {option.option_text}
              </Typography>
            ))}
          </Box>
        )}

        {/* Short texts */}
        {items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Đoạn văn ngắn:</Typography>
            {items.map((item, index) => (
              <Box key={item.id || index} sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{index + 1}:</strong> {item.item_text}
                </Typography>
                <Typography variant="caption" color="success.main">
                  Phù hợp với mô tả: {item.answer_text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// LISTENING QUESTION RENDERERS
function ListeningMCQRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Listening Part 1" color="primary" size="small" />
          <Chip label="Multiple Choice - 26 points" variant="outlined" size="small" />
        </Box>

        {/* Audio */}
        {(question.media_url || parsedContent.audioUrl) && (
          <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" mb={1} display="flex" alignItems="center">
              <AudioFile sx={{ mr: 1 }} /> Audio câu hỏi:
            </Typography>
            <audio controls style={{ width: '100%' }}>
              <source src={question.media_url || parsedContent.audioUrl} type="audio/mpeg" />
              Trình duyệt không hỗ trợ audio.
            </audio>
          </Box>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.instruction || question.content}
        </Typography>

        {/* MCQ Items */}
        {question.items && question.items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Câu hỏi trắc nghiệm:</Typography>
            {question.items.map((item, index) => (
              <Box key={item.id || index} sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  {index + 1}. {item.item_text}
                </Typography>
                {/* Show options for this item */}
                {question.options && question.options.filter(opt => opt.item_id === item.id).map((option, optIndex) => (
                  <Box key={option.id} display="flex" alignItems="center" sx={{ ml: 2, mb: 0.5 }}>
                    {option.is_correct ? <CheckCircle color="success" sx={{ mr: 1, fontSize: 16 }} /> : <RadioButtonUnchecked sx={{ mr: 1, fontSize: 16 }} />}
                    <Typography variant="body2">
                      {String.fromCharCode(65 + optIndex)}: {option.option_text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ListeningMatchingRenderer({ question, answer, parsedContent }) {
  const options = question.options || [];
  const items = question.items || [];
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Listening Part 2-3" color="info" size="small" />
          <Chip label="Speaker Matching - 16 points" variant="outlined" size="small" />
        </Box>

        {/* Audio */}
        {question.media_url && (
          <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" mb={1} display="flex" alignItems="center">
              <AudioFile sx={{ mr: 1 }} /> Audio chính:
            </Typography>
            <audio controls style={{ width: '100%' }}>
              <source src={question.media_url} type="audio/mpeg" />
              Trình duyệt không hỗ trợ audio.
            </audio>
          </Box>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.instruction || question.content}
        </Typography>

        {/* Speakers */}
        {options.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" mb={1}>Người nói:</Typography>
            {options.map((option, index) => (
              <Typography key={option.id || index} variant="body2" sx={{ mb: 0.5 }}>
                <strong>{String.fromCharCode(65 + index)}:</strong> {option.option_text}
              </Typography>
            ))}
          </Box>
        )}

        {/* Statements */}
        {items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Phát biểu:</Typography>
            {items.map((item, index) => (
              <Box key={item.id || index} sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>{index + 1}:</strong> {item.item_text}
                </Typography>
                <Typography variant="caption" color="success.main">
                  Người nói: {item.answer_text}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ListeningStatementMatchingRenderer({ question, answer, parsedContent }) {
  const items = question.items || [];
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Listening Part 4" color="warning" size="small" />
          <Chip label="Statement Matching - 8 points" variant="outlined" size="small" />
        </Box>

        {/* Audio */}
        {question.media_url && (
          <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" mb={1} display="flex" alignItems="center">
              <AudioFile sx={{ mr: 1 }} /> Audio câu hỏi:
            </Typography>
            <audio controls style={{ width: '100%' }}>
              <source src={question.media_url} type="audio/mpeg" />
              Trình duyệt không hỗ trợ audio.
            </audio>
          </Box>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.instruction || question.content}
        </Typography>

        {/* Statements */}
        {items.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Các phát biểu:</Typography>
            {items.map((item, index) => (
              <Box key={item.id || index} sx={{ p: 1.5, border: '1px solid #ddd', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2">
                  <strong>{index + 1}:</strong> {item.item_text}
                </Typography>
                {item.answer_text && (
                  <Typography variant="caption" color="success.main">
                    Người nói: {item.answer_text}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// SPEAKING QUESTION RENDERERS
function SpeakingIntroductionRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Speaking Task 1" color="success" size="small" />
          <Chip label="A2 - Personal Introduction" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.prompt || question.content}
        </Typography>

        {parsedContent.duration && (
          <Typography variant="caption" color="text.secondary">
            Thời gian: {parsedContent.duration} giây
          </Typography>
        )}

        {/* Sample prompts */}
        {parsedContent.questions && (
          <Box mt={2} sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={1}>Các câu hỏi gợi ý:</Typography>
            {parsedContent.questions.map((q, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                • {q}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function SpeakingDescriptionRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Speaking Task 2" color="info" size="small" />
          <Chip label="B1 - Picture/Topic Description" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.prompt || question.content}
        </Typography>

        {/* Image */}
        {(question.image_url || parsedContent.imageUrl) && (
          <Box mt={2} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" mb={1} display="flex" alignItems="center" justifyContent="center">
              <ImageIcon sx={{ mr: 1 }} /> Hình ảnh mô tả:
            </Typography>
            <img 
              src={question.image_url || parsedContent.imageUrl} 
              alt="Speaking prompt" 
              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} 
            />
          </Box>
        )}

        {parsedContent.duration && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Thời gian: {parsedContent.duration} giây
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SpeakingComparisonRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Speaking Task 3" color="primary" size="small" />
          <Chip label="B1 - Comparison" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.prompt || question.content}
        </Typography>

        {/* Comparison images */}
        {parsedContent.images && parsedContent.images.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Hình ảnh so sánh:</Typography>
            <Grid container spacing={2}>
              {parsedContent.images.map((img, index) => (
                <Grid item xs={6} key={index}>
                  <img 
                    src={img.url} 
                    alt={`Comparison ${index + 1}`}
                    style={{ width: '100%', borderRadius: 4 }} 
                  />
                  <Typography variant="caption" display="block" textAlign="center" mt={1}>
                    {img.label || `Hình ${index + 1}`}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {parsedContent.duration && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Thời gian: {parsedContent.duration} giây
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SpeakingDiscussionRenderer({ question, answer, parsedContent }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip label="Speaking Task 4" color="warning" size="small" />
          <Chip label="B2+ - Topic Discussion" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {parsedContent.topic || question.content}
        </Typography>

        {/* Discussion points */}
        {parsedContent.points && (
          <Box mt={2} sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" mb={1}>Các điểm thảo luận:</Typography>
            {parsedContent.points.map((point, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                • {point}
              </Typography>
            ))}
          </Box>
        )}

        {parsedContent.duration && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Thời gian: {parsedContent.duration} giây
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// DEFAULT RENDERER
function DefaultQuestionRenderer({ question, answer, parsedContent }) {
  const questionType = question.questionType || question.question_type;
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" gap={1} mb={2}>
          <Chip 
            label={questionType?.code || 'UNKNOWN'} 
            color="default" 
            size="small" 
          />
          <Chip 
            label={questionType?.question_type_name || 'Question'} 
            variant="outlined" 
            size="small" 
          />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
          {question.content || 'Không có nội dung câu hỏi'}
        </Typography>

        {/* Media */}
        {question.media_url && (
          <Box mt={2}>
            {question.media_url.includes('.mp3') || question.media_url.includes('.wav') ? (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" mb={1}>Audio:</Typography>
                <audio controls style={{ width: '100%' }}>
                  <source src={question.media_url} type="audio/mpeg" />
                </audio>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={question.media_url} 
                  alt="Question media" 
                  style={{ maxWidth: '100%', borderRadius: 4 }} 
                />
              </Box>
            )}
          </Box>
        )}

        {/* Additional media */}
        {question.additional_media && (
          <Box mt={2}>
            <Typography variant="subtitle2" mb={1}>Media bổ sung:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {JSON.stringify(question.additional_media, null, 2)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}