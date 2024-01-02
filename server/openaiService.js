const { OpenAI, Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generateEssayContent = async (prompts, contentFromPages) => {
  // Validate input
  if (!prompts || typeof prompts !== 'object' || !Object.keys(prompts).length) {
    throw new Error('Invalid or missing prompts');
  }
  if (!contentFromPages || typeof contentFromPages !== 'string') {
    throw new Error('Invalid or missing content from pages');
  }

  // Construct the content to send to the OpenAI API
  const userPrompts = Object.entries(prompts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ 
      type: "essay",
      prompt: value
    }));

  try {
    const response = await openai.createCompletion({
      model: "GPT-4",
      prompt: userPrompts.map(up => up.prompt).join('\n\n') + "\n\n" + contentFromPages,
      max_tokens: 2048,
      temperature: 0.7,
      n: 1,
      stop: ["\n"]
    });

    // Ensure that the API response is structured as expected
    if (!response || !response.data || !response.data.choices) {
      throw new Error('Unexpected response structure from OpenAI API');
    }

    // Check if there's content in the completion choices
    if (!response.data.choices.length || !response.data.choices[0].text) {
      throw new Error('No content returned from OpenAI API');
    }

    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error in generateEssayContent:', error);
    // Re-throw the error to handle it in the calling function
    throw error;
  }
};

module.exports = { generateEssayContent };

