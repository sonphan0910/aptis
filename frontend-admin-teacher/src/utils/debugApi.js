// Debug script to test public API endpoints
// Run this in browser console or use it to test API responses

async function testPublicApis() {
  console.log('🔍 Testing Public API Endpoints...\n');

  try {
    console.log('1️⃣ Testing /api/public/aptis-types');
    const aptisRes = await fetch('/api/public/aptis-types');
    const aptisData = await aptisRes.json();
    console.log('Response:', aptisData);
    console.log('---\n');

    console.log('2️⃣ Testing /api/public/skill-types');
    const skillsRes = await fetch('/api/public/skill-types');
    const skillsData = await skillsRes.json();
    console.log('Response:', skillsData);
    console.log('---\n');

    console.log('3️⃣ Testing /api/public/question-types');
    const questionsRes = await fetch('/api/public/question-types');
    const questionsData = await questionsRes.json();
    console.log('Response:', questionsData);
    console.log('---\n');

    console.log('✅ All endpoints tested successfully!');
  } catch (error) {
    console.error('❌ Error testing APIs:', error);
  }
}

// Export for use
window.testPublicApis = testPublicApis;

// Run automatically
testPublicApis();
