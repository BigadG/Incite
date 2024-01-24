//This script runs in the context of the webpage and extracts metadata
//Potentially move to src folder if this doesn't work
(() => {
  const metadata = {
    author: document.querySelector('meta[name="author"]')?.content,
    publicationDate: document.querySelector('meta[property="article:published_time"]')?.content || new Date().toISOString(),
    // Add more selectors if needed
  };
  return metadata;
})();
