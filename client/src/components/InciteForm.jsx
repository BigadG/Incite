import React, { useState, useEffect } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import '../styles/inciteStyles.css';

function InciteForm() {
  const [inputs, setInputs] = useState(['', '', '']);
  const [result, setResult] = useState('');
  const [urls, setUrls] = useState([]);
  const [uuid, setUUID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading');

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


  const fetchSelections = async () => {
    try {
      const queryParams = queryString.parse(window.location.search);
      if (queryParams.uuid) {
        setUUID(queryParams.uuid);
        const response = await axios.get(`http://localhost:3001/api/selections`, {
          headers: {
            'Authorization': `Bearer ${queryParams.uuid}`
          }
        });
        if (response.status === 200) {
          setUrls(response.data.map(sel => sel.url));
        } else {
          throw new Error('Failed to fetch selections');
        }
      }
    } catch (error) {
      console.error('Error fetching selections:', error);
    }
  };

  // Polling function
  useEffect(() => {
    let intervalId;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(fetchSelections, 5000); // Poll every 5 seconds
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Handle the visibility change event
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsPageVisible(isVisible);
      if (isVisible) {
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start polling
    if (isPageVisible) {
      startPolling();
    }

    // Cleanup function
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPageVisible]); // Re-run effect when isPageVisible changes

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    console.log('Form submission triggered. URLs in state:', urls);
    try {
      const response = await axios.get(`http://localhost:3001/api/selections`, {
          headers: {
              'Authorization': `Bearer ${uuid}`
          }
      });
  
      if (response.status !== 200) {
          throw new Error('Failed to fetch latest selections');
      }
  
      const latestSelections = response.data;
      const updatedUrls = latestSelections.map(sel => sel.url);
  
      const serverUrl = 'http://localhost:3001/api/generateEssayWithSelections';
      const dataToSend = {
        premises: inputs.filter(input => input.trim() !== ''),
        urls: updatedUrls // Directly using the updated URLs
      };
      const essayResponse = await axios.post(serverUrl, dataToSend);
      setResult(essayResponse.data.essay);
      setIsLoading(false);
    } catch (error) {
        console.error('Error generating essay:', error);
        setResult('Error generating essay with latest selections');
        setIsLoading(false);
    }
  };

  useEffect(() => {
    let loadingInterval;
    if (isLoading) {
      loadingInterval = setInterval(() => {
        setLoadingText(prev => {
          const dotsCount = prev.length % 3;
          return `Loading${'.'.repeat(dotsCount + 1)}`;
        });
      }, 500); // Update every 500ms
    }

    return () => {
      clearInterval(loadingInterval);
      setLoadingText('Loading'); // Reset text when effect is cleaned up
    };
  }, [isLoading]); // Effect runs when isLoading changes
      
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
          placeholder={isLoading ? '' : 'Result'}
          value={isLoading ? loadingText : result}
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


