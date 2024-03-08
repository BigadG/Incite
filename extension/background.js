chrome.runtime.onInstalled.addListener(() => {
  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;
      if(d > 0){
        r = (d + r)%16 | 0;
        d = Math.floor(d/16);
      } else {
        r = (d2 + r)%16 | 0;
        d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  const uuid = generateUUID();
  console.log(`Generated UUID: ${uuid}`);
  chrome.storage.local.set({ userId: uuid, selections: [] });

  const serverUrl = 'https://incite-d3f19169e5b5.herokuapp.com/api/register';

  // Make the register request
  fetch(serverUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uuid}`
    },
    body: JSON.stringify({ uuid }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Registration successful', data);
  })
  .catch(error => {
    console.error('Error during registration:', error);
  });
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