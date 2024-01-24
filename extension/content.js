// content.js
(() => {
  // Extend selectors list based on common patterns observed across various sites
  let authorSelectors = [
    'meta[name="author"]',
    'meta[property="og:author"]',
    'meta[property="book:author"]',
    'meta[name="article:author"]',
    'article .author',
    '.post-author',
    '.meta-author',
    '.author-name',
    // Include as many reasonable selectors as I can find across different websites
  ];

  let publicationDateSelectors = [
    'meta[property="article:published_time"]',
    'meta[name="date"]',
    'meta[name="DC.date.issued"]',
    'meta[name="publish-date"]',
    'meta[name="sailthru.date"]',
    'time[datetime]',
    '.post-date',
    '.meta-date',
    '.publish-date',
    // Again, add more selectors as needed
  ];

  function querySelectors(selectors) {
    for (let selector of selectors) {
      const content = document.querySelector(selector)?.content || document.querySelector(selector)?.getAttribute('content') || document.querySelector(selector)?.textContent;
      if (content) return content.trim();
    }
    return null;
  }

  // Function to extract information using heuristic-based extraction
  function heuristicExtraction(selector, regexPattern, matchGroupIndex = 0) {
    const elements = Array.from(document.querySelectorAll(selector));
    for (let element of elements) {
      const matches = element.textContent.match(regexPattern);
      if (matches) {
        return matches[matchGroupIndex].trim();
      }
    }
    return null;
  }

  let author = querySelectors(authorSelectors) || heuristicExtraction('p, div', /by\s+([^\n\r]+)/i, 1) || 'Unknown';
  let publicationDate = querySelectors(publicationDateSelectors) || heuristicExtraction('p, span, div', /\b\d{4}-\d{2}-\d{2}\b/) || null;

  if (publicationDate) {
    publicationDate = new Date(publicationDate).toISOString();
  }

  return { author, publicationDate };
})();



