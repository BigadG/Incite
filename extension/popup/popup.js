document.addEventListener('DOMContentLoaded', function () {
  const serverUrl = 'http://localhost:3001/api';

  const addButton = document.getElementById('addButton');
  const showButton = document.getElementById('showButton');
  const dropdown = document.getElementById('dropdown');
  const listContainer = document.getElementById('listContainer');
//  const createButton = document.getElementById('createButton')

  // Retrieve the UUID from storage and include it in the header of every request
  async function getUUID() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['userId'], function(result) {
        console.log('Storage Result:', result); // debug
        if (result.userId) {
          console.log('UUID from storage:', result.userId); // debug
          resolve(result.userId);
        } else {
          console.error('No UUID found in storage.');
          reject('No UUID found');
        }
      });
    });
  }

  async function addSelection(url, title) {
    try {
      const uuid = await getUUID();
      console.log('UUID retrieved:', uuid); // Debug: Check the retrieved UUID
  
      const response = await fetch(`${serverUrl}/addSelection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${uuid}`
        },
        body: JSON.stringify({ url, title }),
      });
  
      if (response.ok) {
        console.log('Selection added');
        createListElement(title, url);
      } else {
        const errorData = await response.json();
        console.error('Error data:', JSON.stringify(errorData, null, 2)); // Debug: Inspect the error data
        throw new Error(errorData.message || 'Failed to add selection');
      }
    } catch (error) {
      console.error('Error adding selection:', error, JSON.stringify(error, null, 2));
    }
  }
  
  function createListElement(title, url) {
    const titleAndUrl = document.createElement('div');
    titleAndUrl.classList = 'titleAndUrl';
    // Create the h2 element for the title
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    titleElement.classList = 'titles';
    
    // Create the p element for the url
    const urlElement = document.createElement('link');
    urlElement.textContent = url;
    urlElement.classList = 'url';

    // Append to the listContainer
    titleAndUrl.appendChild(titleElement);
    titleAndUrl.appendChild(urlElement);
    listContainer.appendChild(titleAndUrl);
  }

  async function showSelections() {
    try {
      const uuid = await getUUID(); // Retrieve the UUID from storage
      const response = await fetch(`${serverUrl}/selections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${uuid}` // Include the UUID in the Authorization header
        },
      });
  
      if (response.ok) {
        const selections = await response.json();
        console.log(selections);
        // Clear the listContainer before showing the updated list
        listContainer.innerHTML = '';
        // Loop through each selection and create elements for them
        selections.forEach(selection => {
          createListElement(selection.title, selection.url);
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve selections');
      }
    } catch (error) {
      console.error('Error retrieving selections:', error);
    }
  }
  

  addButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      window.close(); // Close the extension popup
      const currentTab = tabs[0];
      console.log('Current Tab:', currentTab); // Debug the current tab information
      addSelection(currentTab.url, currentTab.title).then(() => {
        console.log('Add selection promise resolved');
      }).catch((error) => {
        console.error('Add selection promise rejected:', error);
      });
    });
  });

  // Function to toggle dropdown visibility
  function toggleDropdown() {
    dropdown.classList.toggle('hidden');
    addButton.classList.toggle('hidden');
    showButton.classList.toggle('hidden');
  }

  showButton.addEventListener('click', function() {
    showSelections();
    toggleDropdown();
  });
});
