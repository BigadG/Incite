const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to format a single selection into an APA style citation
const formatCitation = ({ title, author, publicationDate, url }) => {
  if (!author || !publicationDate) {
    return null; // Return null for missing citation information
  }

  const date = new Date(publicationDate);
  const year = date.getFullYear();
  const authorFormatted = author.split(', ').reverse().join(' ');
  return `${authorFormatted} (${year}). ${title}. Retrieved from ${url}`;
};

const generateEssayContent = async ({ thesis, bodyPremises }, contentFromPages, selections) => {
  let citations = [];
  let missingCitations = [];

  // Attempt to format each selection into an APA style citation
  // and separate out missing citations
  selections.forEach(selection => {
    const citation = formatCitation(selection);
    if (citation) {
      citations.push(citation);
    } else {
      // Identify which pieces of information are missing
      const missingFields = {};
      if (!selection.author) missingFields.author = true;
      if (!selection.publicationDate) missingFields.publicationDate = true;

      if (Object.keys(missingFields).length > 0) {
        missingCitations.push({
          url: selection.url, // Expecting `url` to be a string
          author: selection.author || "",
          publicationDate: selection.publicationDate || "",
          missingFields: missingFields
        });
      }
    }
  });

  // If there are missing citations, return them
  if (missingCitations.length > 0) {
    return { missingCitations };
  }

  // Compose messages to send to the GPT API
  const messages = [
    {
      role: "system",
      content: "Compose a 700 or more word essay with an introductory thesis, body paragraphs on given premises, and a conclusion. Each paragraph should start with an indent. Include APA style citations and references."
    },
    {
      role: "user",
      content: `Thesis: ${thesis}\n\nBody Premises: ${bodyPremises.join('. ')}\n\nCitations: ${citations.join('\n')}\n\nContent: ${contentFromPages}`
    }      
  ];

  console.log("Messages sent to GPT API:", messages);

  // Request a completion from the GPT API
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: messages,
    max_tokens: 3500
  });

  let formattedEssay = completion.choices[0].message.content;

  // Post-process the essay to format paragraphs correctly
  formattedEssay = formattedEssay.replace(/\n\n/g, '\n'); // Replace double newlines with single newlines to remove unwanted breaks

  return formattedEssay;
};

module.exports = { generateEssayContent };
