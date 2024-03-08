chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension state with a UUID
  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16; //random number between 0 and 16
      if(d > 0){ //Use timestamp until depleted
        r = (d + r)%16 | 0;
        d = Math.floor(d/16);
      } else { //Use microseconds since page-load if supported
        r = (d2 + r)%16 | 0; 
        d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    }); 
  }
  const uuid = generateUUID();
  console.log(`Generated UUID: ${uuid}`);
  chrome.storage.local.set({ userId: uuid, selections: [] });

  const serverUrl = 'https://incite-d3f19169e5b5.herokuapp.com/api';

  // Add back the /register endpoint to register the UUID
  fetch(`${serverUrl}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uuid}`
    },
    body: JSON.stringify({ uuid }),
  })
  .then(response => response.json().then(data => ({ status: response.status, body: data })))
  .then(obj => {
    if (obj.status !== 200) {
      throw new Error(`Error: ${obj.status} ${JSON.stringify(obj.body)}`);
    }
    console.log('Registration successful', obj.body);
  })
  .catch(error => console.error('Error registering UUID:', error));
});

function executeContentScript(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ['content.js']
      },
      (injectionResults) => {
        if (chrome.runtime.lastError) {
          callback({ error: chrome.runtime.lastError.message });
        } else if (injectionResults && injectionResults.length > 0) {
          callback({ data: injectionResults[0].result });
        } else {
          callback({ error: 'No result returned from content script' });
        }
      }
    );
  });
}

// Listens for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeContentScript') {
    executeContentScript(sendResponse);
    return true; // Keep the message channel open for the asynchronous response
  }
});