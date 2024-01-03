const OpenAI = require('openai');

// Assuming that the OpenAI class can be instantiated directly with the API key.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {
  if (typeof contentFromPages !== 'string' || !contentFromPages.trim()) {
    throw new Error('Invalid or missing content from pages');
  }

  const userPrompts = typeof prompts === 'object' ? JSON.stringify(prompts) : prompts;

  try {
    // Make sure to use the correct method as per the OpenAI package documentation
    // This is a placeholder and may need to be updated according to the actual package API
    const completion = await openai.createCompletion({
      model: "gpt-4", // Change to your desired model
      prompt: `Here is the content from the pages the user has saved: ${contentFromPages}\n\n` +
              `The following premises describe what each paragraph of the essay should be about:\n${userPrompts}`,
      max_tokens: 2048,
    });

    if (!completion || !completion.choices || !completion.choices[0]) {
      throw new Error('Unexpected response structure from OpenAI API');
    }

    return completion.choices[0].text.trim();
  } catch (error) {
    console.error('Error in generateEssayContent:', error);
    throw error;
  }
};

module.exports = { generateEssayContent };











