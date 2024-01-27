const generateEssayWithSelections = async (req, res) => {
    try {
      const { urls, premises } = req.body; // Ensure you're getting premises from the request body
  
      if (!Array.isArray(urls)) {
        console.error('URLs provided are not an array:', urls);
        return res.status(400).json({ message: 'URLs must be an array' });
      }
      
      // Calculate the max word count per selection based on total max words allowed
      const totalMaxWords = MAX_WORDS < 700 ? 700 : MAX_WORDS;
      const maxWordCountPerSelection = Math.floor(totalMaxWords / urls.length);
  
      // Fetch and process the content from each page
      const contentFromPages = await Promise.allSettled(urls.map(url => fetchAndProcessPage(url, maxWordCountPerSelection)))
        .then(results => results.filter(result => result.status === 'fulfilled').map(result => result.value));
  
      // Check if any page content could not be processed
      if (contentFromPages.some(content => content === '')) {
        console.error('One or more pages returned no content:', contentFromPages);
        return res.status(400).json({ message: 'One or more pages could not be processed' });
      }
      
      // Retrieve selections from the database to get the citation information
      const db = await connect();
      const uuid = req.userId;
      const user = await db.collection('Users').findOne({ uuid });
      const selections = user ? user.selections : []; // This should include title, url, author, publicationDate
      
      console.log("Selections retrieved for essay generation:", selections);
      console.log("Calling generateEssayContent with premises and selections...");
  
      // Pass the premises and selections along with the content to the GPT API to generate the essay
      const essay = await generateEssayContent(premises, contentFromPages.join("\n\n"), selections);
      res.status(200).json({ essay });
    } catch (error) {
      console.error('Error generating essay with selections:', error);
      res.status(500).json({ message: 'Error generating essay with selections', error: error.toString() });
    }
  };