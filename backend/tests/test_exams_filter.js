/**
 * Test exams filter logic
 * Verify that skill filter works correctly:
 * - No skill selected: return all exams
 * - Skill selected: return exams containing that skill
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

let authToken = '';

// Test data
const testData = {
  email: 'student1@example.com',
  password: 'password123'
};

async function testExamsFilter() {
  try {
    console.log('🎯 Testing Exams Filter Logic\n');

    // 1. Login
    console.log('1. 🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testData);
    authToken = loginResponse.data.token;
    console.log('   ✅ Login successful\n');

    // 2. Get all exams without filter
    console.log('2. 📋 Fetching all exams (no skill filter)...');
    const allExamsResponse = await axios.get(`${BASE_URL}/student/exams`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const allExams = allExamsResponse.data.data || [];
    console.log(`   ✅ Found ${allExams.length} exams`);
    
    if (allExams.length > 0) {
      console.log('   Sample exams:');
      allExams.slice(0, 3).forEach((exam, i) => {
        console.log(`     ${i + 1}. ${exam.title} (Skills: ${exam.skill_types?.join(', ') || 'N/A'})`);
      });
    }
    console.log();

    // 3. Get skill types
    console.log('3. 🎓 Fetching skill types...');
    const skillsResponse = await axios.get(`${BASE_URL}/public/skill-types`);
    const skills = skillsResponse.data.data || skillsResponse.data || [];
    console.log(`   ✅ Found ${skills.length} skill types`);
    
    if (skills.length === 0) {
      console.log('   ⚠️ No skill types available, skipping skill filter test');
      return;
    }

    const testSkill = skills[0];
    console.log(`   Testing with skill: ${testSkill.name} (ID: ${testSkill.id})\n`);

    // 4. Get exams filtered by skill
    console.log('4. 📋 Fetching exams with skill filter...');
    const filteredResponse = await axios.get(
      `${BASE_URL}/student/exams?skill=${testSkill.id}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    const filteredExams = filteredResponse.data.data || [];
    console.log(`   ✅ Found ${filteredExams.length} exams with skill "${testSkill.name}"`);
    
    if (filteredExams.length > 0) {
      console.log('   Sample filtered exams:');
      filteredExams.slice(0, 3).forEach((exam, i) => {
        const hasSkill = exam.skill_types?.includes(testSkill.name);
        console.log(`     ${i + 1}. ${exam.title}`);
        console.log(`        Skills: ${exam.skill_types?.join(', ') || 'N/A'}`);
        console.log(`        Contains "${testSkill.name}": ${hasSkill ? '✅' : '❌'}`);
      });
    }
    console.log();

    // 5. Verify logic
    console.log('5. ✅ Filter Logic Verification:');
    console.log(`   - No filter: ${allExams.length} exams`);
    console.log(`   - With "${testSkill.name}" filter: ${filteredExams.length} exams`);
    
    // Check that filtered exams should be a subset of all exams or equal
    if (filteredExams.length <= allExams.length) {
      console.log('   ✅ Filtered count <= Total count (correct)');
    } else {
      console.log('   ❌ ERROR: Filtered count > Total count (incorrect!)');
    }

    // Check that each filtered exam actually contains the skill
    const allContainSkill = filteredExams.every(exam => 
      exam.skill_types?.includes(testSkill.name)
    );
    
    if (allContainSkill) {
      console.log('   ✅ All filtered exams contain the selected skill');
    } else {
      console.log('   ⚠️ Some filtered exams do NOT contain the selected skill');
    }

    console.log('\n🎉 Filter test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test
if (require.main === module) {
  testExamsFilter();
}

module.exports = { testExamsFilter };
