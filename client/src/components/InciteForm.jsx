import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import InputField from './InputField';
import MissingCitations from './MissingCitations';
import ResultTextArea from './ResultTextArea';
import '../styles/inciteStyles.css';

function InciteForm() {
  const [inputs, setInputs] = useState(['', '', '']);
  const [result, setResult] = useState('');
  const [urls, setUrls] = useState([]);
  const [uuid, setUUID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading');
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [missingCitations, setMissingCitations] = useState([]);

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

  const handleCitationChange = (index, value, isDate = false) => {
    // Update the missingCitations state with the new values
    const updatedCitations = [...missingCitations];
    if (isDate) {
      updatedCitations[index].publicationDate = value;
    } else {
      updatedCitations[index].author = value;
    }
    setMissingCitations(updatedCitations);
  };

  const fetchSelections = useCallback(async () => {
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
          console.log('Fetched URLs:', urls);
          throw new Error('Failed to fetch selections');
        }
      }
    } catch (error) {
      console.error('Error fetching selections:', error);
    }
  }, [urls]); 

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
  }, [isPageVisible, fetchSelections]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
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
      console.log('Saved selections:', latestSelections);
      const updatedUrls = latestSelections.map(sel => sel.url);
  
      const serverUrl = 'http://localhost:3001/api/generateEssayWithSelections';
      const dataToSend = {
        thesis: inputs[0].trim(), // First input is the thesis
        bodyPremises: inputs.slice(1).filter(input => input.trim() !== ''), // Remaining inputs are body premises
        urls: updatedUrls
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
      let dotsCount = 1; // Initialize dot count
      loadingInterval = setInterval(() => {
        setLoadingText(`Loading${'.'.repeat(dotsCount)}`);
        dotsCount = (dotsCount % 3) + 1; // Cycle through 1, 2, 3
      }, 500); // Update every 500ms
    } else {
      setLoadingText('Loading'); // Reset text when not loading
    }
  
    return () => clearInterval(loadingInterval); // Cleanup on effect unmount
  }, [isLoading]);

  return (
    <main>
      <h1>INCITE</h1>
      <form onSubmit={handleSubmit}>
        {inputs.map((input, index) => (
          <InputField
            key={`input-${index}`}
            index={index}
            value={input}
            handleChange={handleChange}
          />
        ))}
        {inputs.length < 10 && (
          <button type="button" onClick={addInput} className="add-button">
            +
          </button>
        )}
        <ResultTextArea
          isLoading={isLoading}
          loadingText={loadingText}
          result={result}
        />
        <br />
        <button type="submit" className="submit">Sum It!</button>
      </form>
    </main>
  );
}
          
export default InciteForm;


