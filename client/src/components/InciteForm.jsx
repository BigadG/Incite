import React, { useState } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';

function InciteForm() {
  // State to store the form inputs, result, and the URLs collected by the extension
  const [inputs, setInputs] = useState(['', '', '']);
  const [result, setResult] = useState('');
  const [urls, setUrls] = useState([]); // Add state for URLs

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

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const serverUrl = 'http://localhost:3001/api/generateEssayWithSelections';
      
      // You need to await the premises from the getUserInputPremises function
      const premises = await getUserInputPremises();
      const dataToSend = {
        premises, // This should be awaited if it's a promise
        urls // This should already be set in the state from chrome.storage
      };
      
      const response = await axios.post(serverUrl, dataToSend);
      setResult(response.data.essay);
    } catch (error) {
      console.error('Error generating essay with selections:', error);
      setResult('Error generating essay with selections');
    }
  };
  

  // Add a useEffect hook to load URLs from chrome.storage.local when the component mounts
  React.useEffect(() => {
    // Only run this effect in a Chrome extension environment
    if (chrome.storage) {
      chrome.storage.local.get(['selections'], function (result) {
        if (result.selections) {
          // Update the urls state with the URLs from the result
          setUrls(result.selections.map(selection => selection.url));
        }
      });
    }
  }, []); // The empty array as a second argument ensures this effect only runs once when the component mounts

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


