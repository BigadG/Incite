import React, { useState, useEffect } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';

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
    // This function will be executed when the component mounts
    const loadStorageData = async () => {
      // Check if the extension's background page is accessible
      if (chrome.storage && chrome.storage.local) {
        // Use a promise to await the storage result
        const promise = new Promise((resolve, reject) => {
          chrome.storage.local.get(['selections', 'premises'], function (result) {
            if (chrome.runtime.lastError) {
              reject(new Error('Error retrieving data from storage.'));
            }
            resolve(result);
          });
        });
  
        try {
          const result = await promise;
          if (result.selections) {
            setUrls(result.selections.map(selection => selection.url));
          }
          if (result.premises) {
            setPremises(result.premises);
          }
        } catch (error) {
          console.error('Failed to load data from storage:', error);
        }
      }
    };
  
    loadStorageData();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const serverUrl = 'http://localhost:3001/api/generateEssayWithSelections';
  
      // Retrieve URLs from storage right before submitting the form
      chrome.storage.local.get(['selections'], async (result) => {
        const storedUrls = result.selections ? result.selections.map(selection => selection.url) : [];
        console.log('Retrieved URLs from storage:', storedUrls);
  
        if (storedUrls.length === 0) {
          console.error('No URLs to process. Make sure URLs are being stored correctly.');
          setResult('No URLs to process.');
          return;
        }
  
        // Construct the data to send
        const dataToSend = {
          premises: premises.length > 0 ? premises : inputs.filter(input => input.trim() !== ''),
          urls: storedUrls, // Use the retrieved URLs
        };
  
        // Send the request to the server
        const response = await axios.post(serverUrl, dataToSend);
        setResult(response.data.essay);
      });
    } catch (error) {
      console.error('Error generating essay with selections:', error);
      setResult('Error generating essay with selections');
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


