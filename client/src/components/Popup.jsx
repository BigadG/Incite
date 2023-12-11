import React, { useState, useEffect } from 'react';
import '../styles/popup.css'; // Adjust the path to your CSS file if necessary

const Popup = () => {
  const serverUrl = 'http://localhost:3001/api';

  // State to store the UUID and selections
  const [uuid, setUUID] = useState('');
  const [selections, setSelections] = useState([]);

  // Effect to retrieve the UUID from Chrome's local storage
  useEffect(() => {
    chrome.storage.local.get(['userId'], function (result) {
      if (result.userId) {
        setUUID(result.userId);
      } else {
        console.error('No UUID found');
      }
    });
  }, []);

  // Function to add a selection
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

  // Function to show selections
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
        const selectionsData = await response.json();
        setSelections(selectionsData);
      } else {
        const errorData = await response.json();
        console.error('Error data:', JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error('Error retrieving selections:', error);
    }
  };

  // Handlers for the button clicks
  const handleAddButtonClick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      addSelection(currentTab.url, currentTab.title);
    });
  };

  const handleShowButtonClick = () => {
    showSelections();
  };

  // Render the popup UI
  return (
    <div id="popup-content">
      <button id="addButton" onClick={handleAddButtonClick}>ADD TO LIST</button>
      <button id="showButton" onClick={handleShowButtonClick}>SHOW LIST</button>
      {selections.length > 0 && (
        <ul>
          {selections.map((selection, index) => (
            <li key={index}>{selection.title} - {selection.url}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Popup;
