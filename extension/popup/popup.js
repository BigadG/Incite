document.addEventListener('DOMContentLoaded', function () {
  const serverUrl = 'https://incite-d3f19169e5b5.herokuapp.com/api';

  const addButton = document.getElementById('addButton');
  const showButton = document.getElementById('showButton');
  const dropdown = document.getElementById('dropdown');
  const listContainer = document.getElementById('listContainer');
  const createButton = document.getElementById('createButton');
  const clearButton = document.getElementById('clearButton');

  async function getUUID() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['userId'], function(result) {
        if (result.userId) {
          resolve(result.userId);
        } else {
          const error = 'No UUID found in storage.';
          console.error(error);
          reject(error);
        }
      }); 
    });
  }

  function getFromStorage(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting from storage:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key] || []);
        }
      });
    });
  }

  function setToStorage(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting to storage:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log(`${key} set to storage:`, value);
          resolve();
        }
      });
    });
  }

  async function getSelections() {
    try {
      return await getFromStorage('selections');
    } catch (error) {
      console.error('Error retrieving selections:', error);
      return [];
    }
  }

  async function fetchMetadata() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'executeContentScript' }, (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      });
    });
  }

async function addSelection(url, title) {
  try {
      if (url.startsWith('chrome://')) {
          // Ignore chrome URLs
          return;
      }

      const metadata = await fetchMetadata(); // Fetch additional metadata
      const uuid = await getUUID();
      const response = await fetch(`${serverUrl}/addSelection`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${uuid}`
          },
          body: JSON.stringify({ 
              url: url, 
              title: title, 
              author: metadata.author, 
              publicationDate: metadata.publicationDate 
          }), // Include author and publicationDate
      });

      if (response.ok) {
        const newSelection = { title, url, ...metadata };
        const currentSelections = await getFromStorage('selections');
        const newSelections = [...currentSelections, newSelection];
        await setToStorage('selections', newSelections); // Update local storage immediately
      } else {
        console.error('Failed to add selection to server. Status:', response.status);
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
          
          // Update local storage
          const currentSelections = await getFromStorage('selections');
          const updatedSelections = currentSelections.filter(selection => selection.url !== url);
          await setToStorage('selections', updatedSelections);
        } else {
          const errorResponse = await response.text();
          console.error('Failed to delete selection:', errorResponse);
          throw new Error('Failed to delete selection');
        }
      } catch (error) {
        console.error('Error deleting selection:', error)
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
          'Authorization': `Bearer ${uuid}`
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
  
  async function createInciteAppUrl() {
    try {
      const selections = await getSelections();
      const uuid = await getUUID();
  
      const selectionUrls = selections.map(selection => encodeURIComponent(selection.url)).join(',');
  
      const inciteAppUrl = `https://incite-client-77f7b261a1a7.herokuapp.com`;
  
      console.log(`Opening React app with URL: ${inciteAppUrl}`);
      chrome.tabs.create({ url: inciteAppUrl });
    } catch (error) {
      console.error('Error creating the URL for the React app:', error);
    }
  }

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

  addButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      const currentTab = tabs[0];
      await addSelection(currentTab.url, currentTab.title);
      window.close();
    });
  });

  showButton.addEventListener('click', function() {
    showSelections();
    toggleDropdown();
  });

  createButton.addEventListener('click', async function() {
    const selections = await getSelections();
    if (selections.length === 0) {
      console.log('No selections to generate essay');
      return;
    }
    const uuid = await getUUID();
    
    // Append UUID as a query parameter
    const inciteAppUrl = `https://incite-client-77f7b261a1a7.herokuapp.com/?uuid=${uuid}`;
    
    console.log(`Opening React app with URL: ${inciteAppUrl}`);
    chrome.tabs.create({ url: inciteAppUrl });
  });  

  clearButton.addEventListener('click', async function() {
    // Clear selections in storage
    await setToStorage('selections', []);
  
    // Clear the displayed list in the popup
    listContainer.innerHTML = '';
  
    // Send a request to the server to clear selections for this user
    try {
      const uuid = await getUUID();
      const response = await fetch(`${serverUrl}/clearSelections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${uuid}`
        }
      });
  
      if (response.ok) {
        // Clear any displayed thesis, premises, and essay in the React app.
        // Since the React app uses sessionStorage, we can signal it to clear by setting a flag.
        sessionStorage.setItem('clearEssayDataFlag', 'true');
        console.log('Selections cleared');
      } else {
        throw new Error('Failed to clear selections on the server');
      }
    } catch (error) {
      console.error('Error clearing selections:', error);
    }
  });
});  