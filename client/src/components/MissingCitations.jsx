import React, { useState } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit }) {
    const [validInputs, setValidInputs] = useState(missing.map(() => ({
        author: true,
        publicationDate: true,
    })));

    // Function to check the validity of all inputs
    const validateInputs = () => {
        const inputsValidity = missing.map((citation, index) => ({
            author: !citation.missingFields.author || (citation.author && citation.author.trim() !== ''),
            publicationDate: !citation.missingFields.publicationDate || (citation.publicationDate && citation.publicationDate.trim() !== ''),
        }));

        setValidInputs(inputsValidity);

        return inputsValidity.every(inputValidity => Object.values(inputValidity).every(isValid => isValid));
    };

    // Handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault(); // Prevent form submission to check for validation
        if (validateInputs()) {
            onSubmit(); // Only proceed with submission if all inputs are valid
        }
    };

    // Render the component
    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
                <div key={`citation-${index}`} className="citation-section">
                    <label className="citation-title">{`INFO FOR: ${citation.title}`}</label>
                    <div className="input-container">
                        {citation.missingFields.author && (
                            <div className="input-pair">
                                <label htmlFor={`author-${index}`} className={`input-label ${!validInputs[index].author ? 'invalid-label' : ''}`}>
                                    Author's name:
                                </label>
                                <input
                                    id={`author-${index}`}
                                    type="text"
                                    onChange={(e) => {
                                        onCitationChange(index, 'author', e.target.value);
                                        // Immediately validate the specific field on change
                                        setValidInputs(inputs => inputs.map((input, i) => i === index ? { ...input, author: e.target.value.trim() !== '' } : input));
                                    }}
                                    onFocus={(e) => {
                                        // Prevent the removal of validation styles on focus if the input is already invalid
                                        if (e.target.value.trim() === '') {
                                            e.target.classList.add('invalid-input');
                                        }
                                    }}
                                    onBlur={(e) => {
                                        // Optionally re-validate on blur or leave as is for submission-time validation
                                    }}
                                    placeholder="Author's name"
                                    value={citation.author || ''}
                                    className={!validInputs[index].author ? 'invalid-input' : ''}
                                />
                            </div>
                        )}
                        {citation.missingFields.publicationDate && (
                            <div className="input-pair">
                                <label htmlFor={`publication-date-${index}`} className={`input-label ${!validInputs[index].publicationDate ? 'invalid-label' : ''}`}>
                                    Publication Date:
                                </label>
                                <input
                                    id={`publication-date-${index}`}
                                    type="date"
                                    onChange={(e) => {
                                        onCitationChange(index, 'publicationDate', e.target.value);
                                        // Immediately validate the specific field on change
                                        setValidInputs(inputs => inputs.map((input, i) => i === index ? { ...input, publicationDate: e.target.value.trim() !== '' } : input));
                                    }}
                                    onFocus={(e) => {
                                        // Prevent the removal of validation styles on focus if the input is already invalid
                                        if (e.target.value.trim() === '') {
                                            e.target.classList.add('invalid-input');
                                        }
                                    }}
                                    onBlur={(e) => {
                                        // Optionally re-validate on blur or leave as is for submission-time validation
                                    }}
                                    value={citation.publicationDate || ''}
                                    className={!validInputs[index].publicationDate ? 'invalid-input' : ''}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <button onClick={handleFormSubmit} className="formSubmit">Submit Citations</button>
        </div>
    );
}

export default MissingCitations;







