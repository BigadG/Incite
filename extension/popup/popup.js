document.addEventListener('DOMContentLoaded', function () {
  const serverUrl = 'http://localhost:3001/api';

  const addButton = document.getElementById('addButton');
  const showButton = document.getElementById('showButton');
  const dropdown = document.getElementById('dropdown');
  const listContainer = document.getElementById('listContainer');
  const createButton = document.getElementById('createButton');

  // Retrieve the UUID from storage and include it in the header of every request
  async function getUUID() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['userId'], function(result) {
        console.log(`Retrieved UUID from storage: ${result.userId}`);
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
        chrome.storage.local.get(['selections'], function (result) {
          const currentSelections = result.selections || [];
          console.log('Current selections before adding new:', currentSelections); // Log current selections
          chrome.storage.local.set({ selections: [...currentSelections, { title, url }] }, () => {
            console.log('New selection added:', { title, url }); // Log the new selection
            // Verify it by getting all selections again
            chrome.storage.local.get(['selections'], function (result) {
              console.log('Selections after adding:', result.selections); // Log all selections after adding
            });
          });
        });
      } else {
        console.error('Failed to add selection:', response.status, response.statusText);
        const errorBody = await response.text();
        console.error('Error details:', errorBody);
      }
    } catch (error) {
      console.error('Error in addSelection:', error);
    }
  }
  
  function createListElement(title, url, pageId) {
    const selectionBox = document.createElement('div');
    selectionBox.classList.add('selectionBox');
    selectionBox.addEventListener('click', function() {
      urlElement.style.display = urlElement.style.display === 'none' ? 'block' : 'none';
    });
    
    const titleAndUrl = document.createElement('div');
    titleAndUrl.classList.add('titleAndUrl');

    // Create the element for the title
    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    titleElement.classList.add('titles');

    // Create the element for the url
    const urlElement = document.createElement('a');
    urlElement.href = url;
    urlElement.textContent = url;
    urlElement.classList.add('url');
    urlElement.style.display = 'none';
    urlElement.addEventListener('click', function(event) {
      event.preventDefault();
      chrome.tabs.create({ url: url });
    });

    const selectionsX = document.createElement('button');
    selectionsX.textContent = 'X';
    selectionsX.classList.add('selectionsX');

    selectionsX.addEventListener('click', async function() {
      try {
        const uuid = await getUUID();
        const response = await fetch(`${serverUrl}/deleteSelection/${pageId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uuid}`
          }
        });
  
        if (response.ok) {
          console.log('Selection deleted');
          listContainer.removeChild(selectionBox);
        } else {
          const errorResponse = await response.text();
          console.error('Failed to delete selection:', errorResponse);
          throw new Error('Failed to delete selection');
        }
      } catch (error) {
        console.error('Error deleting selection:', error);
      }
    });

    titleAndUrl.appendChild(titleElement);
    titleAndUrl.appendChild(urlElement);
    selectionBox.appendChild(titleAndUrl);
    selectionBox.appendChild(selectionsX);
    listContainer.appendChild(selectionBox);
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
          createListElement(selection.title, selection.url, selection.pageId);
        });
      } else {
        const textResponse = await response.text(); // Get the raw response text
        console.error('Failed to retrieve selections. Response:', textResponse); // Log the full response text
        throw new Error('Failed to retrieve selections');
      }
    } catch (error) {
      console.error('Error retrieving selections:', error, error.stack);
    }
  }
  

  addButton.addEventListener('click', function() {
    console.log('Add button clicked'); // Confirms the event
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

  async function getUserInputPremises() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['premises'], function(result) {
        if (result.premises) {
          resolve(result.premises);
        } else {
          reject('No premises found');
        }
      });
    });
  }  

  showButton.addEventListener('click', function() {
    showSelections();
    toggleDropdown();
  });

  async function getSelections() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['selections'], function(result) {
        if (result.selections) {
          resolve(result.selections);
        } else {
          reject('No selections found');
        }
      });
    });
  }

  createButton.addEventListener('click', async function() {
    try {
      const selections = await getSelections(); // Await the selections from storage
      const uuid = await getUUID();
      let premises;
      try {
        premises = await getUserInputPremises(); // Attempt to retrieve premises
      } catch (error) {
        console.error(error); // Handle the case where no premises are found
        premises = []; // You can default to an empty array or decide on another appropriate default value
      }
      const selectionUrls = selections.map(selection => encodeURIComponent(selection.url)).join(',');
      const premisesParam = encodeURIComponent(JSON.stringify(premises));
      const inciteAppUrl = `http://localhost:5173/?uuid=${uuid}&selections=${selectionUrls}&premises=${premisesParam}`;
      
      console.log(`Opening React app with URL: ${inciteAppUrl}`);
      chrome.tabs.create({ url: inciteAppUrl }); // Open the React app with the selections and premises as query parameters
    } catch (error) {
      console.error('Error creating essay:', error);
    }
  });
  
});
