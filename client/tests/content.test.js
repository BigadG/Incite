const { JSDOM } = require('jsdom');

// Mock the chrome API before requiring your modules
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn()
  }
};

// Mock Date and URL
const FIXED_DATE = "2024-01-01T00:00:00.000Z";
const FIXED_URL = "about:blank";

describe('content script', () => {
  it('correctly extracts citation data', () => {
    jest.useFakeTimers().setSystemTime(new Date(FIXED_DATE));

    const dom = new JSDOM(`
      <html>
      <head>
        <meta name="author" content="John Doe">
        <meta property="og:title" content="Example Title">
        <title>Alternate Title</title>
      </head>
      <body></body>
      </html>
    `, { url: FIXED_URL });
    
    global.window = dom.window;
    global.document = dom.window.document;
    
    // Additional checks
    console.log('Meta Author Tag:', document.head.innerHTML.includes('<meta name="author" content="John Doe">'));
    console.log('Meta Title Tag:', document.head.innerHTML.includes('<meta property="og:title" content="Example Title">'));
    

    // Move console log statements here
    console.log(document.querySelector('meta[name="author"]')?.outerHTML);
    console.log(document.querySelector('meta[property="og:title"]')?.outerHTML);

    Object.defineProperty(global.window, 'location', {
      value: {
        href: FIXED_URL,
      },
    });    

    const { extractCitationData } = require('../../extension/content');

    const expectedCitationData = {
      author: 'John Doe',
      title: 'Example Title',
      datePublished: FIXED_DATE,
      url: FIXED_URL
    };

    const citationData = extractCitationData();
    expect(citationData).toEqual(expectedCitationData);

    jest.useRealTimers();
  });
});
