import React, { useState, useEffect } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';
import queryString from 'query-string';

function InciteForm() {
  // State to store the form inputs, result, URLs, and premises collected by the extension
  const [inputs, setInputs] = useState(['', '', '']);
  const [result, setResult] = useState('');
  const [urls, setUrls] = useState([]); // State for URLs
  const [uuid, setUUID] = useState('');

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
    if (queryParams.uuid) {
      setUUID(queryParams.uuid); // Set UUID from query params
    }
  }, []);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3001/api/selections`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${uuid}` // Use the retrieved UUID here
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch latest selections');
      }

      const latestSelections = response.data.map(sel => sel.url);
      setUrls(latestSelections); // Update URLs with the latest selections

      // Continue with the essay generation
      const serverUrl = 'http://localhost:3001/api/generateEssayWithSelections';
      const dataToSend = {
        premises: inputs.filter(input => input.trim() !== ''),
        urls: latestSelections
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


