//This script runs in the context of the webpage and extracts metadata
(() => {
  let authorSelectors = [
    'meta[name="author"]',
    'meta[property="og:author"]',
    'meta[property="book:author"]',
    'meta[name="article:author"]',
    'article .author',
    '.post-author',
    '.meta-author',
    '.author-name',
    // Add any more selectors that are relevant to the websites you are targeting
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

  // Function to query the document with a set of selectors until one matches
  function querySelectors(selectors) {
    for (let selector of selectors) {
      const content = document.querySelector(selector)?.content || document.querySelector(selector)?.textContent;
      if (content) return content.trim();
    }
    return null; // Return null if no matching selectors are found
  }

  let author = querySelectors(authorSelectors) || 'Unknown';
  let publicationDate = querySelectors(publicationDateSelectors);

  if (publicationDate) {
    // Attempt to standardize the publication date format
    publicationDate = new Date(publicationDate).toISOString();
  } else {
    // If no publication date is found, leave it as null
    publicationDate = null;
  }

  return { author, publicationDate };
})();


