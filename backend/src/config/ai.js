
// Cấu hình AI - Dùng Google Gemini > Groq > Fallback
require('dotenv').config();

// ========================================
// GOOGLE GEMINI CONFIGURATION (Recommended) 🎯
// ========================================
const GEMINI_CONFIG = {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  model: process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.0-flash-exp', // Most accurate & fastest
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
  temperature: 0.3, // Lower = more consistent, deterministic
  maxTokens: 1024, // Enough for scoring JSON responses
};

// ========================================
// GROQ CONFIGURATION (Cloud) - Fallback
// ========================================
const GROQ_CONFIG = {
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
  baseURL: 'https://api.groq.com/openai/v1',
  temperature: 0.3,
  maxTokens: 1024,
};

// Determine which AI provider to use
let useGemini = !!GEMINI_CONFIG.apiKey;
let useGroq = !!GROQ_CONFIG.apiKey && !useGemini;

// Kiểm tra AI provider khả dụng
const checkAIProviders = async () => {
  if (useGemini) {
    console.log('[AI Config] ✅ Google Gemini API configured');
    console.log('[AI Config] 🤖 Model: ' + GEMINI_CONFIG.model);
    return;
  }

  if (useGroq) {
    console.log('[AI Config] ✅ Groq API configured (Fallback)');
    console.log('[AI Config] 🤖 Model: ' + GROQ_CONFIG.model);
    return;
  }

  console.log('[AI Config] ❌ No AI provider available');
  console.log('[AI Config] 💡 Hãy thiết lập GOOGLE_GEMINI_API_KEY hoặc GROQ_API_KEY');
};

// Check providers on startup
checkAIProviders();

/**
 * Gọi Google Gemini API (Cloud-based, most accurate)
 * @param {string} prompt - Prompt để gửi
 * @returns {Promise<string>} Kết quả từ model
 */
const callGemini = async (prompt) => {
  if (!GEMINI_CONFIG.apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY not configured');
  }

  try {
    console.log(`[Gemini] Calling model: ${GEMINI_CONFIG.model}`);
    
    const response = await fetch(
      `${GEMINI_CONFIG.baseURL}/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: GEMINI_CONFIG.temperature,
            maxOutputTokens: GEMINI_CONFIG.maxTokens,
            topP: 0.95,
            topK: 40,
          }
        }),
        timeout: 300000 // 5 minute timeout
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Gemini API error: ${errorMsg}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const content = data.candidates[0]?.content?.parts?.[0]?.text || '';
    console.log('[Gemini] ✅ Response received');
    return content;
  } catch (error) {
    console.error('[Gemini] ❌ Error:', error.message);
    throw error;
  }
};

/**
 * Gọi Groq API (Cloud-based, very fast)
 * @param {string} prompt - Prompt để gửi
 * @returns {Promise<string>} Kết quả từ model
 */
const callGroq = async (prompt) => {
  if (!GROQ_CONFIG.apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  try {
    console.log(`[Groq] Calling model: ${GROQ_CONFIG.model}`);
    
    const response = await fetch(`${GROQ_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_CONFIG.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: GROQ_CONFIG.temperature,
        max_tokens: GROQ_CONFIG.maxTokens,
      }),
      timeout: 300000 // 5 minute timeout
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Groq API error: ${errorMsg}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('[Groq] ✅ Response received');
    return content;
  } catch (error) {
    console.error('[Groq] ❌ Error:', error.message);
    throw error;
  }
};

/**
 * Gọi Ollama API (local inference)
 * @param {string} prompt - Prompt để gửi tới model
 * @param {object} options - Tùy chọn (model, temperature, v.v.)
 * @returns {Promise<string>} Kết quả từ model
 */
const callOllama = async (prompt, options = {}) => {
  const model = options.model || OLLAMA_CONFIG.model;
  const temperature = options.temperature ?? OLLAMA_CONFIG.temperature;
  
  try {
    console.log(`[Ollama] Calling model: ${model}`);
    const response = await fetch(`${OLLAMA_CONFIG.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature,
          num_predict: options.max_tokens || OLLAMA_CONFIG.num_predict,
        }
      }),
      timeout: 300000 // 5 minute timeout for local inference
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Ollama] ✅ Response received');
    return data.response || '';
  } catch (error) {
    console.error('[Ollama] ❌ Error:', error.message);
    throw error;
  }
};



/**
 * Gọi AI service (Gemini > Groq fallback)
 * @param {string} prompt - Prompt để gửi
 * @param {object} options - Tùy chọn
 * @returns {Promise<string>} Kết quả từ model
 */
const callAI = async (prompt, options = {}) => {
  if (useGemini) {
    console.log('[AI] Calling Google Gemini...');
    return callGemini(prompt);
  } else if (useGroq) {
    console.log('[AI] Calling Groq (fallback)...');
    return callGroq(prompt);
  } else {
    throw new Error('No AI provider available. Please configure GOOGLE_GEMINI_API_KEY or GROQ_API_KEY.');
  }
};

// Export các thành phần cấu hình AI
module.exports = {
  // Gemini (Cloud)
  callGemini,
  GEMINI_CONFIG,
  
  // Groq (Cloud fallback)
  callGroq,
  GROQ_CONFIG,
  
  // AI provider chung (Gemini > Groq)
  callAI,
  checkAIProviders,
  
  // Status
  isUsingGemini: () => useGemini,
  isUsingGroq: () => useGroq,
};
