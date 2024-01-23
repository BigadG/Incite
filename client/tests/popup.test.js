const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');

// Define a helper function to load the HTML and return the window
function loadHTML() {
  const popupHtmlPath = path.join(__dirname, '../../extension/popup/popup.html');
  const html = fs.readFileSync(popupHtmlPath, 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  return dom.window;
}

// Mock the chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
  },
  tabs: {
    query: jest.fn().mockImplementation((queryInfo, callback) => {
      callback([{ id: 1, url: 'http://example.com', title: 'Example' }]);
    }),
  },
  storage: {
    local: {
      get: jest.fn().mockImplementation((key, callback) => {
        callback({ userId: 'test-uuid' });
      }),
      set: jest.fn(),
    },
  },
};

// Mock the chrome.scripting API
global.chrome.scripting = {
  executeScript: jest.fn((...args) => {
    const [ , callback] = args;
    // Simulate injecting the script and receiving data
    callback([{ result: { title: 'Mock Title', url: 'http://mockurl.com' } }]);
  }),
};

global.chrome.tabs.query.mockImplementation((queryInfo, callback) => {
  console.log('chrome.tabs.query is called');
  callback([{ id: 1, url: 'http://example.com', title: 'Example' }]);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('content script', () => {
  it('correctly extracts citation data', () => {
    jest.useFakeTimers().setSystemTime(new Date(FIXED_DATE));

    const dom = new JSDOM(`
      <html>
      <head>
        <meta name="author" content="John Doe">
        <meta property="og:title" content="Example Title">
        <meta property="article:published_time" content="${FIXED_DATE}">
        <title>Example Title</title>
      </head>
      <body></body>
      </html>
    `, {
      url: FIXED_URL,
    });

    global.window = dom.window;
    global.document = dom.window.document;

    Object.defineProperty(global.window, 'location', {
      value: { href: FIXED_URL },
      writable: true
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
}, 20000);

