require('dotenv').config();
const {
    Question,
    QuestionType,
    AptisType,
    User,
} = require('../models');

async function seedSpeakingSupplement() {
    try {
        console.log('[Seed] Seeding Supplementary Speaking questions (Description & Comparison)...');

        const aptisType = await AptisType.findOne({ where: { code: 'APTIS_GENERAL' } });
        const teacher = await User.findOne({ where: { email: 'teacher1@aptis.local' } });

        if (!aptisType || !teacher) {
            throw new Error('APTIS type or teacher not found. Please make sure basic seeds are run.');
        }

        const speakingDescriptionType = await QuestionType.findOne({ where: { code: 'SPEAKING_DESCRIPTION' } });
        const speakingComparisonType = await QuestionType.findOne({ where: { code: 'SPEAKING_COMPARISON' } });

        if (!speakingDescriptionType || !speakingComparisonType) {
            throw new Error('Speaking Question Types not found.');
        }

        // ===== SECTION 2: Picture Description (3 questions) =====
        console.log('Creating Speaking Part 2: Picture Description...');

        // Q4: Primary question - Describe a park scene (shows image)
        const q4 = await Question.create({
            question_type_id: speakingDescriptionType.id,
            aptis_type_id: aptisType.id,
            difficulty: 'medium',
            content: 'Look at the picture of a park.\n\nDescribe:\n- The people and what they are doing',
            additional_media: JSON.stringify([
                { type: 'image', description: 'Park scene', url: 'https://picsum.photos/640/480?random=1' }
            ]),
            duration_seconds: 150,
            created_by: teacher.id,
            status: 'active',
        });

        // Q5: Follow-up question
        await Question.create({
            question_type_id: speakingDescriptionType.id,
            aptis_type_id: aptisType.id,
            difficulty: 'medium',
            content: 'What would you like to do there?',
            parent_question_id: q4.id,
            duration_seconds: 90,
            created_by: teacher.id,
            status: 'active',
        });

        // Q6: Follow-up question
        await Question.create({
            question_type_id: speakingDescriptionType.id,
            aptis_type_id: aptisType.id,
            difficulty: 'medium',
            content: 'Looking back at the park:\n\nNow tell me:\n- What activities could families do there?\n- How often would you visit this place?\n- What would you change to improve it?\n\n10 seconds to prepare, 30 seconds to speak.',
            parent_question_id: q4.id,
            duration_seconds: 40,
            created_by: teacher.id,
            status: 'active',
        });

        // ===== SECTION 3: Comparison (3 questions) =====
        console.log('Creating Speaking Part 3: Comparison...');

        // Q7: Primary question - Compare two transportation methods (shows 2 images)
        const q7 = await Question.create({
            question_type_id: speakingComparisonType.id,
            aptis_type_id: aptisType.id,
            difficulty: 'medium',
            content: 'Look at the two pictures showing different ways to travel.\n\nCompare them:\n- What are the similarities and differences?\n- Which method is faster and why?\n- Which would you prefer and why?\n\n1 minute to prepare, 1.5 minutes to speak.',
            additional_media: JSON.stringify([
                { type: 'image', description: 'Transportation method A', url: 'https://picsum.photos/640/480?random=4' },
                { type: 'image', description: 'Transportation method B', url: 'https://picsum.photos/640/480?random=41' }
            ]),
            duration_seconds: 150,
            created_by: teacher.id,
            status: 'active',
        });

        // Q8: Follow-up question
        await Question.create({
            question_type_id: speakingComparisonType.id,
            aptis_type_id: aptisType.id,
            difficulty: 'medium',
            content: 'Thinking about the two transportation methods you just compared:\n\nDiscuss:\n- Which method is better for the environment and why?\n- What are the costs associated with each method?\n- Which do you use more often and why?\n\n',
            parent_question_id: q7.id,
            duration_seconds: 90,
            created_by: teacher.id,
            status: 'active',
        });

        // Q9: Follow-up question
        await Question.create({
            question_type_id: speakingComparisonType.id,
            aptis_type_id: aptisType.id,
            difficulty: 'medium',
            content: 'Based on the two transportation methods shown:\n\nDescribe:\n- How would cities improve public transportation in the future?\n- What are the advantages for travelers in the long term?\n- If you could improve one method, what would you change?\n\n',
            parent_question_id: q7.id,
            duration_seconds: 90,
            created_by: teacher.id,
            status: 'active',
        });

        console.log('[Seed] ✓ Supplementary Speaking questions created successfully!');
        process.exit(0);

    } catch (error) {
        console.error('[Seed] Failed to seed questions:', error);
        process.exit(1);
    }
}

seedSpeakingSupplement();
