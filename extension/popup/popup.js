// popup.js

document.addEventListener('DOMContentLoaded', function () {
    // Define the server endpoint URL
    const serverUrl = 'http://localhost:3000';
  
    // Button references
    const addButton = document.getElementById('addButton');
    const showButton = document.getElementById('showButton');
    const clearButton = document.getElementById('clearButton');
  
    // Function to send a POST request to the server to add a selection
    async function addSelection(url, title) {
      try {
        const response = await fetch(`${serverUrl}/addSelection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any necessary headers like authorization tokens here
          },
          body: JSON.stringify({ url, title }),
        });
  
        if (response.ok) {
          console.log('Selection added');
        } else {
          throw new Error('Failed to add selection');
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    // Function to get the user's selections from the server
    async function showSelections() {
      try {
        const response = await fetch(`${serverUrl}/selections`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any necessary headers like authorization tokens here
          },
        });
  
        if (response.ok) {
          const selections = await response.json();
          // Code to display the selections to the user goes here
          console.log(selections);
        } else {
          throw new Error('Failed to retrieve selections');
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    // Function to clear the user's selections from the server
    async function clearSelections() {
      try {
        const response = await fetch(`${serverUrl}/clearSelections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any necessary headers like authorization tokens here
          },
          // Send necessary data like userId if required
          body: JSON.stringify({ /* userId or other required fields */ }),
        });
  
        if (response.ok) {
          console.log('Selections cleared');
        } else {
          throw new Error('Failed to clear selections');
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    // Event listeners for buttons
    addButton.addEventListener('click', function() {
      // Logic to retrieve the current tab's URL and title
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        addSelection(currentTab.url, currentTab.title);
      });
    });
  
    showButton.addEventListener('click', function() {
      showSelections();
    });
  
 /*   clearButton.addEventListener('click', function() {
      clearSelections();
    });
*/
  });