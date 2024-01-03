const OpenAI = require('openai');

const openai = new OpenAI();

const generateEssayContent = async (prompts, contentFromPages) => {
  if (!contentFromPages || typeof contentFromPages !== 'string') {
    throw new Error('Invalid or missing content from pages');
  }

  // Check if prompts is an object and convert it to a string
  const userPrompts = typeof prompts === 'object' ? JSON.stringify(prompts) : prompts;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Change to your desired model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Here is the content from the pages the user has saved: ${contentFromPages}` },
        { role: "user", content: `The following premises describe what each paragraph of the essay should be about: ${userPrompts}` }
      ],
    });

    if (!completion || !completion.choices || !completion.choices[0]) {
      throw new Error('Unexpected response structure from OpenAI API');
    }

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error in generateEssayContent:', error);
    throw error;
  }
};

module.exports = { generateEssayContent };




