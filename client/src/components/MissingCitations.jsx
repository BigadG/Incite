import React, { useState } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit }) {
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const handleFormSubmit = () => {
        const allFilled = missing.every(citation => {
            return (!citation.missingFields.author || citation.author) && (!citation.missingFields.publicationDate || citation.publicationDate);
        });

        if (allFilled) {
            onSubmit(); // Proceed with submission as all fields are filled.
        } else {
            setSubmissionAttempted(true); // Prevent submission and trigger visual feedback.
        }
    };

    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
                <div key={`citation-${index}`} className="citation-section">
                    {/* Existing content */}
                    {citation.missingFields.author && (
                        <div className="input-pair">
                            <label className="input-label">Author's name:</label>
                            <input
                                className={submissionAttempted && !citation.author ? 'input-error' : ''}
                                type="text"
                                onChange={(e) => onCitationChange(index, 'author', e.target.value)}
                                placeholder="Author's name"
                                value={citation.author || ''}
                            />
                        </div>
                    )}
                    {citation.missingFields.publicationDate && (
                        <div className="input-pair">
                            <label htmlFor={`publication-date-${index}`} className="input-label">Publication Date:</label>
                            <input
                                className={submissionAttempted && !citation.publicationDate ? 'input-error' : ''}
                                id={`publication-date-${index}`}
                                type="date"
                                onChange={(e) => onCitationChange(index, 'publicationDate', e.target.value)}
                                value={citation.publicationDate || ''}
                            />
                        </div>
                    )}
                </div>
            ))}
            <button onClick={handleFormSubmit} className='formSubmit'>Submit Citations</button>
        </div>
    );
}

export default MissingCitations;





