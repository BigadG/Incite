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
    // Include as many reasonable selectors as you I find across different websites
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

  // Regular expressions for finding author and publication date
  const dateRegex = /\b(19|20)\d{2}[-/](0[1-9]|1[012])[-/](0[1-9]|[12][0-9]|3[01])\b/;
  const authorRegex = /(?:author|by)\s*:\s*(.+?)(?:\||<|\/|\n|$)/i;

  let author = querySelectors(authorSelectors) ||
               heuristicExtraction('p, div', authorRegex, 1) || 
               document.body.textContent.match(authorRegex)?.[1]?.trim() ||
               null;

  let publicationDate = querySelectors(publicationDateSelectors) ||
                        heuristicExtraction('p, span, div', dateRegex) ||
                        document.body.textContent.match(dateRegex)?.[0] ||
                        null;

  if (publicationDate) {
    // Attempt to standardize the publication date format
    publicationDate = new Date(publicationDate).toISOString();
  } else {
    // If no publication date is found, leave it as null
    publicationDate = null;
  }

  return { author, publicationDate };
})();