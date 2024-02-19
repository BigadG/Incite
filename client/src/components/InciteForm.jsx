import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import queryString from 'query-string';
import InputField from './InputField';
import ResultTextArea from './ResultTextArea';
import MissingCitations from './MissingCitations';
import '../styles/inciteStyles.css';

function InciteForm({ apiBaseUrl }) {
    // Updated initial state to include 3 body premise inputs in addition to the thesis premise input
    const [inputs, setInputs] = useState(['', '', '', '']);
    const [result, setResult] = useState('');
    const [urls, setUrls] = useState([]);
    const [uuid, setUUID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Loading...');
    const [missingCitations, setMissingCitations] = useState([]);
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const queryParams = queryString.parse(window.location.search);
        if (queryParams.uuid) {
            setUUID(queryParams.uuid);
        }
    }, []);

    // Adjusted to not display the error message on initial render
    useEffect(() => {
        setErrorMessage('');
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
            if (!errorMessage) setErrorMessage('An error occurred while saving the essay.'); // Set error message only if there's an error
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
        if (!uuid) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiBaseUrl}/api/selections`, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
            setUrls(response.data.map(sel => sel.url));
            // Reset error message upon successful fetch
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('An error occurred while fetching selections.');
        } finally {
            setIsLoading(false);
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
            // Updated to reset to the correct number of inputs
            setInputs(['', '', '', '']);
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
        setIsLoading(true);
        const updatedSelections = missingCitations.map(citation => ({
            url: citation.url,
            author: citation.author,
            publicationDate: citation.publicationDate,
        }));
    
        try {
            // Update the selections in the database
            const response = await axios.post(`${apiBaseUrl}/api/updateSelections`, {
                uuid,
                updatedSelections,
            }, {
                headers: {
                    'Authorization': `Bearer ${uuid}`
                }
            });
    
            // Assuming success, clear the local missingCitations state
            if (response.status === 200) {
                setMissingCitations([]);
    
                // Now that citations are updated, generate the essay
                handleSubmit(); // You may need to call this without an event argument or adjust its implementation
            } else {
                // Handle other potential success codes or throw an error
                throw new Error(`Failed to update selections with status code: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating selections with citations:', error);
            setErrorMessage('Error updating citation information. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = async (event) => {
        if (event) event.preventDefault();
        setIsLoading(true);
        // Ensure errorMessage is reset at the beginning of the operation
        setErrorMessage('');

        const dataToSend = {
            thesis: inputs[0].trim(),
            bodyPremises: inputs.slice(1).filter(input => input.trim() !== ''),
            urls: urls,
            missingCitations: missingCitations,
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
                await saveEssay(response.data.essay);
            }
        } catch (error) {
            console.error('Error submitting essay:', error);
            setErrorMessage('Error generating essay with latest selections. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (uuid) {
            const fetchSavedEssay = async () => {
                let fetchedData = false; // Flag to check if data was successfully fetched
                try {
                    const response = await axios.get(`${apiBaseUrl}/api/getRecentEssay`, {
                        headers: {
                            'Authorization': `Bearer ${uuid}`
                        }
                    });
                    if (response.status === 200 && response.data) {
                        const { essay, selections, thesis, premises } = response.data;
                        // Ensure selections is an array before mapping
                        const processedSelections = selections && Array.isArray(selections) ? selections.map(sel => sel.url) : [];
                        setUrls(processedSelections);
                        setResult(essay ?? '');
                        // Ensure there are always 3 body premises inputs, even if fewer are fetched
                        const newInputs = [thesis ?? '', ...premises ?? Array(3).fill('')].slice(0, 4);
                        setInputs(newInputs.length >= 4 ? newInputs : [...newInputs, ...Array(4 - newInputs.length).fill('')]);
                        fetchedData = true;
                    }
                } finally {
                    if (!fetchedData) {
                        setInputs(['', '', '', '']);
                        setResult('');
                    }
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
                {errorMessage && <div className="error-message">{errorMessage}</div>}
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