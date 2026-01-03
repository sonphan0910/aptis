require('dotenv').config();
const { Question, QuestionType } = require('../src/models');
const TextToSpeechService = require('../src/services/TextToSpeechService');

/**
 * Script để generate audio URLs cho tất cả listening questions
 * Sử dụng Google Cloud TTS API hoặc mock URLs
 */
async function generateListeningAudio() {
  try {
    console.log('=== GENERATE LISTENING AUDIO URLs ===\n');

    // Get listening question types
    const listeningTypes = [
      'LISTENING_MCQ',
      'LISTENING_MATCHING',
      'LISTENING_GAP_FILL',
      'LISTENING_NOTE_COMPLETION'
    ];

    for (const questionTypeCode of listeningTypes) {
      console.log(`\n--- Processing ${questionTypeCode} ---`);

      const questionType = await QuestionType.findOne({
        where: { code: questionTypeCode }
      });

      if (!questionType) {
        console.log(`Type ${questionTypeCode} not found`);
        continue;
      }

      const questions = await Question.findAll({
        where: { question_type_id: questionType.id },
        limit: 50
      });

      console.log(`Found ${questions.length} ${questionTypeCode} questions\n`);

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // Tạo script audio từ content của question
        let scriptText = question.content;
        
        // Clean up script text (remove HTML, extra whitespace)
        scriptText = scriptText
          .replace(/<[^>]*>/g, '')
          .replace(/\n+/g, ' ')
          .trim();

        if (scriptText.length === 0) {
          console.log(`  [${i + 1}/${questions.length}] Question ${question.id}: No content, skipping`);
          continue;
        }

        console.log(`  [${i + 1}/${questions.length}] Generating audio for Question ${question.id}`);
        console.log(`     Text: "${scriptText.substring(0, 80)}${scriptText.length > 80 ? '...' : ''}"`);

        try {
          // Generate audio
          const audioUrl = await TextToSpeechService.generateAudio(
            scriptText,
            'en-US',
            'en-US-Neural2-C'
          );

          // Update question with media_url
          await question.update({
            media_url: audioUrl
          });

          console.log(`     ✓ Audio generated and saved`);

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`     ✗ Error: ${error.message}`);
        }
      }
    }

    console.log('\n=== AUDIO GENERATION COMPLETE ===');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateListeningAudio();
}

module.exports = { generateListeningAudio };
