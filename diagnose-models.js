require('dotenv').config();

async function listAvailableModels() {
  try {
    console.log('='.repeat(60));
    console.log('DIAGNOSTIC: Listing Available Gemini Models');
    console.log('='.repeat(60));
    console.log('API Key configured:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');
    console.log('='.repeat(60));

    // Make direct API call to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data.error?.message || 'Unknown error');
      console.error('Status:', response.status);
      return;
    }

    const models = data.models || [];
    
    console.log(`\nFound ${models.length} available models:\n`);
    
    models.forEach((model, index) => {
      console.log(`${index + 1}. Model Name: ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods ? model.supportedGenerationMethods.join(', ') : 'None listed'}`);
      console.log('');
    });

    // Filter models that support generateContent
    const generateContentModels = models.filter(model => 
      model.supportedGenerationMethods && 
      model.supportedGenerationMethods.includes('generateContent')
    );

    console.log('='.repeat(60));
    console.log(`MODELS THAT SUPPORT generateContent: ${generateContentModels.length}`);
    console.log('='.repeat(60));
    
    generateContentModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name} (${model.displayName})`);
    });

    console.log('='.repeat(60));
    console.log('RECOMMENDED MODEL TO USE:');
    console.log('='.repeat(60));
    
    if (generateContentModels.length > 0) {
      // Recommend the first available model that supports generateContent
      const recommended = generateContentModels[0];
      console.log(`Model: ${recommended.name}`);
      console.log(`Display Name: ${recommended.displayName}`);
      console.log(`Description: ${recommended.description}`);
    } else {
      console.log('NO MODELS FOUND THAT SUPPORT generateContent');
      console.log('Your API key may not have the correct permissions.');
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error listing models:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

listAvailableModels();
