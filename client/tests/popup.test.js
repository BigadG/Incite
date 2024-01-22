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

describe('popup.js', () => {
  it('should extract citation data and send to server when add button is clicked', (done) => {
    const window = loadHTML();
    // Ensure that the DOMContentLoaded event is fired
    const domContentLoadedEvent = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(domContentLoadedEvent);
    
    const addButton = window.document.getElementById('addButton');

      // Mock the fetch call to the server for storing the selection with citation data
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Selection added with citation data' }),
        })
      );

      // Simulate button click
      addButton.dispatchEvent(new window.Event('click'));

      // Assertions
      setTimeout(() => { // Set timeout to allow for async operations
        expect(chrome.tabs.query).toHaveBeenCalled();
        expect(chrome.storage.local.get).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/addSelection'), // Check if the endpoint is correct
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': `Bearer test-uuid`, // Check if the Authorization header is correct
            }),
            body: expect.stringContaining('citationData'), // Check if the body includes citationData
          })
        );

        done(); // Finish the test when all assertions have run
      }, 100);
    }, 10000);
  });
