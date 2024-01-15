const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {
  // Construct a string of premises, with the first premise separated as the main thesis
  const thesis = prompts['premise'];
  const bodyPremises = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map((key, index) => prompts[key])
    .slice(1)  // Skip the first premise since it's used as the thesis
    .join('. ');

  // Construct the message to be sent to the GPT API
  const messages = [
    {
      role: "system",
      content: "Write a 700-word college essay in standard format. Start with an introduction that includes the thesis statement, follow with body paragraphs each based on the given premises without titles, and end with a conclusion. Please indent the first line of each paragraph."
    },
    {
      role: "user",
      content: `Thesis: ${thesis}\n\nContent: ${contentFromPages}\n\nBody Premises:\n${bodyPremises}`
    }      
  ];

  // Request a completion from the GPT API
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: messages
  });

  // Post-process the essay to ensure it has indents for each paragraph
  let formattedEssay = completion.choices[0].message.content;
  formattedEssay = formattedEssay.replace(/\n/g, '\n\t'); // Replace newlines with indents

  return formattedEssay;
};
  
module.exports = { generateEssayContent };




