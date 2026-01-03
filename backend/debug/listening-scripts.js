const TTS = require('../src/services/TextToSpeechService');

/**
 * Sample listening scripts để generate audio
 */
const LISTENING_SCRIPTS = {
  // LISTENING PART 1: Multiple Choice (7 câu)
  mcq: [
    {
      title: 'Part 1 - Question 1',
      text: 'Good morning. I would like to book a table for two people this evening at 7 PM. We prefer a quiet table by the window if possible.'
    },
    {
      title: 'Part 1 - Question 2',
      text: 'The weather forecast predicts heavy rain throughout the afternoon, so you might want to bring an umbrella if you plan to go out later.'
    },
    {
      title: 'Part 1 - Question 3',
      text: 'The museum is open from 10 AM to 6 PM every day except Mondays. Entrance fee is 15 dollars for adults and free for children under twelve.'
    },
    {
      title: 'Part 1 - Question 4',
      text: 'Hi John, could you please send me the meeting agenda before Friday? I need time to prepare my presentation for the board discussion.'
    },
    {
      title: 'Part 1 - Question 5',
      text: 'The flight to London has been delayed by two hours due to technical issues. Passengers are requested to wait in the departure lounge.'
    },
    {
      title: 'Part 1 - Question 6',
      text: 'Thank you for calling customer service. For billing inquiries, press 1. For technical support, press 2. For other matters, press 3.'
    },
    {
      title: 'Part 1 - Question 7',
      text: 'The company picnic is scheduled for next Saturday at Central Park. Please bring your own lunch and let HR know by Thursday.'
    }
  ],

  // LISTENING PART 2: Matching (6 items)
  matching: [
    {
      title: 'Part 2 - Item 1',
      text: 'Sarah is an experienced chef with fifteen years in the restaurant industry. She specializes in Italian cuisine and has won several cooking competitions.'
    },
    {
      title: 'Part 2 - Item 2',
      text: 'Michael is a software engineer who develops mobile applications. He has a passion for creating user-friendly apps that solve real-world problems.'
    },
    {
      title: 'Part 2 - Item 3',
      text: 'Emma works as a graphic designer and photographer. Her portfolio includes branding projects for various international companies.'
    },
    {
      title: 'Part 2 - Item 4',
      text: 'David is a high school teacher who focuses on environmental science. He organizes outdoor field trips to help students learn about nature.'
    },
    {
      title: 'Part 2 - Item 5',
      text: 'Lisa runs her own marketing consulting firm. She helps small businesses develop effective advertising strategies and social media campaigns.'
    },
    {
      title: 'Part 2 - Item 6',
      text: 'James is a nurse at the city hospital where he cares for patients and trains new medical staff on proper procedures.'
    }
  ],

  // LISTENING PART 3: Multiple Choice (7 câu)
  mcq2: [
    {
      title: 'Part 3 - Question 1',
      text: 'This morning I visited the local farmers market to buy fresh vegetables and fruits for the week. The quality was excellent and the prices were very reasonable.'
    },
    {
      title: 'Part 3 - Question 2',
      text: 'The government has announced new regulations regarding workplace safety. All companies must implement these changes by the end of next month.'
    },
    {
      title: 'Part 3 - Question 3',
      text: 'Our university is offering scholarship programs for international students. Applications are now open and the deadline is March 31st.'
    },
    {
      title: 'Part 3 - Question 4',
      text: 'The renovation of the downtown library is expected to be completed by June. The new facility will have a modern reading area and digital resources.'
    },
    {
      title: 'Part 3 - Question 5',
      text: 'I have just finished reading an interesting novel about ancient civilizations. The author provides fascinating insights into historical events.'
    },
    {
      title: 'Part 3 - Question 6',
      text: 'The swimming pool will be closed for maintenance from Monday to Friday. We apologize for any inconvenience this may cause.'
    },
    {
      title: 'Part 3 - Question 7',
      text: 'The new coffee shop near the station offers a wide selection of beverages and pastries. The staff is friendly and the atmosphere is very welcoming.'
    }
  ],

  // LISTENING PART 4: Gap Filling (5 gaps)
  gapFilling: [
    {
      title: 'Part 4 - Passage',
      text: 'The Amazon Rainforest is home to over ten million species of plants and animals. It produces approximately twenty percent of the world oxygen. Unfortunately it faces serious threats from deforestation every year. Scientists estimate that without intervention we could lose fifty percent of the forest by the year twenty fifty.'
    }
  ]
};

/**
 * Helper function para generate sample audio URLs
 */
async function generateSampleAudioUrls() {
  console.log('=== GENERATING SAMPLE AUDIO URLs ===\n');

  const allScripts = [
    ...LISTENING_SCRIPTS.mcq,
    ...LISTENING_SCRIPTS.matching,
    ...LISTENING_SCRIPTS.mcq2,
    ...LISTENING_SCRIPTS.gapFilling
  ];

  const results = {};

  for (let i = 0; i < allScripts.length; i++) {
    const script = allScripts[i];
    console.log(`[${i + 1}/${allScripts.length}] ${script.title}`);
    console.log(`Text: "${script.text.substring(0, 80)}..."`);

    try {
      const audioUrl = await TTS.generateAudio(script.text, 'en-US', 'en-US-Neural2-C');
      results[script.title] = {
        text: script.text,
        audioUrl: audioUrl.substring(0, 100) + '...' // Truncate for display
      };
      console.log(`✓ Generated\n`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ Error: ${error.message}\n`);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

// Export for use in seed
module.exports = {
  LISTENING_SCRIPTS,
  generateSampleAudioUrls
};
