/**
 * CEFR Level Conversion Service
 * Handles conversion from CEFR levels to numeric scores based on APTIS standards
 */

class CefrConverterService {
  /**
   * Convert CEFR level to numeric score based on task type and max score
   * @param {string} cefrLevel - CEFR level like 'A2.1', 'B1.2', 'C1', etc.
   * @param {string} questionTypeCode - Question type code to determine task
   * @param {number} maxScore - Maximum score for the criterion
   * @returns {number} Numeric score
   */
  convertCefrToScore(cefrLevel, questionTypeCode, maxScore) {
    // Normalize CEFR level for comparison
    const normalizedLevel = cefrLevel.trim().toUpperCase().replace(/\s+/g, '');
    
    console.log(`[convertCefrToScore] Converting "${cefrLevel}" (${normalizedLevel}) for ${questionTypeCode}, maxScore: ${maxScore}`);
    
    // Define mappings based on APTIS Technical Report (Official British Council Document)
    // Based on Appendix 1 and task-specific scales
    let scoreMapping = {};
    
    if (maxScore === 4) {
      // Writing Task 1 (A1 level) - 0-4 scale
      scoreMapping = {
        'BELOWA1': 0,
        'BELOWA2': 0,
        'A1.1': 1,
        'A1': 1,
        'WEAKA1': 1,
        'A1.2': 2,
        'STRONGA1': 2,
        'ABOVEA1': 2,
        'A2.1': 3,
        'A2': 3,
        'A2.2': 4,
        'STRONGA2': 4,
        'ABOVEA2': 4
      };
    } else if (maxScore === 5) {
      // Writing Task 2 (A2 level) - 0-5 scale
      scoreMapping = {
        'BELOWA1': 0,
        'BELOWA2': 0,
        'A1': 0,
        'WEAKA1': 0,
        'A1.1': 1,
        'A1.2': 1,
        'STRONGA1': 1,
        'ABOVEA1': 1,
        'A2.1': 2,
        'A2': 2,
        'WEAKA2': 2,
        'A2.2': 3,
        'STRONGA2': 3,
        'ABOVEA2': 4,
        'B1.1': 4,
        'B1': 4,
        'B1.2': 5,
        'STRONGB1': 5,
        'ABOVEB1': 5
      };
    } else if (maxScore === 6) {
      // Writing Tasks 3&4, Speaking Task 4 (B1-B2 level) - 0-6 scale
      scoreMapping = {
        'BELOWA1': 0,
        'BELOWA2': 0,
        'A1': 0,
        'A1.1': 0,
        'A1.2': 0,
        'A2': 0,
        'A2.1': 0,
        'A2.2': 1,
        'STRONGA2': 1,
        'ABOVEA2': 1,
        'B1.1': 2,
        'B1': 2,
        'WEAKB1': 2,
        'B1.2': 3,
        'STRONGB1': 3,
        'ABOVEB1': 4,
        'B2.1': 4,
        'B2': 4,
        'WEAKB2': 4,
        'B2.2': 5,
        'STRONGB2': 5,
        'ABOVEB2': 5,
        'C1': 6,
        'C1.1': 6,
        'C1.2': 6,
        'C2': 6
      };
    } else {
      // Default 0-5 scale for other tasks
      scoreMapping = {
        'BELOWA1': 0,
        'BELOWA2': 0,
        'A1': 1,
        'A1.1': 1,
        'A1.2': 1,
        'A2': 2,
        'A2.1': 2,
        'A2.2': 2,
        'B1': 3,
        'B1.1': 3,
        'B1.2': 3,
        'B2': 4,
        'B2.1': 4,
        'B2.2': 4,
        'C1': 5,
        'C1.1': 5,
        'C1.2': 5,
        'C2': 5
      };
    }
    
    // Try to find exact match first
    if (scoreMapping[normalizedLevel] !== undefined) {
      console.log(`[convertCefrToScore] Exact match: ${cefrLevel} -> ${scoreMapping[normalizedLevel]}`);
      return scoreMapping[normalizedLevel];
    }
    
    // Handle common CEFR variations and qualifiers based on APTIS patterns
    const cefrVariations = {
      'STRONG': (level) => level.replace('STRONG', '').trim(),
      'WEAK': (level) => level.replace('WEAK', '').trim(),
      'ABOVE': (level) => level.replace('ABOVE', '').trim(),
      'BELOW': (level) => level.replace('BELOW', '').trim(),
      'TYPICAL': (level) => level.replace('TYPICAL', '').trim()
    };
    
    // Try variations with qualifiers
    for (const [qualifier, transform] of Object.entries(cefrVariations)) {
      if (normalizedLevel.includes(qualifier)) {
        const baseLevel = transform(normalizedLevel);
        if (scoreMapping[baseLevel] !== undefined) {
          let adjustedScore = scoreMapping[baseLevel];
          
          // Apply qualifier adjustments
          if (qualifier === 'STRONG' || qualifier === 'ABOVE') {
            adjustedScore = Math.min(maxScore, adjustedScore + 0.5);
          } else if (qualifier === 'WEAK' || qualifier === 'BELOW') {
            adjustedScore = Math.max(0, adjustedScore - 0.5);
          }
          
          console.log(`[convertCefrToScore] Qualifier match: ${cefrLevel} -> ${baseLevel} (${qualifier}) -> ${adjustedScore}`);
          return Math.round(adjustedScore);
        }
      }
    }
    
    // Try partial matches for main CEFR levels based on task target
    const taskTargetMappings = {
      // For A2-target tasks (Speaking Task 1, Writing Task 2)
      'A2_TARGET': {
        'A1': 1, 'A2': 3, 'B1': 5, 'B2': 5, 'C1': 5, 'C2': 5
      },
      // For B1-target tasks (Speaking Tasks 2&3, Writing Task 3)  
      'B1_TARGET': {
        'A1': 0, 'A2': 2, 'B1': 3, 'B2': 5, 'C1': 5, 'C2': 5
      },
      // For B2-target tasks (Speaking Task 4, Writing Task 4)
      'B2_TARGET': {
        'A1': 0, 'A2': 0, 'B1': 1, 'B2': 3, 'C1': 5, 'C2': 6
      }
    };
    
    // Determine task target based on questionTypeCode and maxScore
    let taskTarget = 'B1_TARGET'; // default
    if (maxScore === 6) {
      taskTarget = 'B2_TARGET';
    } else if (questionTypeCode === 'SPEAKING_INTRO' || 
               (questionTypeCode && questionTypeCode.includes('WRITING') && maxScore === 4)) {
      taskTarget = 'A2_TARGET';
    }
    
    const targetMapping = taskTargetMappings[taskTarget];
    
    // Extract main CEFR level (A1, A2, B1, B2, C1, C2)
    const mainLevelMatch = normalizedLevel.match(/([ABC][12])/);
    if (mainLevelMatch && targetMapping[mainLevelMatch[1]] !== undefined) {
      const score = targetMapping[mainLevelMatch[1]];
      console.log(`[convertCefrToScore] Main level match: ${cefrLevel} -> ${mainLevelMatch[1]} -> ${score} (${taskTarget})`);
      return score;
    }
    
    // Fallback: try to extract numeric if present
    const numericMatch = cefrLevel.match(/\d+\.?\d*/);
    if (numericMatch) {
      const numericScore = Math.min(parseFloat(numericMatch[0]), maxScore);
      console.log(`[convertCefrToScore] Numeric fallback: ${cefrLevel} -> ${numericScore}`);
      return numericScore;
    }
    
    // Final fallback
    console.warn(`[convertCefrToScore] No mapping found for '${cefrLevel}', using fallback score 0`);
    return 0;
  }
}

module.exports = new CefrConverterService();