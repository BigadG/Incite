chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractCitationData") {
    const citationData = extractCitationData();
    sendResponse(citationData);
  }
  return true; // Indicates an asynchronous response
});

function extractCitationData() {
  const metaAuthor = document.querySelector('meta[name="author"]')?.content ||
                     document.querySelector('meta[property="og:author"]')?.content ||
                     document.querySelector('meta[property="article:author"]')?.content ||
                     'Author unknown';

  const metaTitle = document.querySelector('meta[property="og:title"]')?.content ||
                    document.querySelector('meta[name="title"]')?.content ||
                    document.title ||
                    '';

  const metaDate = document.querySelector('meta[property="article:published_time"]')?.content || 
                    new Date().toISOString();

  const url = window.location.href;

  return {
    author: metaAuthor,
    title: metaTitle,
    datePublished: metaDate,
    url
  };
}
