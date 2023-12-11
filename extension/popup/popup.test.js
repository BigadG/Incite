const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { expect } = require('@jest/globals');

// Define a helper function to load the HTML and return the window
function loadHTML() {
  const popupHtmlPath = path.join(__dirname, 'popup.html');
  const html = fs.readFileSync(popupHtmlPath, 'utf-8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  return dom.window;
}

// Mock the chrome API
global.chrome = {
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      callback([{ url: 'http://example.com', title: 'Example' }]);
    }),
  },
  storage: {
    local: {
      set: jest.fn(),
    },
  },
};

describe('popup.js', () => {
  it('should call chrome.tabs.query and chrome.storage.local.set when add button is clicked', (done) => {
    const window = loadHTML();
    window.document.addEventListener('DOMContentLoaded', () => {
      const addButton = window.document.getElementById('addButton');

      // Mock the fetch call to addSelection endpoint
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Selection added' }),
        })
      );

      // Simulate button click
      addButton.dispatchEvent(new window.Event('click'));

      // Assertions
      expect(chrome.tabs.query).toHaveBeenCalled();
      expect(chrome.storage.local.set).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.any(Object));

      done(); // Finish the test when the DOM content is fully loaded and script has executed
    });
  });
});
