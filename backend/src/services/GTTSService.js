const gTTS = require('gtts');
const fs = require('fs').promises;
const path = require('path');
const { STORAGE_CONFIG, ensureUploadDirs } = require('../config/storage');

class GTTSService {
  constructor() {
    ensureUploadDirs();
    this.audioDir = path.join(STORAGE_CONFIG.basePath, 'audio');
    this.audioCache = {};
  }

  async generateAudioFile(text, language = 'en', filename = null) {
    try {
      const cacheKey = `${text}_${language}`;
      if (this.audioCache[cacheKey]) {
        console.log(`[GTTS] Using cached audio for: ${text.substring(0, 50)}...`);
        return this.audioCache[cacheKey];
      }

      const audioFilename = filename || `${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
      const audioPath = path.join(this.audioDir, audioFilename);

      const gtts = new gTTS(text, language);
      await new Promise((resolve, reject) => {
        gtts.save(audioPath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const relativeUrl = `/uploads/audio/${audioFilename}`;
      this.audioCache[cacheKey] = {
        path: audioPath,
        url: relativeUrl,
        filename: audioFilename,
      };

      console.log(`[GTTS] Generated audio for: ${text.substring(0, 50)}...`);
      return this.audioCache[cacheKey];
    } catch (error) {
      console.error('[GTTS] Error generating audio:', error.message);
      throw error;
    }
  }

  async generateMultipleAudioFiles(texts, language = 'en') {
    console.log(`[GTTS] Generating ${texts.length} audio files...`);

    const results = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const audioInfo = await this.generateAudioFile(texts[i], language);
        results.push(audioInfo);
        console.log(`  [${i + 1}/${texts.length}] ✓`);
        
        if (i < texts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`  [${i + 1}/${texts.length}] ✗ Error:`, error.message);
        results.push(null);
      }
    }

    return results;
  }

  getAvailableLanguages() {
    return {
      'en': 'English',
      'vi': 'Vietnamese',
      'fr': 'French',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'th': 'Thai',
    };
  }

  getServiceInfo() {
    return {
      name: 'GTTS (Google Text-to-Speech)',
      info: 'Free text-to-speech powered by Google Translate',
      pros: ['No API key required', 'High quality', 'Many languages', 'Offline capable'],
      cons: ['Relies on Google Translate API (unofficial)', 'May have rate limiting'],
      languages: Object.keys(this.getAvailableLanguages()).length,
      outputFormat: 'MP3',
    };
  }
}

module.exports = new GTTSService();
