// Function to send a POST request to the server to add a selection
async function addSelection(url, title) {
    const response = await fetch('http://localhost:3000/addSelection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, title }),
    });
  
    if (response.ok) {
      console.log('Selection added');
    } else {
      console.error('Failed to add selection');
    }
  }
  
  // Add event listener to your 'Add to selections' button
  document.getElementById('addButton').addEventListener('click', () => {
    // You would get the current tab's URL and title here
    const url = 'the current tab url';
    const title = 'the current tab title';
    addSelection(url, title);
  });
  