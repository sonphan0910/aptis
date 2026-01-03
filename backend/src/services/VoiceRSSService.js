/**
 * VoiceRSS Text-to-Speech Service (Free, No API Key Required)
 * 
 * Simpler alternative to Google Cloud TTS
 * Không cần API key, free để sử dụng
 */
class VoiceRSSService {
  constructor() {
    this.baseUrl = 'https://api.voicerss.org';
    this.audioCache = {};
  }

  /**
   * Generate audio URL từ text bằng VoiceRSS
   * @param {string} text - Text cần convert sang audio
   * @param {string} language - Language code (en-us, vi-vn, etc.)
   * @returns {string} Audio URL
   */
  generateAudioUrl(text, language = 'en-us') {
    // Check cache
    const cacheKey = `${text}_${language}`;
    if (this.audioCache[cacheKey]) {
      console.log(`[VoiceRSS] Using cached URL for: ${text.substring(0, 50)}...`);
      return this.audioCache[cacheKey];
    }

    // Encode text
    const encodedText = encodeURIComponent(text);
    
    // Build URL
    // Note: key=testing works for testing/demo, có thể đăng ký free key tại voicerss.org
    const audioUrl = `${this.baseUrl}/?key=testing&hl=${language}&src=${encodedText}&f=16khz_16bit_mono&ssml=false`;
    
    // Cache it
    this.audioCache[cacheKey] = audioUrl;
    
    console.log(`[VoiceRSS] Generated URL for: ${text.substring(0, 50)}...`);
    return audioUrl;
  }

  /**
   * Generate audio URLs cho multiple texts
   */
  generateMultipleAudioUrls(texts, language = 'en-us') {
    console.log(`[VoiceRSS] Generating ${texts.length} audio URLs...`);
    
    const results = [];
    texts.forEach((text, index) => {
      const url = this.generateAudioUrl(text, language);
      results.push(url);
      console.log(`  [${index + 1}/${texts.length}] ✓`);
    });
    
    return results;
  }

  /**
   * Danh sách languages
   */
  getAvailableLanguages() {
    return {
      'en-us': 'English (US)',
      'en-gb': 'English (UK)',
      'en-au': 'English (Australian)',
      'es-es': 'Spanish (Spain)',
      'es-mx': 'Spanish (Mexico)',
      'fr-fr': 'French',
      'de-de': 'German',
      'it-it': 'Italian',
      'pt-br': 'Portuguese (Brazil)',
      'pt-pt': 'Portuguese (Portugal)',
      'ru-ru': 'Russian',
      'ja-jp': 'Japanese',
      'ko-kr': 'Korean',
      'zh-cn': 'Chinese (Simplified)',
      'vi-vn': 'Vietnamese',
      'ar-ar': 'Arabic',
      'th-th': 'Thai',
      'pl-pl': 'Polish',
      'tr-tr': 'Turkish',
      'nl-nl': 'Dutch'
    };
  }

  /**
   * Register API key tại voicerss.org để full access
   * Hiện tại "testing" key có limitations nhưng đủ cho demo
   */
  getApiKeyInfo() {
    return {
      info: 'VoiceRSS provides free text-to-speech API',
      website: 'https://voicerss.org',
      apiKey: 'testing', // Demo key
      limitations: 'Free tier có rate limit, đăng ký account để unlimited',
      registerUrl: 'https://www.voicerss.org/api/'
    };
  }
}

module.exports = new VoiceRSSService();
