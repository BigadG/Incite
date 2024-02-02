import React, { useState, useEffect } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit, updateFormValidity }) {
    const [localMissingCitations, setLocalMissingCitations] = useState(missing);
    // Initialize validation state
    const [validation, setValidation] = useState({});

    // When localMissingCitations change, validate the form and inform the parent component
    useEffect(() => {
        const newValidation = {};
        let allValid = true;

        localMissingCitations.forEach((citation, index) => {
            const authorValid = citation.missingFields.author ? !!citation.author : true;
            const publicationDateValid = citation.missingFields.publicationDate ? !!citation.publicationDate : true;

            newValidation[`${index}-author`] = !authorValid;
            newValidation[`${index}-publicationDate`] = !publicationDateValid;

            if (!authorValid || !publicationDateValid) {
                allValid = false;
            }
        });

        setValidation(newValidation);
        updateFormValidity(allValid); // Inform the parent about the validation status
    }, [localMissingCitations, updateFormValidity]);

    const handleCitationChange = (index, field, value) => {
        const updatedCitations = [...localMissingCitations];
        updatedCitations[index] = { ...updatedCitations[index], [field]: value };
        setLocalMissingCitations(updatedCitations); // Update local state
        onCitationChange(index, field, value); // Update parent state
    };

    const handleSubmit = () => {
        // Check if all fields are valid before submitting
        if (Object.values(validation).every(v => !v)) {
            onSubmit();
        } else {
            // Optional: Perform some action if the validation fails,
            // such as focusing the first invalid input or displaying an error message
        }
    };

    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {localMissingCitations.map((citation, index) => (
                <div key={`citation-${index}`} className="citation-section">
                    <label className="citation-title">{`INFO FOR: ${citation.title}`}</label>
                    <div className="input-container">
                        {citation.missingFields.author && (
                            <div className="input-pair">
                                <label className={`input-label ${validation[`${index}-author`] ? 'input-label-missing' : ''}`}>
                                    Author's name:
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) => handleCitationChange(index, 'author', e.target.value)}
                                    placeholder="Author's name"
                                    value={citation.author || ''}
                                />
                            </div>
                        )}
                        {citation.missingFields.publicationDate && (
                            <div className="input-pair">
                                <label htmlFor={`publication-date-${index}`}
                                       className={`input-label ${validation[`${index}-publicationDate`] ? 'input-label-missing' : ''}`}>
                                    Publication Date:
                                </label>
                                <input
                                    id={`publication-date-${index}`}
                                    type="date"
                                    onChange={(e) => handleCitationChange(index, 'publicationDate', e.target.value)}
                                    value={citation.publicationDate || ''}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <button onClick={handleSubmit} className='formSubmit'>
                Submit Citations
            </button>
        </div>
    );
}

export default MissingCitations;






