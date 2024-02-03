import React, { useState, useEffect } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit, updateFormValidity }) {
    const [localMissingCitations, setLocalMissingCitations] = useState(missing);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Initialize validation state based on the 'missing' prop
    const [validation, setValidation] = useState(missing.reduce((acc, citation, index) => {
        if (citation.missingFields.author) {
            acc[`${index}-author`] = !citation.author;
        }
        if (citation.missingFields.publicationDate) {
            acc[`${index}-publicationDate`] = !citation.publicationDate;
        }
        return acc;
    }, {}));

    // Update the validation state for the field
    const validateField = (index, field, value) => {
        setValidation(prev => ({
            ...prev,
            [`${index}-${field}`]: !value
        }));
    };

    // Check validation when localMissingCitations change
    useEffect(() => {
        localMissingCitations.forEach((citation, index) => {
            if (citation.missingFields.author) {
                validateField(index, 'author', citation.author);
            }
            if (citation.missingFields.publicationDate) {
                validateField(index, 'publicationDate', citation.publicationDate);
            }
        });
    }, [localMissingCitations]);

    // Update parent form validity based on local validation state
    useEffect(() => {
        const allValid = Object.values(validation).every(v => !v);
        updateFormValidity(allValid);
    }, [validation, updateFormValidity]);

    const handleCitationChange = (index, field, value) => {
        const updatedCitations = [...localMissingCitations];
        updatedCitations[index] = { ...updatedCitations[index], [field]: value };
        setLocalMissingCitations(updatedCitations);
        onCitationChange(index, field, value);
        validateField(index, field, value);
    };

    const handleSubmit = () => {
        setSubmitAttempted(true); // Mark the form as having an attempted submission

        // Check if all fields are valid before submitting
        const formIsValid = Object.values(validation).every(v => !v);

        if (formIsValid) {
            onSubmit();
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
                        <label className={`input-label ${submitAttempted && validation[`${index}-author`] ? 'input-label-missing' : ''}`}>
                            Author's name:
                        </label>
                        <input
                            type="text"
                            className={submitAttempted && validation[`${index}-author`] ? 'input-error' : ''}
                            onChange={(e) => handleCitationChange(index, 'author', e.target.value)}
                            placeholder="Author's name"
                            value={citation.author || ''}
                        />
                        </div>
                    )}
                    {citation.missingFields.publicationDate && (
                        <div className="input-pair">
                        <label htmlFor={`publication-date-${index}`}
                                className={`input-label ${submitAttempted && validation[`${index}-publicationDate`] ? 'input-label-missing' : ''}`}>
                            Publication Date:
                        </label>
                        <input
                            id={`publication-date-${index}`}
                            type="date"
                            className={submitAttempted && validation[`${index}-publicationDate`] ? 'input-error' : ''}
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







