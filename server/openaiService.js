const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {

  const userPrompts = typeof prompts === 'object' ? JSON.stringify(prompts) : prompts;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Change to your desired model
      messages: [{ role: "system", content: "You are a tool that generates full length college essays using the information you're provided"},
      {role: "user", content: `Here is the content from the pages the user has saved: ${contentFromPages}\n\n` +
      `Reference only that content and use it to generate the essay using the following premises. Each premise describes 
      what each paragraph of the essay should be about:\n${userPrompts}`}],
    });

    if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].text) {
      throw new Error('Unexpected response structure from OpenAI API');
    }

    return completion.choices[0].text;
  } catch (error) {
    console.error('Error in generateEssayContent:', error);
    throw error;
  }
};

module.exports = { generateEssayContent };










