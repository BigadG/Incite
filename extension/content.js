//This script runs in the context of the webpage and extracts metadata
// content.js
(() => {
  let author = document.querySelector('meta[name="author"]')?.content ||
               document.querySelector('meta[property="og:author"]')?.content ||
               document.querySelector('meta[property="book:author"]')?.content ||
               document.querySelector('meta[name="article:author"]')?.content; // Additional selectors

  let publicationDate = document.querySelector('meta[property="article:published_time"]')?.content ||
                        document.querySelector('meta[name="date"]')?.content ||
                        document.querySelector('meta[name="DC.date.issued"]')?.content ||
                        document.querySelector('meta[name="publish-date"]')?.content ||
                        document.querySelector('meta[name="sailthru.date"]')?.content; // Additional selectors

  // Fallbacks if author or publicationDate are not found
  if (!author) {
    author = document.querySelector('article .author, .post-author, .meta-author')?.textContent.trim() || 'Unknown';
  }

  if (!publicationDate) {
    publicationDate = document.querySelector('time[datetime], .post-date, .meta-date')?.getAttribute('datetime') ||
                      document.querySelector('time')?.textContent.trim() || 
                      new Date().toISOString(); // Use current time as a last resort
  }

  return { author, publicationDate };
})();
