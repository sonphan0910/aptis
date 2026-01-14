# AI Scoring Service Architecture

## Tổng quan

AiScoringService đã được tách ra thành các module nhỏ để dễ dàng maintain và mở rộng:

```
src/services/
├── AiScoringService.js           # Main service (orchestrator)
├── SpeechToTextService.js        # Audio analysis service  
└── scoring/                      # Modular scoring components
    ├── CefrConverterService.js   # CEFR level conversion
    ├── ScoringPromptBuilder.js   # AI prompt building
    ├── AudioAnalysisEnhancer.js  # Audio-based score adjustments
    ├── FeedbackGenerator.js      # Feedback generation
    ├── AiServiceClient.js        # AI API calls & parsing
    └── index.js                  # Exports all modules
```

## Các Module

### 1. CefrConverterService.js
- **Chức năng**: Chuyển đổi CEFR levels (A1, B1.2, etc.) thành điểm số
- **Đặc điểm**: 
  - Tuân theo chuẩn APTIS Technical Report
  - Hỗ trợ nhiều task types (Writing 1-4, Speaking 1-4)
  - Xử lý qualifiers (Strong B2, Above A1, etc.)

### 2. ScoringPromptBuilder.js
- **Chức năng**: Xây dựng prompts cho AI model
- **Đặc điểm**:
  - `buildScoringPrompt()`: Prompt cơ bản
  - `buildEnhancedScoringPrompt()`: Prompt có tích hợp audio analysis
  - Task-specific context cho từng loại bài thi

### 3. AudioAnalysisEnhancer.js  
- **Chức năng**: Điều chỉnh điểm AI dựa trên audio analysis
- **Đặc điểm**:
  - `applyAudioAnalysisAdjustment()`: Điều chỉnh score theo metrics
  - Xử lý pronunciation, fluency, accuracy factors
  - Validation cho audio analysis data

### 4. FeedbackGenerator.js
- **Chức năng**: Tạo feedback tổng thể và chi tiết
- **Đặc điểm**:
  - `generateOverallFeedback()`: Feedback cơ bản
  - `generateEnhancedOverallFeedback()`: Feedback có audio insights
  - Criterion-specific feedback generation

### 5. AiServiceClient.js
- **Chức năng**: Gọi AI API và parse response
- **Đặc điểm**:
  - `callAiWithRetry()`: Retry logic cho AI calls
  - `parseAiResponse()`: Parse JSON response từ AI
  - Fallback handling khi AI response lỗi

## Workflow Tích hợp

### 1. Enhanced Speaking Scoring
```javascript
// Main service orchestrates the process
async scoreSpeakingWithAudioAnalysis(answerId) {
  // 1. Get enhanced transcription + audio analysis
  const result = await SpeechToTextService.convertAudioToText(audioPath);
  
  // 2. Score with audio data
  const scores = await this.scoreWithAudioAnalysis(
    result.text,
    question,
    criteria, 
    taskType,
    result.speechAnalysis // ← Audio metrics
  );
  
  // 3. Apply audio adjustments
  // 4. Generate enhanced feedback
}
```

### 2. Audio-Enhanced Scoring Process
```javascript
async scoreWithAudioAnalysis(text, question, criteria, taskType, audioAnalysis) {
  for (const criterion of criteria) {
    // 1. Build enhanced prompt with audio data
    const prompt = ScoringPromptBuilder.buildEnhancedScoringPrompt(
      text, question, criterion, taskType, audioAnalysis
    );
    
    // 2. Get AI assessment
    const aiResponse = await AiServiceClient.callAiWithRetry(prompt);
    const result = AiServiceClient.parseAiResponse(aiResponse, maxScore);
    
    // 3. Apply audio-based adjustments
    const adjustedScore = AudioAnalysisEnhancer.applyAudioAnalysisAdjustment(
      result.score, criterion.name, audioAnalysis, maxScore
    );
    
    // 4. Store enhanced result
    criteriaScores.push({ ...result, score: adjustedScore });
  }
  
  // 5. Generate comprehensive feedback
  const feedback = FeedbackGenerator.generateEnhancedOverallFeedback(
    criteriaScores, audioAnalysis
  );
}
```

## Lợi ích của Modular Architecture

### 1. **Separation of Concerns**
- Mỗi module có trách nhiệm rõ ràng
- Dễ dàng test từng component riêng biệt
- Giảm coupling giữa các phần

### 2. **Maintainability**
- Code dễ đọc và hiểu
- Bugs dễ locate và fix
- Modifications không ảnh hưởng toàn bộ system

### 3. **Scalability**
- Dễ dàng thêm tính năng mới
- Có thể optimize từng module riêng
- Support multiple AI providers trong tương lai

### 4. **Testability**
- Unit test cho từng service
- Mock dependencies dễ dàng
- Integration test rõ ràng

## Usage Examples

### Import Specific Services
```javascript
const { CefrConverter, AudioAnalysisEnhancer } = require('./scoring');

// Convert CEFR to score
const score = CefrConverter.convertCefrToScore('B1.2', 'SPEAKING', 5);

// Apply audio adjustments
const adjusted = AudioAnalysisEnhancer.applyAudioAnalysisAdjustment(
  3.0, 'pronunciation', audioData, 5
);
```

### Use Main Service (Recommended)
```javascript
const AiScoringService = require('./AiScoringService');

// All functionality available through main service
const result = await AiScoringService.scoreSpeakingWithAudioAnalysis(answerId);
```

## Migration Benefits

✅ **Code Clarity**: Từ 1400 dòng → 5 modules ~200-300 dòng mỗi module  
✅ **Better Organization**: Logic tách biệt rõ ràng  
✅ **Easier Testing**: Test từng component riêng  
✅ **Enhanced Features**: Audio analysis integration hoàn chỉnh  
✅ **Future-Proof**: Dễ dàng mở rộng và maintain  

## Backward Compatibility

Tất cả public methods của AiScoringService vẫn được giữ nguyên, chỉ implementation được refactor. Existing code sẽ hoạt động bình thường.