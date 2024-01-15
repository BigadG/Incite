const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {
  // Extract the first premise as the main thesis
  const thesis = prompts['premise'];

  // Construct a string of body premises
  const bodyPremises = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map(key => prompts[key])
    .join('. ');  // Join premises with period to form a continuous text

  // Construct the message to be sent to the GPT API
  const messages = [
    {
      role: "system",
      content: "Write a 700-word essay. Start with an introduction that includes the thesis statement. Follow with body paragraphs based on the given premises, and conclude with a summary. Format the essay in a standard academic style, without indents or line breaks between paragraphs."
    },
    {
      role: "user",
      content: `Thesis: ${thesis}\n\nContent: ${contentFromPages}\n\nBody Premises: ${bodyPremises}`
    }      
  ];

  // Request a completion from the GPT API
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: messages
  });

  // Post-process the essay to format paragraphs correctly
  let formattedEssay = completion.choices[0].message.content;
  formattedEssay = formattedEssay.replace(/\n\n/g, '\n'); // Replace double newlines with single newlines to remove unwanted breaks

  return formattedEssay;
};
  
module.exports = { generateEssayContent };




