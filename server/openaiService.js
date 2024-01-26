const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateCitations = async (selections) => {
  // Log the selections to check if they are correctly passed
  console.log("Selections for citation:", selections);

  const citationPrompts = selections.map(selection =>
    `Generate a citation in APA format for the following page: Title: "${selection.title}", Author: "${selection.author}", URL: "${selection.url}", Accessed on: "${selection.accessDate}".`
  );

  const citations = await Promise.all(citationPrompts.map(async (citationPrompt) => {
    const completion = await openai.completions.create({
      model: "gpt-4-1106-preview",
      prompt: citationPrompt,
      max_tokens: 60,
    });
    return completion.choices[0].text.trim();
  }));

  // Log generated citations to verify
  console.log("Generated citations:", citations);
  return citations.join('\n');
};

const generateEssayContent = async (prompts, contentFromPages, selections) => {
  const citations = await generateCitations(selections);
  console.log("Citations received in generateEssayContent:", citations);
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
      content: "Compose a 700 or more word essay with an introductory thesis, body paragraphs on given premises, and a conclusion, all of which should have indents at the start of each paragraph. Include no paragraph titles or line breaks. Include APA stlyle citations"
    },
    {
      role: "user",
      content: `Thesis: ${thesis}\n\nContent: ${contentFromPages}\n\nBody Premises: ${bodyPremises}\n\nCitations: ${citations}`
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




