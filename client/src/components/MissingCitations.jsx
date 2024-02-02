import React, { useState } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit }) {
    const [touched, setTouched] = useState(false);

    // Check if all fields are filled
    const allFieldsFilled = missing.every(citation => {
        return (!citation.missingFields.author || citation.author) && 
               (!citation.missingFields.publicationDate || citation.publicationDate);
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        if (allFieldsFilled) {
            onSubmit();
        } else {
            setTouched(true); // User has attempted to submit, so trigger validation display
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
                                <label className={`input-label ${!citation.author && touched ? 'input-label-missing' : ''}`}>
                                    Author's name:
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) => onCitationChange(index, 'author', e.target.value)}
                                    placeholder="Author's name"
                                    value={citation.author || ''}
                                />
                            </div>
                        )}
                        {citation.missingFields.publicationDate && (
                            <div className="input-pair">
                                <label htmlFor={`publication-date-${index}`} 
                                       className={`input-label ${!citation.publicationDate && touched ? 'input-label-missing' : ''}`}>
                                    Publication Date:
                                </label>
                                <input
                                    id={`publication-date-${index}`}
                                    type="date"
                                    onChange={(e) => onCitationChange(index, 'publicationDate', e.target.value)}
                                    value={citation.publicationDate || ''}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <button onClick={handleSubmit} className='formSubmit' disabled={!allFieldsFilled}>
                Submit Citations
            </button>
        </div>
    );
}

export default MissingCitations;





