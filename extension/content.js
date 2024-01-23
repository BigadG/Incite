chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCitationData") {
    const citationData = extractCitationData();
    sendResponse({ citationData });
  }
});

function extractCitationData() {
  // Add more robust selectors
  const metaAuthor = document.querySelector('meta[name="author"]')?.content ||
                     document.querySelector('meta[property="og:author"]')?.content ||
                     'Author unknown';
  const metaTitle = document.querySelector('meta[property="og:title"]')?.content ||
                    document.querySelector('title')?.textContent ||
                    '';
  const metaDate = document.querySelector('meta[property="article:published_time"]')?.content || new Date().toISOString();
  console.log(`metaDate: ${metaDate}`); // Debug log

  const url = window.location.href;
  console.log(`url: ${url}`); // Debug log

  return {
    author: metaAuthor,
    title: metaTitle,
    datePublished: metaDate,
    url
  };
}

module.exports = { extractCitationData };

