document.addEventListener('DOMContentLoaded', function () {
  const serverUrl = 'http://localhost:3001/api';

  const addButton = document.getElementById('addButton');
  const showButton = document.getElementById('showButton');
  const dropdown = document.getElementById('dropdown');
//  const createButton = document.getElementById('createButton')

  // Retrieve the UUID from storage and include it in the header of every request
  async function getUUID() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['userId'], function(result) {
        if (result.userId) {
          resolve(result.userId);
        } else {
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
      } else {
        const errorData = await response.json();
        // Use JSON.stringify to see the details of the errorData object
        console.error('Error data:', JSON.stringify(errorData, null, 2)); // Debug: Inspect the error data
        throw new Error(errorData.message || 'Failed to add selection');
      }
    } catch (error) {
      // Include error details in the log
      console.error('Error adding selection:', error, JSON.stringify(error, null, 2));
    }
  }
  
  

  async function showSelections() {
      try {
          const response = await fetch(`${serverUrl}/selections`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  // Authorization header must be provided as per your application's authentication strategy
              },
          });

          if (response.ok) {
              const selections = await response.json();
              console.log(selections);
              // Here you would update your popup's DOM with the selection titles and URLs
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
          const currentTab = tabs[0];
          addSelection(currentTab.url, currentTab.title);
      });
  });

  // Function to toggle dropdown visibility
  function toggleDropdown() {
    dropdown.classList.toggle('hidden');
    addButton.classList.toggle('hidden');
    showButton.classList.toggle('hidden');
  }

  showButton.addEventListener('click', function() {
    showSelections(); // You should define this function to update the list
    toggleDropdown();
  });
});
