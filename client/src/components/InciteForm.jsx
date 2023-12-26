import React, { useState } from 'react';
import '../styles/inciteStyles.css';

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

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    // Call generateResult and update the result state
    const generatedResult = generateResult();
    setResult(generatedResult);
  };

  // Mock function to generate a result based on the inputs
  // You should replace this with your actual logic
  const generateResult = () => {
    return `Generated result based on: 
      Premises: ${inputs.premises}, 
      Data: ${inputs.data}, 
      Sources: ${inputs.sources}`;
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

