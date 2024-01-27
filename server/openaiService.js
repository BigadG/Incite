const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateEssayContent = async ({ thesis, bodyPremises }, contentFromPages) => {
  const messages = [
    {
      role: "system",
      content: "Compose a 700 or more word essay with an introductory thesis, body paragraphs on given premises, and a conclusion, all of which should have indents at the start of each paragraph. Include no paragraph titles or line breaks."
    },
    {
      role: "user",
      content: `Thesis: ${thesis}\n\nBody Premises: ${bodyPremises.join('. ')}\n\nContent: ${contentFromPages}`
    }      
  ];

  console.log("Messages sent to GPT API:", messages);

  // Request a completion from the GPT API
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: messages,
    max_tokens: 3500
  });

  // Post-process the essay to format paragraphs correctly
  let formattedEssay = completion.choices[0].message.content;
  formattedEssay = formattedEssay.replace(/\n\n/g, '\n'); // Replace double newlines with single newlines to remove unwanted breaks

  return formattedEssay;
};
  
module.exports = { generateEssayContent };




