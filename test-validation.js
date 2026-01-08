// Test validation logic for question content

const isValidQuestionContent = (content) => {
  if (!content) return false;
  
  try {
    // If it's a JSON string, parse and check if it has meaningful content
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    
    // Check if it's empty object or has some content
    if (typeof parsed === 'object' && parsed !== null) {
      // For objects, check if it has any meaningful properties
      const keys = Object.keys(parsed);
      if (keys.length === 0) return false;
      
      // Check if any property has meaningful content
      for (const key of keys) {
        const value = parsed[key];
        if (typeof value === 'string' && value.trim()) return true;
        if (Array.isArray(value) && value.length > 0) return true;
        if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) return true;
      }
      return false;
    }
    
    // For string content, check if it's not empty
    return typeof parsed === 'string' && parsed.trim().length > 0;
  } catch {
    // If it's not JSON, treat as plain string
    return typeof content === 'string' && content.trim().length > 0;
  }
};

// Test cases
console.log('Test 1 - Empty object:', isValidQuestionContent('{}'));  // Should be false
console.log('Test 2 - Empty string:', isValidQuestionContent(''));   // Should be false
console.log('Test 3 - Object with empty values:', isValidQuestionContent('{"title":"","passage":""}'));  // Should be false
console.log('Test 4 - Object with content:', isValidQuestionContent('{"title":"Test","passage":"Some content"}'));  // Should be true
console.log('Test 5 - Array with content:', isValidQuestionContent('{"options":[{"text":"A"}]}'));  // Should be true
console.log('Test 6 - Plain string:', isValidQuestionContent('Plain text content'));  // Should be true
console.log('Test 7 - Whitespace only:', isValidQuestionContent('   '));  // Should be false

// Test MCQ Form typical output
const mcqContent = JSON.stringify({
  title: "Sample Question",
  question: "What is 2+2?", 
  options: [
    { id: 'A', text: '3', isCorrect: false },
    { id: 'B', text: '4', isCorrect: true }
  ],
  explanation: ""
});
console.log('Test 8 - MCQ Content:', isValidQuestionContent(mcqContent));  // Should be true

// Test empty MCQ form 
const emptyMcqContent = JSON.stringify({
  title: "",
  question: "", 
  options: [],
  explanation: ""
});
console.log('Test 9 - Empty MCQ Content:', isValidQuestionContent(emptyMcqContent));  // Should be false