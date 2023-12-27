import React, { useState } from 'react';
import '../styles/inciteStyles.css';
import axios from 'axios';

function InciteForm() {
  const [inputList, setInputList] = useState(['']);

  const handleInputChange = (e, index) => {
    const list = [...inputList];
    list[index] = e.target.value;
    setInputList(list);
  };

  const handleAddClick = () => {
    setInputList([...inputList, '']);
  };

  const generateResult = async () => {
    try {
      const serverUrl = 'http://localhost:3001/api/generateEssay';
      const response = await axios.post(serverUrl, {
        prompts: inputList,
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
        {inputList.map((prompt, index) => (
          <input
            type="text"
            className="textbox"
            name={`prompt${index}`}
            placeholder={`Paragraph ${index + 1}`}
            value={prompt}
            onChange={(e) => handleInputChange(e, index)}
            key={index}
          />
        ))}
        {inputList.length < 10 && (
          <button type="button" onClick={handleAddClick} className="add-btn">
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


