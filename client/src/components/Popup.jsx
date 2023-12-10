import React, { useState, useEffect } from 'react';
import '../styles/popup.css';

const Popup = () => {
  const serverUrl = 'http://localhost:3001/api';

  const [uuid, setUUID] = useState('');

  useEffect(() => {
    // Fetch the UUID from Chrome's local storage
    chrome.storage.local.get(['userId'], function(result) {
      if (result.userId) {
        setUUID(result.userId);
      } else {
        console.error('No UUID found');
      }
    });
  }, []);

  const addSelection = async (url, title) => {
    try {
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
        console.error('Error data:', JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error('Error adding selection:', error);
    }
  };

  const showSelections = async () => {
    try {
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
      } else {
        const errorData = await response.json();
        console.error('Error data:', JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error('Error retrieving selections:', error);
    }
  };

  const handleAddButtonClick = () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentTab = tabs[0];
      addSelection(currentTab.url, currentTab.title);
    });
  };

  const handleShowButtonClick = () => {
    showSelections();
  };

  return (
    <div id="popup-content">
      <button id="addButton" onClick={handleAddButtonClick}>ADD TO LIST</button>
      <button id="showButton" onClick={handleShowButtonClick}>SHOW LIST</button>
    </div>
  );
};

export default Popup;

