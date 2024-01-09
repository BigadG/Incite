const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {
  console.log('Content from pages:', contentFromPages);
  console.log('Prompts:', prompts);

  if (typeof contentFromPages !== 'string' || contentFromPages.match(/^\s*$/)) {
    throw new Error('Invalid or missing content from pages');
  }
  if (!Array.isArray(prompts) || prompts.length === 0) {
    throw new Error('Invalid or missing premises');
  }

  try {
    const completion = await openai.createCompletion({
      model: "gpt-4", // Change to your desired model
      prompt: `Here is the content from the pages the user has saved: ${contentFromPages}\n\n` +
              `The following premises describe what each paragraph of the essay should be about: ${prompts.join('\n')}`,
      max_tokens: 2048,
    });

    if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].text) {
      throw new Error('Unexpected response structure from OpenAI API');
    }

    // Removed trim() as per the requirement
    return completion.choices[0].text;
  } catch (error) {
    console.error('Error in generateEssayContent:', error);
    throw error;
  }
};

module.exports = { generateEssayContent };












