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
    // Mock Date
    jest.useFakeTimers().setSystemTime(new Date(FIXED_DATE));

    // Mock the DOM with meta tags and structured data
    const dom = new JSDOM(`
      <html>
      <head>
        <meta name="author" content="John Doe">
        <meta property="og:title" content="Example Title">
        <meta property="article:published_time" content="${FIXED_DATE}">
      </head>
      </html>
    `, {
      url: FIXED_URL, // Set a fixed URL for JSDOM
    });

    global.window = dom.window;
    global.document = dom.window.document;

    // Mock window.location
    const mockLocation = {
      href: FIXED_URL,
      // Add other properties and methods if needed
    };

    Object.defineProperty(global.window, 'location', {
      value: { href: FIXED_URL },
      writable: true
    });

    // Now require the content script functions and test them
    const { extractCitationData } = require('../../extension/content');

    const expectedCitationData = {
      author: 'John Doe',
      title: 'Example Title',
      datePublished: FIXED_DATE,
      url: FIXED_URL
    };

    const citationData = extractCitationData();

    expect(citationData).toEqual(expectedCitationData);

    // Restore timers
    jest.useRealTimers();
  });
});



