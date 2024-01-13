import React, { useState, useEffect } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';
import queryString from 'query-string';

function InciteForm() {
  // State to store the form inputs, result, URLs, and premises collected by the extension
  const [inputs, setInputs] = useState(['', '', '']);
  const [result, setResult] = useState('');
  const [urls, setUrls] = useState([]); // State for URLs
  const [premises, setPremises] = useState([]); // State for premises

  // Function to handle form input changes
  const handleChange = (index) => (event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
  };

  // Function to handle adding a new input field
  const addInput = () => {
    if (inputs.length < 10) {
      setInputs([...inputs, '']);
    }
  };

  // Function to load URLs and premises from chrome.storage.local
  useEffect(() => {
    const queryParams = queryString.parse(window.location.search);
    if (queryParams.selections) {
      const decodedUrls = decodeURIComponent(queryParams.selections).split(',').map(url => decodeURIComponent(url));
      setUrls(decodedUrls);
    }
  }, []);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        // Fetch the latest selections from the server
        const uuid = await getUUID(); // Assuming getUUID is a function to retrieve the user's UUID
        const response = await fetch(`http://localhost:3001/api/selections`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${uuid}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch latest selections');
        }

        const latestSelections = await response.json();
        // Update URLs in state with the latest selections
        const updatedUrls = latestSelections.map(sel => sel.url);
        setUrls(updatedUrls);

        // Now proceed with essay generation using updated URLs
        const serverUrl = 'http://localhost:3001/api/generateEssayWithSelections';
        const dataToSend = {
            premises: inputs.filter(input => input.trim() !== ''),
            urls: updatedUrls
        };
        const essayResponse = await axios.post(serverUrl, dataToSend);
        setResult(essayResponse.data.essay);
    } catch (error) {
        console.error('Error generating essay:', error);
        setResult('Error generating essay with latest selections');
    }
};


  return (
    <main>
      <h1>INCITE™</h1>
      <form onSubmit={handleSubmit}>
        {inputs.map((input, index) => (
          <input
            key={`input-${index}`}
            type="text"
            className="textbox"
            name={`prompt${index + 1}`}
            id={`input${index + 1}-Id`}
            placeholder={`prompt${index + 1}`}
            value={input}
            onChange={handleChange(index)}
          />
        ))}
        {inputs.length < 10 && (
          <button type="button" onClick={addInput} className="add-button">
            +
          </button>
        )}
        <textarea
          name="result"
          className="textbox"
          id="result"
          placeholder="Result"
          value={result}
          readOnly
        />
        <br />
        <button type="submit" className="submit">Sum It!</button>
      </form>
      <div id="chat-log">
        {/* Chat log content would go here */}
      </div>
    </main>
  );
}

export default InciteForm;


