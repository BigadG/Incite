// client/src/Components/Popup.jsx
import React from 'react';
import './Popup.css'; // Assuming CSS modules are not used

const Popup = () => {
  // Event handlers and state management here

  const handleAddSelection = () => {
    // Logic to add the current webpage to selections
  };

  const handleShowSelections = () => {
    // Logic to show selections
  };

  return (
    <div id="popup-content">
      <button id="addButton" onClick={handleAddSelection}>Add to selections</button>
      <button id="showButton" onClick={handleShowSelections}>Show selections</button>
    </div>
  );
};

export default Popup;
