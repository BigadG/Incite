const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {
  const userContent = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map((key, index) => `paragraph ${index + 1}: ${prompts[key]}`)
    .join('. ');

    const messages = [{ role: "system", content: "You are a tool that generates full length college essays using the information you're provided"},
      {role: "user", content: `Here is the content from the pages the user has saved: ${contentFromPages}\n\n` +
      `Reference only that content and use it to generate the essay using the following premises. Each premise describes 
      what each paragraph of the essay should be about:\n${userContent}`}
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages
    });
  
    return completion.choices[0].message.content;
};
  
  module.exports = { generateEssayContent };




