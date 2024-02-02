import React, { useState, useEffect } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit, updateFormValidity }) {
    const [localMissingCitations, setLocalMissingCitations] = useState(missing);

    // When localMissingCitations change, validate the form and inform the parent component
    useEffect(() => {
        const isValid = localMissingCitations.every(citation => 
            (!citation.missingFields.author || citation.author) &&
            (!citation.missingFields.publicationDate || citation.publicationDate)
        );
        updateFormValidity(isValid); // Inform the parent about the validation status
    }, [localMissingCitations, updateFormValidity]);

    const handleCitationChange = (index, field, value) => {
        const updatedCitations = [...localMissingCitations];
        updatedCitations[index] = { ...updatedCitations[index], [field]: value };
        setLocalMissingCitations(updatedCitations); // Update local state
        onCitationChange(index, field, value); // Update parent state
    };

    const handleSubmit = () => {
        // Perform submission if the local validation passes
        const isValid = localMissingCitations.every(citation => 
            (!citation.missingFields.author || citation.author) &&
            (!citation.missingFields.publicationDate || citation.publicationDate)
        );
        if (isValid) {
            onSubmit();
        }
    };

    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
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






