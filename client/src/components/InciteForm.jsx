import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import InputField from './InputField';
import ResultTextArea from './ResultTextArea';
import MissingCitations from './MissingCitations';
import '../styles/inciteStyles.css';

function InciteForm() {
    const [inputs, setInputs] = useState(['', '', '']);
    const [result, setResult] = useState('');
    const [urls, setUrls] = useState([]);
    const [uuid, setUUID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading...');
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [missingCitations, setMissingCitations] = useState([]);

    const handleChange = (index) => (event) => {
        const newInputs = [...inputs];
        newInputs[index] = event.target.value;
        setInputs(newInputs);
    };

    const handleCitationChange = (index, field, value) => {
        const updatedCitations = [...missingCitations];
        updatedCitations[index] = { ...updatedCitations[index], [field]: value };
        setMissingCitations(updatedCitations);
    };

    const addInput = () => {
        if (inputs.length < 10) {
            setInputs([...inputs, '']);
        }
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
                    throw new Error('Failed to fetch selections');
                }
            }
        } catch (error) {
            console.error('Error fetching selections:', error);
        }
    }, []);

    useEffect(() => {
        const isVisible = document.visibilityState === 'visible';
        setIsPageVisible(isVisible);
        if (isVisible) {
            fetchSelections();
        }
    }, [fetchSelections]);

    const handleMissingCitationSubmit = async () => {
      const updatedSelections = missingCitations.map(citation => {
        return {
          url: citation.url,
          author: citation.author,
          publicationDate: citation.publicationDate
        };
      });
    
      try {
        await axios.post('http://localhost:3001/api/updateSelections', { updatedSelections, uuid }, {
          headers: {
            'Authorization': `Bearer ${uuid}`
          }
        });
    
        handleSubmit(); // This will now generate the essay without missing citations.
      } catch (error) {
        console.error('Error updating selections:', error);
      }
    };

    const handleSubmit = async (event) => {
      if (event) event.preventDefault();
      setIsLoading(true);
    
      const dataToSend = {
          thesis: inputs[0].trim(),
          bodyPremises: inputs.slice(1).filter(input => input.trim() !== ''),
          urls: urls,
      };
    
      console.log('Submitting data to generate essay:', dataToSend);
    
      try {
          const response = await axios.post('http://localhost:3001/api/generateEssayWithSelections', dataToSend, {
              headers: {
                  'Authorization': `Bearer ${uuid}`
              }
          });
    
          console.log('Response received from generateEssayWithSelections:', response.data);
    
          if (response.data.missingCitations && response.data.missingCitations.length > 0) {
            setMissingCitations(response.data.missingCitations);
          } else {
              setResult(response.data.essay);
              setMissingCitations([]);
          }
      } catch (error) {
          console.error('Error submitting essay:', error);
          setResult('Error generating essay with latest selections');
      } finally {
          setIsLoading(false);
      }
    };

    useEffect(() => {
      let loadingInterval;

      if (isLoading) {
          let dotsCount = 1;
          loadingInterval = setInterval(() => {
              setLoadingText(`Loading${'.'.repeat(dotsCount)}`);
              dotsCount = (dotsCount % 3) + 1;
          }, 500);
      }

      return () => {
          if (loadingInterval) {
              clearInterval(loadingInterval);
          }
      };
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
        {missingCitations.length > 0 && (
          <MissingCitations
            missing={missingCitations}
            onCitationChange={handleCitationChange}
            onSubmit={handleMissingCitationSubmit}
          />
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


