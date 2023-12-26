import React, { useState } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';

function InciteForm() {
  // State to store the form inputs and result
  const [inputs, setInputs] = useState({
    premises: '',
    data: '',
    sources: '',
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

// Modify this function to call server endpoint
const generateResult = async () => {
  try {
    // Replace with your server's full URL including the port
    const serverUrl = 'http://localhost:3001/api/generateEssay';
    
    const response = await axios.post(serverUrl, {
      premises: inputs.premises,
      data: inputs.data,
      sources: inputs.sources,
    });
    return response.data.essay;
  } catch (error) {
    console.error('Error generating result:', error);
    return 'Error generating result';
  }
};

// Update the handleSubmit function to handle async operation
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
          name="premises" 
          id="input1-Id" 
          placeholder="Premises" 
          value={inputs.premises}
          onChange={handleChange}
        />
        <input 
          type="text" 
          className="textbox" 
          name="data" 
          id="input2-Id" 
          placeholder="Data" 
          value={inputs.data}
          onChange={handleChange}
        />
        <input 
          type="text" 
          className="textbox" 
          name="sources" 
          id="input3-Id" 
          placeholder="Sources" 
          value={inputs.sources}
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

