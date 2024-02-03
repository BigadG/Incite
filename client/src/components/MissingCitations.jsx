import { useState, useEffect } from 'react';
import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit }) {
    const [validInputs, setValidInputs] = useState(missing.map(() => ({
        author: true,
        publicationDate: true,
    })));

    useEffect(() => {
        // Update validInputs based on the current missing prop to reflect updates
        setValidInputs(missing.map(() => ({
            author: true,
            publicationDate: true,
        })));
    }, [missing]);

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
        e.preventDefault(); // Prevent default form submission
        if (!validateInputs()) {
            // If validation fails, proceed with showing invalid input styles
            // This will already have been handled by validateInputs updating validInputs state
        } else {
            onSubmit(); // Proceed with submission if all inputs are valid
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
                                <label htmlFor={`author-${index}`} className={`input-label ${!validInputs[index].author ? 'invalid-label' : ''}`}>
                                    Author's name:
                                </label>
                                <input
                                    id={`author-${index}`}
                                    type="text"
                                    onChange={(e) => {
                                        onCitationChange(index, 'author', e.target.value);
                                        setValidInputs(inputs => inputs.map((input, i) => i === index ? { ...input, author: e.target.value.trim() !== '' } : input));
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
                                        setValidInputs(inputs => inputs.map((input, i) => i === index ? { ...input, publicationDate: e.target.value.trim() !== '' } : input));
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

import PropTypes from 'prop-types';

MissingCitations.propTypes = {
  missing: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    missingFields: PropTypes.object.isRequired,
  })).isRequired,
  onCitationChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};





