const OpenAI = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const generateEssayContent = async (prompts) => {
  const userContent = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map((key, index) => `paragraph ${index + 1}: ${prompts[key]}`)
    .join('. ');

  const messages = [
    {"role": "system", "content": "You are a helpful assistant that generates full length college essays."},
    {"role": "user", "content": `Each of the following premises describe what each paragraph 
    of the essay should be about. They are presented to you in the order that they should be within 
    the essay. Make sure every single prompt has its own paragraph: ${userContent}`}
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages
  });

  return completion.choices[0].message.content;
};

module.exports = { generateEssayContent };
