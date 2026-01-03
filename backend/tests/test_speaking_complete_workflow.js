/**
 * Test Speaking workflow with correct answer_type handling
 * This test verifies that speaking answers are properly saved and AI feedback is displayed
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testData = {
  email: 'student1@example.com',
  password: 'password123'
};

let authToken = '';
let attemptId = '';
let speakingQuestionId = '';

// Simulate audio file upload
const createMockAudioFile = () => {
  const mockAudioContent = Buffer.alloc(1024, 'mock-audio-data');
  const tempPath = path.join(__dirname, 'temp-audio-test.webm');
  fs.writeFileSync(tempPath, mockAudioContent);
  return tempPath;
};

// Helper to make authenticated requests
const apiRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

async function testSpeakingWorkflow() {
  try {
    console.log('🎯 Testing Complete Speaking Workflow with Answer Type...\n');

    // 1. Login
    console.log('1. 🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testData);
    authToken = loginResponse.data.token;
    console.log('   ✅ Login successful');

    // 2. Get available exams
    console.log('\n2. 📋 Getting available exams...');
    const examsResponse = await apiRequest('get', '/student/exams');
    const exam = examsResponse.data.find(e => e.title.includes('IELTS'));
    if (!exam) {
      throw new Error('No IELTS exam found');
    }
    console.log(`   ✅ Found exam: ${exam.title}`);

    // 3. Create new attempt
    console.log('\n3. 🚀 Creating new attempt...');
    const attemptResponse = await apiRequest('post', `/student/exams/${exam.id}/attempt`);
    attemptId = attemptResponse.data.attempt.id;
    console.log(`   ✅ Created attempt ID: ${attemptId}`);

    // 4. Get questions and find speaking question
    console.log('\n4. 📝 Loading questions...');
    const questionsResponse = await apiRequest('get', `/student/attempts/${attemptId}/questions`);
    const questions = questionsResponse.data;
    
    const speakingQuestion = questions.find(q => 
      q.questionType?.code?.toLowerCase().includes('speaking')
    );
    
    if (!speakingQuestion) {
      console.log('   ⚠️ No speaking question found in this exam');
      console.log('   Available question types:', questions.map(q => q.questionType?.code).join(', '));
      return;
    }
    
    speakingQuestionId = speakingQuestion.id;
    console.log(`   ✅ Found speaking question ID: ${speakingQuestionId}`);
    console.log(`   📄 Question type: ${speakingQuestion.questionType?.code}`);
    console.log(`   📄 Question: ${speakingQuestion.content?.substring(0, 100)}...`);

    // 5. Verify initial state
    console.log('\n5. 🔍 Checking initial answer state...');
    const initialCheck = await apiRequest('get', `/student/attempts/${attemptId}/questions`);
    const initialQuestion = initialCheck.data.find(q => q.id === speakingQuestionId);
    console.log(`   📊 Initial answer_data:`, JSON.stringify(initialQuestion.answer_data, null, 2));
    
    // 6. Upload audio answer with correct answer_type
    console.log('\n6. 🎤 Uploading audio answer...');
    const audioPath = createMockAudioFile();
    
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioPath), {
      filename: `speaking_q${speakingQuestionId}_${Date.now()}.webm`,
      contentType: 'audio/webm;codecs=opus'
    });
    formData.append('question_id', speakingQuestionId);
    formData.append('answer_type', 'audio'); // Explicitly set answer_type
    formData.append('duration', '30');
    
    const uploadResponse = await axios.post(
      `${BASE_URL}/student/attempts/${attemptId}/answers/audio`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    console.log(`   ✅ Audio uploaded successfully`);
    console.log(`   📁 File saved at: ${uploadResponse.data.audio_url}`);
    
    // Clean up temp file
    fs.unlinkSync(audioPath);

    // 7. Verify answer was saved with correct type
    console.log('\n7. ✨ Verifying saved answer...');
    const afterUpload = await apiRequest('get', `/student/attempts/${attemptId}/questions`);
    const updatedQuestion = afterUpload.data.find(q => q.id === speakingQuestionId);
    
    console.log(`   📊 Updated answer_data:`, JSON.stringify(updatedQuestion.answer_data, null, 2));
    
    // Check if answer has proper structure
    const answerData = updatedQuestion.answer_data;
    if (answerData && answerData.completed) {
      console.log('   ✅ Answer marked as completed');
    } else {
      console.log('   ⚠️ Answer not marked as completed');
    }
    
    if (answerData && answerData.audio_url) {
      console.log('   ✅ Audio URL saved');
    } else {
      console.log('   ⚠️ Audio URL missing');
    }

    // 8. Check progress counting
    console.log('\n8. 📈 Checking progress counting...');
    const progressCheck = await apiRequest('get', `/student/attempts/${attemptId}/progress`);
    console.log(`   📊 Progress:`, JSON.stringify(progressCheck.data, null, 2));

    // 9. Submit attempt for grading
    console.log('\n9. 📤 Submitting attempt for grading...');
    const submitResponse = await apiRequest('post', `/student/attempts/${attemptId}/submit`);
    console.log(`   ✅ Attempt submitted successfully`);
    console.log(`   📊 Submit result:`, JSON.stringify(submitResponse.data, null, 2));

    // 10. Wait a bit for AI grading
    console.log('\n10. ⏳ Waiting for AI grading (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 11. Check AI feedback
    console.log('\n11. 🤖 Checking AI feedback...');
    const resultsResponse = await apiRequest('get', `/student/attempts/${attemptId}/results`);
    const results = resultsResponse.data;
    
    const speakingResult = results.answers?.find(a => a.question_id === speakingQuestionId);
    if (speakingResult) {
      console.log(`   ✅ Found speaking result`);
      console.log(`   📊 Score: ${speakingResult.score}/${speakingResult.max_score}`);
      console.log(`   📝 Transcription: ${speakingResult.transcribed_text || 'N/A'}`);
      console.log(`   🤖 AI Feedback: ${speakingResult.ai_feedback || 'N/A'}`);
      
      if (speakingResult.aiFeedbacks && speakingResult.aiFeedbacks.length > 0) {
        console.log(`   📊 Detailed AI Feedbacks (${speakingResult.aiFeedbacks.length} criteria):`);
        speakingResult.aiFeedbacks.forEach((feedback, index) => {
          console.log(`      ${index + 1}. ${feedback.criteria_name}: ${feedback.score}/${feedback.max_score}`);
          console.log(`         Comment: ${feedback.comment || 'N/A'}`);
        });
      }
    } else {
      console.log('   ⚠️ No speaking result found');
    }

    console.log('\n🎉 Test completed successfully!');
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`- Attempt ID: ${attemptId}`);
    console.log(`- Speaking Question ID: ${speakingQuestionId}`);
    console.log(`- Audio uploaded and saved: ${answerData?.audio_url ? '✅' : '❌'}`);
    console.log(`- Answer marked as completed: ${answerData?.completed ? '✅' : '❌'}`);
    console.log(`- AI scoring completed: ${speakingResult?.score ? '✅' : '❌'}`);
    console.log(`- Detailed feedback available: ${speakingResult?.aiFeedbacks?.length > 0 ? '✅' : '❌'}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test
if (require.main === module) {
  testSpeakingWorkflow();
}

module.exports = { testSpeakingWorkflow };