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

// Mock the chrome API as per your existing setup
global.chrome = {
  // ... existing chrome mock setup ...
  storage: {
    local: {
      // ... existing chrome.storage.local mocks ...
      get: jest.fn((keys, callback) => {
        callback({ userId: 'test-uuid' }); // Mocked UUID for testing
      }),
    },
  },
};

describe('Show selections', () => {
  it('populates the listContainer when the showButton is clicked', (done) => {
    const window = loadHTML();
    window.document.addEventListener('DOMContentLoaded', () => {
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

        done();
      }, 0); // setTimeout with 0 to wait for the next tick when the promises are resolved
    });
  });
});
