require('dotenv').config();

// Import seed functions
const initDatabase = require('./01-init-database');
const seedTypes = require('./02-seed-types');
const seedUsers = require('./03-seed-users');
const seedAiCriteria = require('./04-seed-ai-criteria');
const seedQuestions = require('./05-seed-questions');
const seedExams = require('./06-seed-exams');

/**
 * Master seed runner
 */
async function runAllSeeds() {
  try {
    console.log('='.repeat(60));
    console.log('STARTING COMPLETE DATABASE SEEDING');
    console.log('='.repeat(60));

    // Step 1: Initialize database (drop and recreate)
    console.log('\n[1/6] Initializing database...');
    await initDatabase();

    // Step 2: Seed types
    console.log('\n[2/6] Seeding types...');
    await seedTypes();

    // Step 3: Seed users
    console.log('\n[3/6] Seeding users...');
    await seedUsers();

    // Step 4: Seed AI criteria
    console.log('\n[4/6] Seeding AI criteria...');
    await seedAiCriteria();

    // Step 5: Seed sample questions
    console.log('\n[5/6] Seeding sample questions...');
    await seedQuestions();

    // Step 6: Seed sample exams
    console.log('\n[6/6] Seeding sample exams...');
    await seedExams();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL SEEDS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));

    console.log('\n📊 DATABASE NOW INCLUDES:');
    console.log('✅ Users (Admin, Teachers, Students)');
    console.log('✅ APTIS Types (4 types)');
    console.log('✅ Skill Types (5 skills)');
    console.log('✅ Question Types (20+ types)');
    console.log('✅ AI Scoring Criteria (16 criteria)');
    console.log('✅ Sample Questions (All question types)');
    console.log('✅ Sample Exams (Full + Skill-specific)');

    console.log('\n🚀 You can now start the server with: npm run dev');
    console.log('📧 Login credentials:');
    console.log('   Admin: admin@aptis.com / Admin@123');
    console.log('   Teacher: teacher1@aptis.com / Teacher@123');
    console.log('   Student: student1@aptis.com / Student@123');

    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Seeding failed:', error);
    process.exit(1);
  }
}

// Run all seeds
runAllSeeds();
