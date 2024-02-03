import React, { useState } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit }) {
    const [validInputs, setValidInputs] = useState(missing.map(() => ({
        author: true,
        publicationDate: true,
    })));

    const validateInputs = () => {
        const inputsValidity = missing.map((citation, index) => ({
            author: !citation.missingFields.author || (citation.author && citation.author.trim() !== ''),
            publicationDate: !citation.missingFields.publicationDate || (citation.publicationDate && citation.publicationDate.trim() !== ''),
        }));

        setValidInputs(inputsValidity);

        return inputsValidity.every(inputValidity => Object.values(inputValidity).every(isValid => isValid));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault(); // Prevent form submission to check for validation
        const allInputsValid = validateInputs();

        if (allInputsValid) {
            onSubmit(); // Only proceed with submission if all inputs are valid
        }
    };

    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
                <div key={`citation-${index}`} className="citation-section">
                    <label className="citation-title">{`${citation.title}`}</label>
                    <div className="input-container">  
                        {citation.missingFields.author && (
                            <div className="input-pair">
                                <label className="input-label">Author's name:</label>
                                <input
                                    type="text"
                                    onChange={(e) => onCitationChange(index, 'author', e.target.value)}
                                    placeholder="Author's name"
                                    value={citation.author || ''}
                                    className={!validInputs[index].author ? 'invalid-input' : ''}
                                />
                            </div>
                        )}
                        {citation.missingFields.publicationDate && (
                            <div className="input-pair">
                                <label htmlFor={`publication-date-${index}`} className="input-label">Publication Date:</label>
                                <input
                                    id={`publication-date-${index}`}
                                    type="date"
                                    onChange={(e) => onCitationChange(index, 'publicationDate', e.target.value)}
                                    value={citation.publicationDate || ''}
                                    className={!validInputs[index].publicationDate ? 'invalid-input' : ''}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <button onClick={handleFormSubmit} className='formSubmit'>Submit Citations</button>
        </div>
    );
}

export default MissingCitations;





