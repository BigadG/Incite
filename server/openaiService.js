const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {
  const userContent = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map((key, index) => `paragraph ${index + 1}: ${prompts[key]}`)
    .join('. ');

    const messages = [
      {
        role: "system",
        content: "Write a 700 or more word college essay in standard format based on provided content and premises. Use the first premise as the premise for the entire essay, and all other premises for each body paragraph"
      },
      {
        role: "user",
        content: `Content: ${contentFromPages}\n\nPremises:\n${userContent}`
      }      
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: messages
    });
  
    return completion.choices[0].message.content;
};
  
  module.exports = { generateEssayContent };



