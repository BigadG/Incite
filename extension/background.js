chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension state with a UUID
  function generateUUID() {
    var d = new Date().getTime();
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0;
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
  
  const serverUrl = 'http://localhost:3001/api';

  fetch(`${serverUrl}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uuid}`
    },
    body: JSON.stringify({ uuid }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log('Registration successful', data))
  .catch(error => console.error('Error registering UUID:', error));
});

  // Handler for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractCitationData") {
    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      files: ['content.js']  // Ensure this file is in web_accessible_resources
    }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      // Send a message to content script to perform the data extraction
      chrome.tabs.sendMessage(message.tabId, { action: "extractCitationData" }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: 'Failed to extract citation data.' });
        } else {
          sendResponse({ citationData: response });
        }
      });
    });
    return true; // Indicates asynchronous response
  }
});
