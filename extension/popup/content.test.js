const { JSDOM } = require('jsdom');

describe('content script', () => {
  it('correctly extracts citation data', () => {
    // Mock the DOM with meta tags and structured data
    const dom = new JSDOM(`
      <html>
      <head>
        <meta name="author" content="John Doe">
        <meta property="og:title" content="Example Title">
        <meta property="article:published_time" content="2024-01-01T00:00:00Z">
      </head>
      </html>
    `);

    global.window = dom.window;
    global.document = dom.window.document;

    // Now require your content script functions and test them
    const { extractCitationData } = require('./content');

    const expectedCitationData = {
      author: 'John Doe',
      title: 'Example Title',
      datePublished: '2024-01-01T00:00:00Z',
      url: 'about:blank' // JSDOM default URL
    };

    const citationData = extractCitationData();

    expect(citationData).toEqual(expectedCitationData);
  });
});
