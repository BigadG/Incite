import React from 'react';

function MissingCitations({ missing, onCitationChange }) {
  return (
    <div className="missing-citations">
      <h3>Missing Citation Information</h3>
      {missing.map((url, index) => (
        <div key={url}>
          <label>{`Citation for URL: ${url}`}</label>
          <input
            type="text"
            onChange={(e) => onCitationChange(index, e.target.value)}
            placeholder="Enter author's name"
          />
          <input
            type="date"
            onChange={(e) => onCitationChange(index, e.target.value, true)}
            placeholder="Enter publication date"
          />
        </div>
      ))}
    </div>
  );
}

export default MissingCitations;
