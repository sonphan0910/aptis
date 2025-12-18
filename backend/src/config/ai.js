const Groq = require('groq-sdk');
require('dotenv').config();

console.log('[AI Config] Using Groq API for scoring');

// Initialize Groq client
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.warn('[AI Config] ⚠️ Warning: GROQ_API_KEY not set in .env file');
}

const groqClient = new Groq({ apiKey: groqApiKey });

// Get Groq client
const getGroqModel = () => {
  if (!groqApiKey) {
    throw new Error('Groq API key not configured. Set GROQ_API_KEY in .env');
  }
  return groqClient;
};

// Groq configuration
const GROQ_CONFIG = {
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  temperature: 0.7,
  max_tokens: 2048,
};

module.exports = {
  groqClient,
  getGroqModel,
  GROQ_CONFIG,
};
