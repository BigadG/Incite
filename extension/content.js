// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCitationData") {
      const citationData = extractCitationData();
      sendResponse({ citationData });
    }
  });
  
  function extractCitationData() {
    const metaAuthor = document.querySelector('meta[name="author"]')?.content;
    const metaTitle = document.querySelector('meta[property="og:title"]')?.content || document.title;
    const metaDate = document.querySelector('meta[property="article:published_time"]')?.content || new Date().toISOString();
    const url = window.location.href;
  
    return {
      author: metaAuthor || 'Author unknown',
      title: metaTitle,
      datePublished: metaDate,
      url
    };
  }
  