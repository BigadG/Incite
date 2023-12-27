import React, { useState } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';

function InciteForm() {
  // State to store the form inputs and result
  const [inputs, setInputs] = useState({
    prompt1: '',
    prompt2: '',
    prompt3: '',
  });
  const [result, setResult] = useState('');

  // Function to handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs(prevInputs => ({
      ...prevInputs,
      [name]: value,
    }));
  };

const generateResult = async () => {
  try {
    const serverUrl = 'http://localhost:3001/api/generateEssay';
    const response = await axios.post(serverUrl, {
      prompt1: inputs.prompt1,
      prompt2: inputs.prompt2,
      prompt3: inputs.prompt3,
    });
    return response.data.essay;
  } catch (error) {
    console.error('Error generating result:', error);
    return 'Error generating result';
  }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const generatedResult = await generateResult();
  setResult(generatedResult);
};

  return (
    <main>
      <h1>INCITE™</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          className="textbox" 
          name="prompt1" 
          id="input1-Id" 
          placeholder="prompt1" 
          value={inputs.prompt1}
          onChange={handleChange}
        />
        <input 
          type="text" 
          className="textbox" 
          name="prompt2" 
          id="input2-Id" 
          placeholder="prompt2" 
          value={inputs.prompt2}
          onChange={handleChange}
        />
        <input 
          type="text" 
          className="textbox" 
          name="prompt3" 
          id="input3-Id" 
          placeholder="prompt3" 
          value={inputs.prompt3}
          onChange={handleChange}
        />
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

