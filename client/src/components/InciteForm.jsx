import { useState } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';

function InciteForm() {
  // State to store the form inputs and result
  const [inputs, setInputs] = useState(['', '', '']);
  const [result, setResult] = useState('');

  // Function to handle form input changes
  const handleChange = (index) => (event) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 10) {
      setInputs([...inputs, '']);
    }
  };

  const generateResult = async () => {
    try {
      const serverUrl = 'http://localhost:3001/api/generateEssay';
      // The server expects an object with a 'prompts' property
      const dataToSend = { prompts: inputs.filter(input => input.trim() !== '') };
      console.log('Sending the following data to the server:', dataToSend);
      const response = await axios.post(serverUrl, dataToSend);
      return response.data.essay;
    } catch (error) {
      console.error('Error generating result:', error);
      return 'Error generating result';
    }
  };

  // Add a check for the chrome object to avoid errors during development outside the Chrome environment
  const isChromeEnv = typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const premises = inputs.filter(input => input.trim() !== '');
    
    if (isChromeEnv) {
      // Save premises to chrome.storage for access by popup.js
      chrome.storage.local.set({ premises }, async () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting premises:', chrome.runtime.lastError);
          setResult('Error accessing Chrome storage.');
        } else {
          const generatedResult = await generateResult();
          setResult(generatedResult);
        }
      });
    } else {
      // Mock the behavior of chrome.storage.local.set for development purposes
      console.warn('Mocking chrome.storage.local.set in a non-Chrome environment.');
      // Mock async behavior
      setTimeout(async () => {
        // Here you can simulate the setting of data or just proceed to generate the result
        const generatedResult = await generateResult();
        setResult(generatedResult);
      }, 100);
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


