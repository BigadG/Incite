const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Optional: Implement a basic caching mechanism for citations
// This can be expanded or replaced with a more robust caching solution
const citationCache = {};

const generateCitations = async (selections) => {
  // Log the selections to check if they are correctly passed
  console.log("Selections for citation:", selections);

  // Check cache first
  const uncachedSelections = selections.filter(selection => !citationCache[selection.url]);
  if (uncachedSelections.length === 0) {
    console.log("All citations retrieved from cache");
    return selections.map(selection => citationCache[selection.url]).join('\n');
  }

  const citationPrompt = uncachedSelections.map(selection =>
    `Generate a citation in APA format for the following page: Title: "${selection.title}", Author: "${selection.author}", URL: "${selection.url}", Accessed on: "${selection.accessDate}".`
  ).join('\n\n');

  // Generate citations in a single batch request
  const completion = await openai.completions.create({
    model: "gpt-4-1106-preview",
    prompt: citationPrompt,
    max_tokens: 60 * uncachedSelections.length,
  });

  // Split the response into individual citations
  const generatedCitations = completion.choices[0].text.trim().split('\n\n');

  // Cache the new citations and construct the final citation string
  let finalCitations = selections.map(selection => {
    const generatedCitation = generatedCitations.shift();
    if (generatedCitation) {
      citationCache[selection.url] = generatedCitation;
      return generatedCitation;
    }
    return citationCache[selection.url];
  });

  // Log generated citations to verify
  console.log("Generated citations:", finalCitations);
  return finalCitations.join('\n');
};

const generateEssayContent = async (prompts, contentFromPages, selections) => {
  const citations = await generateCitations(selections);
  console.log("Citations received in generateEssayContent:", citations);

  // Constructing thesis and body premises
  const thesis = prompts['premise'];
  const bodyPremises = Object.keys(prompts)
    .sort()
    .filter(key => key.startsWith('prompt'))
    .map(key => prompts[key])
    .slice(1)  // Skip the first premise (thesis)
    .join('. ');
  
  const messages = [
    {
      role: "system",
      content: "Compose a 700 or more word essay with an introductory thesis, body paragraphs on given premises, and a conclusion. Include APA style citations."
    },
    {
      role: "user",
      content: `Thesis: ${thesis}\n\nContent: ${contentFromPages}\n\nBody Premises: ${bodyPremises}\n\nCitations: ${citations}`
    }
  ];

  console.log("Messages sent to GPT API:", messages);

  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: messages,
    max_tokens: 3500
  });

  let formattedEssay = completion.choices[0].message.content;
  formattedEssay = formattedEssay.replace(/\n\n/g, '\n');

  return formattedEssay;
};

module.exports = { generateEssayContent };




