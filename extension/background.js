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
  
  const serverUrl = 'http://localhost:3001/api';

  // Call the new /register endpoint to register the UUID
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