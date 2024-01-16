const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async (prompts, contentFromPages) => {
  // Construct a string of premises, with the first premise separated as the main thesis
  const thesis = prompts['premise'];
  const bodyPremises = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map(key => `${prompts[key]}`)
    .slice(1)  // Skip the first premise since it's used as the thesis
    .join('. ');
    
  // Construct the message to be sent to the GPT API
  const messages = [
    {
      role: "system",
      content: "Compose a 700-word essay with an introductory thesis, body paragraphs on given premises, and a conclusion, all of which should have indents at the start of each paragraph. Include no paragraph titles or line breaks."
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




