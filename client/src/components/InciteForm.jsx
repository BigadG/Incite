import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import InputField from './InputField';
import ResultTextArea from './ResultTextArea';
import MissingCitations from './MissingCitations';
import '../styles/inciteStyles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function InciteForm() {
    const [inputs, setInputs] = useState(['', '', '']);
    const [result, setResult] = useState('');
    const [urls, setUrls] = useState([]);
    const [uuid, setUUID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading...');
    const [missingCitations, setMissingCitations] = useState([]);
    const [isPageVisible, setIsPageVisible] = useState(true);

    const saveEssay = async (essay) => {
        try {
            await axios.post(`${API_BASE_URL}/api/saveRecentEssay`, {
                uuid,
                essay,
                thesis: inputs[0],
                premises: inputs.slice(1)
            }, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
            sessionStorage.setItem('recentEssayData', JSON.stringify({ thesis: inputs[0], premises: inputs.slice(1), essay }));
        } catch (error) {
            // Removed console.error
        }
    };

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
                const response = await axios.get(`${API_BASE_URL}/api/selections`, {
                    headers: {
                        'Authorization': `Bearer ${queryParams.uuid}`
                    }
                });
                if (response.status === 200) {
                    setUrls(response.data.map(sel => sel.url));
                } else {
                    // Removed throw new Error
                }
            }
        } catch (error) {
            // Removed console.error
        }
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsPageVisible(document.visibilityState === 'visible');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        if (isPageVisible) {
            fetchSelections();
        }
    }, [isPageVisible, fetchSelections]);

    useEffect(() => {
        const sessionStartFlag = sessionStorage.getItem('sessionStartFlag');

        if (!sessionStartFlag) {
            sessionStorage.clear(); // Clear all sessionStorage
            sessionStorage.setItem('sessionStartFlag', 'true');
            setResult(''); // Explicitly clear the essay content
            setInputs(['', '', '']); // Reset inputs
        } else {
            const recentEssayData = sessionStorage.getItem('recentEssayData');
            if (recentEssayData) {
                const { thesis, premises, essay } = JSON.parse(recentEssayData);
                setInputs([thesis, ...premises]);
                setResult(essay);
            }
        }
    }, []);

    const handleMissingCitationSubmit = async () => {
        const updatedSelections = missingCitations.map(citation => ({
            url: citation.url,
            author: citation.author,
            publicationDate: citation.publicationDate,
        }));

        try {
            const response = await axios.post('http://localhost:3001/api/updateSelections', { updatedSelections, uuid }, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });

            if (response.status === 200) {
                // Re-fetch selections or verify submission success
                // Potentially additional logic here to confirm update success
                setMissingCitations([]); // Clear missing citations to reflect success
                handleSubmit(); // Attempt to generate the essay now
            } else {
                console.error('Failed to update selections:', response.statusText);
            }
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
    
        try {
            const response = await axios.post(`${API_BASE_URL}/api/generateEssayWithSelections`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
          if (response.data.missingCitations && response.data.missingCitations.length > 0) {
            setMissingCitations(response.data.missingCitations);
          } else {
            setResult(response.data.essay);
            setMissingCitations([]);
            // Save the essay using the saveEssay function
            await saveEssay(response.data.essay);
          }
        } catch (error) {
            // Removed console.error
        } finally {
            setIsLoading(false);
        } 
    };    

      useEffect(() => {
        const fetchSavedEssay = async () => {
          try {
            const response = await axios.get('http://localhost:3001/api/getRecentEssay', {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
            if (response.status === 200 && response.data) {
                const { essay, selections, thesis, premises } = response.data;
      
                // Safely process selections if available
                const processedSelections = selections ? selections.map(sel => sel.url) : [];
                setUrls(processedSelections);
        
                // Check and set the essay, thesis, and premises
                if (essay !== undefined) setResult(essay);
                if (thesis && premises) {
                    setInputs([thesis, ...premises]);
                } else {
                    // Handle missing thesis and premises by clearing inputs
                    setInputs(['', '', '']);
                }
            } else {
                // Handle case where no recent essay is found
                console.log('No recent essay found');
                setInputs(['', '', '']);
                setResult('');
            }
          } catch (error) {
            console.error('Error fetching saved essay and premises:', error);
            setInputs(['', '', '']);
            setResult('');
          }
        };
      
        if (uuid) {
          fetchSavedEssay();
        }
      }, [uuid]);      
      
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

    useEffect(() => {
        // This effect listens for a flag that indicates the essay data should be cleared
        const clearEssayDataFlag = sessionStorage.getItem('clearEssayDataFlag');
        if (clearEssayDataFlag === 'true') {
          // Clear the sessionStorage item related to the clear flag
          sessionStorage.removeItem('clearEssayDataFlag');
        
          // Reset state variables to clear the displayed essay data
          setResult('');
          setInputs(['', '', '']); // Clear the inputs for thesis and premises
          setUrls([]); // Clear the URLs
          setMissingCitations([]); // Clear any missing citations
        }
      }, []);           

    useEffect(() => {
      console.log('Updated missingCitations state:', missingCitations);
  }, [missingCitations]);
  
    return (
        <main>
            <h1>INCITE</h1>
            <form onSubmit={handleSubmit}>
                <InputField
                    key={`input-0`}
                    index={0}
                    value={inputs[0]}
                    handleChange={handleChange}
                />
                <label htmlFor={`input1-Id`}>Body Premises:</label>
                {inputs.slice(1).map((input, index) => (
                    <InputField
                        key={`input-${index + 1}`}
                        index={index + 1}
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
                <button type="submit" className="submit">Generate</button>
            </form>
        </main>
    );
}

export default InciteForm;