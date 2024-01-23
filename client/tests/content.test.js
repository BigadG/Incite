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
  it('correctly identifies meta tags', () => {
    // JSDOM setup
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

    const metaAuthorContent = document.querySelector('meta[name="author"]')?.content;
    const metaTitleContent = document.querySelector('meta[property="og:title"]')?.content;

    expect(metaAuthorContent).toBe('John Doe');
    expect(metaTitleContent).toBe('Example Title');
  });
});