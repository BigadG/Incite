chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractCitationData") {
    const citationData = extractCitationData();
    sendResponse(citationData);
  }
  return true;  // Important for asynchronous sendResponse
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
                    
  console.log('Author Meta Tag:', document.querySelector('meta[name="author"]')?.outerHTML);
  console.log('Title Meta Tag:', document.querySelector('meta[property="og:title"]')?.outerHTML);

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

