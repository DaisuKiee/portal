require('dotenv').config();
const https = require('https');

const listAvailableModels = async () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in .env file');
      process.exit(1);
    }

    console.log('🔍 Checking available Gemini models...\n');

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            console.error('❌ API Error:', response.error.message);
            process.exit(1);
          }

          console.log('✅ Available Models:\n');
          console.log('='.repeat(80));

          let generateContentModels = [];

          response.models.forEach((model) => {
            const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
            
            console.log(`\nModel: ${model.name}`);
            console.log(`Display Name: ${model.displayName}`);
            console.log(`Description: ${model.description || 'N/A'}`);
            console.log(`Supports generateContent: ${supportsGenerate ? '✅ YES' : '❌ NO'}`);
            
            if (model.inputTokenLimit) {
              console.log(`Input Token Limit: ${model.inputTokenLimit.toLocaleString()}`);
            }
            if (model.outputTokenLimit) {
              console.log(`Output Token Limit: ${model.outputTokenLimit.toLocaleString()}`);
            }
            
            console.log('-'.repeat(80));

            if (supportsGenerate) {
              const modelName = model.name.replace('models/', '');
              generateContentModels.push(modelName);
            }
          });

          console.log('\n\n📋 MODELS THAT SUPPORT generateContent (use these in your code):\n');
          generateContentModels.forEach((modelName, index) => {
            console.log(`${index + 1}. ${modelName}`);
          });

          console.log('\n\n💡 RECOMMENDED FOR YOUR USE CASE:');
          
          const recommended = generateContentModels.find(m => 
            m.includes('1.5') && m.includes('flash')
          ) || generateContentModels.find(m => 
            m.includes('flash')
          ) || generateContentModels[0];

          console.log(`\nUse this model: "${recommended}"`);
          console.log('\nUpdate your code to:');
          console.log(`const model = genAI.getGenerativeModel({ model: '${recommended}' });`);

          process.exit(0);
        } catch (parseError) {
          console.error('❌ Error parsing response:', parseError.message);
          console.error('Raw response:', data);
          process.exit(1);
        }
      });
    }).on('error', (error) => {
      console.error('❌ Request error:', error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listAvailableModels();

