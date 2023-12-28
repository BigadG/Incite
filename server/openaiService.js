const OpenAI = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const generateEssayContent = async (prompts, contentFromPages) => {
  const userContent = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map((key, index) => `paragraph ${index + 1}: ${prompts[key]}`)
    .join('. ');

    const messages = [
      {"role": "system", "content": "You are a helpful assistant that generates college essays."},
      {"role": "user", "content": `Here is the content from the pages the user has saved: ${contentFromPages}. Each of the following premises describe what each paragraph of the essay should be about: ${prompts}`}
    ];

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages
  });

  return completion.choices[0].message.content;
};

module.exports = { generateEssayContent };
