chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCitationData") {
    const citationData = extractCitationData();
    sendResponse({ citationData });
  }
});

function extractCitationData() {
  // Temporarily hardcode values for debugging
  const metaAuthor = "John Doe";
  const metaTitle = "Example Title";

  // Temporary debugging logs
  console.log('metaAuthor:', metaAuthor);
  console.log('metaTitle:', metaTitle);

  const metaDate = document.querySelector('meta[property="article:published_time"]')?.content || new Date().toISOString();
  const url = window.location.href;

  return {
    author: metaAuthor,
    title: metaTitle,
    datePublished: metaDate,
    url
  };
}

module.exports = { extractCitationData };
