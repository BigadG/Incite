document.addEventListener('DOMContentLoaded', function () {
  const serverUrl = 'http://localhost:3001/api';

  const addButton = document.getElementById('addButton');
  const showButton = document.getElementById('showButton');

  async function addSelection(url, title) {
      try {
          const response = await fetch(`${serverUrl}/addSelection`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  // Authorization header must be provided as per your application's authentication strategy
              },
              body: JSON.stringify({ url, title }),
          });

          if (response.ok) {
              console.log('Selection added');
          } else {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to add selection');
          }
      } catch (error) {
          console.error('Error adding selection:', error);
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

  showButton.addEventListener('click', function() {
      showSelections();
  });
});
