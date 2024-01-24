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

// Mock the chrome API as per your existing setup
global.chrome = {
    tabs: {
        query: jest.fn((queryInfo, callback) => {
        callback([{ url: 'http://example.com', title: 'Example' }]);
        }),
    },
    storage: {
        local: {
            get: jest.fn((keys, callback) => {
                callback({ userId: 'test-uuid' }); // Mocked UUID for testing
            }),
        },
    },
};

describe('Show selections', () => {
  it('populates the listContainer when the showButton is clicked', (done) => {
    const window = loadHTML();
    // Ensure that the DOMContentLoaded event is fired
    const domContentLoadedEvent = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(domContentLoadedEvent);

    // Mock the global fetch function as it's used by the showSelections
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { title: 'Test Title 1', url: 'https://example.com/1' },
          { title: 'Test Title 2', url: 'https://example.com/2' },
        ])
      })
    );

    // Define the elements and functions as they are defined in popup.js
    const showButton = window.document.getElementById('showButton');
    const listContainer = window.document.getElementById('listContainer');
    const dropdown = window.document.getElementById('dropdown');

    // Mock the showSelections and toggleDropdown functions
    // Assuming they are declared globally in popup.js
    window.showSelections = jest.fn(() => {
      // Mock implementation of showSelections if necessary
    });
    window.toggleDropdown = jest.fn(() => {
      dropdown.classList.toggle('hidden');
    });

    // Simulate click on the showButton
    showButton.dispatchEvent(new window.Event('click'));

    // Wait for the promises to resolve and the DOM updates to occur
    setTimeout(() => {
      // Check if fetch was called
      expect(fetch).toHaveBeenCalled();
      // Check if listContainer is populated
      expect(listContainer.children.length).toBe(2);
      expect(listContainer.innerHTML).toContain('Test Title 1');
      expect(listContainer.innerHTML).toContain('https://example.com/1');
      expect(listContainer.innerHTML).toContain('Test Title 2');
      expect(listContainer.innerHTML).toContain('https://example.com/2');
      // Ensure the dropdown is shown
      expect(dropdown.classList.contains('hidden')).toBe(false);

      done(); // Indicate that the test is complete
    }, 100); // Increase the timeout if necessary
  }, 10000); // Set a longer timeout for the test
});
