import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import InputField from './InputField';
import ResultTextArea from './ResultTextArea';
import MissingCitations from './MissingCitations';
import '../styles/inciteStyles.css';

function InciteForm({ apiBaseUrl }) {
    const [inputs, setInputs] = useState(['', '', '']);
    const [result, setResult] = useState('');
    const [urls, setUrls] = useState([]);
    const [uuid, setUUID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading...');
    const [missingCitations, setMissingCitations] = useState([]);
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Extract UUID from the URL query parameters and set it
    useEffect(() => {
        const queryParams = queryString.parse(window.location.search);
        if (queryParams.uuid) {
            setUUID(queryParams.uuid);
        }
    }, []);

    const saveEssay = async (essay) => {
        try {
            await axios.post(`${apiBaseUrl}/api/saveRecentEssay`, {
                uuid,
                essay,
                thesis: inputs[0],
                premises: inputs.slice(1),
            }, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
            sessionStorage.setItem('recentEssayData', JSON.stringify({ thesis: inputs[0], premises: inputs.slice(1), essay }));
        } catch (error) {
            setErrorMessage('An error occurred while saving the essay.');
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
        if (!uuid) return; // If UUID is not present, don't attempt the API call

        setIsLoading(true); // Set loading state
        try {
            const response = await axios.get(`${apiBaseUrl}/api/selections`, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
            setUrls(response.data.map(sel => sel.url));
            setErrorMessage(''); // Clear any previous error messages
        } catch (error) {
            setErrorMessage('An error occurred while fetching selections.');
        } finally {
            setIsLoading(false); // Clear loading state
        }
    }, [apiBaseUrl, uuid]);

    useEffect(() => {
        const handleVisibilityChange = () => setIsPageVisible(document.visibilityState === 'visible');
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        if (isPageVisible) {
            fetchSelections();
        }
    }, [isPageVisible, fetchSelections, uuid]);

    useEffect(() => {
        const sessionStartFlag = sessionStorage.getItem('sessionStartFlag');
        if (!sessionStartFlag) {
            sessionStorage.clear();
            sessionStorage.setItem('sessionStartFlag', 'true');
            setResult('');
            setInputs(['', '', '']);
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
        setIsLoading(true); // Set loading state
        const updatedSelections = missingCitations.map(citation => ({
            url: citation.url,
            author: citation.author,
            publicationDate: citation.publicationDate,
        }));

        try {
            // It's important to ensure that the data to send is defined within the scope of this function
            const dataToSend = {
                thesis: inputs[0].trim(),
                bodyPremises: inputs.slice(1).filter(input => input.trim() !== ''),
                urls: urls.concat(updatedSelections.map(sel => sel.url)), // Concatenate new URLs
            };
    
            const response = await axios.post(`${apiBaseUrl}/api/generateEssayWithSelections`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
    
            if (response.status === 200 && response.data.essay) {
                setResult(response.data.essay); // Set the result to the generated essay
                setMissingCitations([]); // Clear missing citations
                setErrorMessage(''); // Clear any previous error messages
                await saveEssay(response.data.essay); // Save the essay
            } else {
                setErrorMessage('Error generating essay with latest selections. Please try again later.');
            }
        } catch (error) {
            setErrorMessage('Error generating essay with latest selections. Please try again later.');
        } finally {
            setIsLoading(false); // Clear loading state
        }
    };

    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        setIsLoading(true);
        setErrorMessage(''); // Clear previous error messages
    
        const dataToSend = {
            thesis: inputs[0].trim(),
            bodyPremises: inputs.slice(1).filter(input => input.trim() !== ''),
            urls: urls,
        };
    
        try {
            const response = await axios.post(`${apiBaseUrl}/api/generateEssayWithSelections`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
    
            if (response.data.missingCitations && response.data.missingCitations.length > 0) {
                setMissingCitations(response.data.missingCitations);
            } else {
                setResult(response.data.essay);
                setMissingCitations([]);
                await saveEssay(response.data.essay); // Save the essay
            }
        } catch (error) {
            setErrorMessage('Error generating essay with latest selections. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (uuid) {
            const fetchSavedEssay = async () => {
                try {
                    const response = await axios.get(`${apiBaseUrl}/api/getRecentEssay`, {
                        headers: {
                            'Authorization': `Bearer ${uuid}`
                        }
                    });
                    if (response.status === 200 && response.data) {
                        const { essay, selections, thesis, premises } = response.data;
                        const processedSelections = selections.map(sel => sel.url);
                        setUrls(processedSelections);
                        if (essay !== undefined) setResult(essay);
                        if (thesis && premises) setInputs([thesis, ...premises]);
                        else setInputs(['', '', '']);
                    } else {
                        setInputs(['', '', '']);
                        setResult('');
                    }
                } catch (error) {
                    setErrorMessage('An error occurred while fetching the saved essay and premises.');
                }
            };
            fetchSavedEssay();
        }
    }, [uuid, apiBaseUrl]);

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
            if (loadingInterval) clearInterval(loadingInterval);
        };
    }, [isLoading]);
    
    useEffect(() => {
        const clearEssayDataFlag = sessionStorage.getItem('clearEssayDataFlag');
        if (clearEssayDataFlag === 'true') {
            sessionStorage.removeItem('clearEssayDataFlag');
            setResult('');
            setInputs(['', '', '']);
            setUrls([]);
            setMissingCitations([]);
        }
    }, []);

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
                {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error messages */}
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