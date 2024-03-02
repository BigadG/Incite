import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/missingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit }) {
    // Initial state setup for validation flags for each input
    const initialValidStates = missing.reduce((acc, citation, index) => {
        acc[index] = {
            author: !(citation.missingFields.author && !citation.author),
            publicationDate: !(citation.missingFields.publicationDate && !citation.publicationDate)
        };
        return acc;
    }, {});

    const [validInputs, setValidInputs] = useState(initialValidStates);

    // Function to check the validity of all inputs
    const validateInputs = () => {
        const inputsValidity = { ...validInputs };
        missing.forEach((citation, index) => {
            inputsValidity[index] = {
                author: !citation.missingFields.author || (citation.author && citation.author.trim() !== ''),
                publicationDate: !citation.missingFields.publicationDate || (citation.publicationDate && citation.publicationDate.trim() !== ''),
            };
        });

        setValidInputs(inputsValidity);
        return Object.values(inputsValidity).every(inputValidity => Object.values(inputValidity).every(isValid => isValid));
    };

    // Update individual input validation on change
    const updateInputValidation = (index, field, isValid) => {
        setValidInputs(inputs => ({
            ...inputs,
            [index]: {
                ...inputs[index],
                [field]: isValid
            }
        }));
    };

    // Handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        if (validateInputs()) {
            onSubmit(); // Proceed with submission if all inputs are valid
        }
        // If validation fails, the invalid input styles will already be displayed
    };

    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
                <div key={`citation-${index}`} className="citation-section">
                    <label className="citation-title">{citation.title}</label>
                    <div className="input-container">
                        {citation.missingFields.author && (
                            <div className="input-pair">
                                <label htmlFor={`author-${index}`} className={`input-label ${!validInputs[index]?.author ? 'invalid-label' : ''}`}>
                                    Author&apos;s name:
                                </label>
                                <input
                                    id={`author-${index}`}
                                    type="text"
                                    onChange={(e) => {
                                        const isValid = e.target.value.trim() !== '';
                                        updateInputValidation(index, 'author', isValid);
                                        onCitationChange(index, 'author', e.target.value);
                                    }}
                                    placeholder="Author's name"
                                    value={citation.author || ''}
                                    className={!validInputs[index]?.author ? 'invalid-input' : ''}
                                />
                            </div>
                        )}
                        {citation.missingFields.publicationDate && (
                            <div className="input-pair">
                                <label htmlFor={`publication-date-${index}`} className={`input-label ${!validInputs[index]?.publicationDate ? 'invalid-label' : ''}`}>
                                    Publication Date:
                                </label>
                                <input
                                    id={`publication-date-${index}`}
                                    type="date"
                                    onChange={(e) => {
                                        const isValid = e.target.value.trim() !== '';
                                        updateInputValidation(index, 'publicationDate', isValid);
                                        onCitationChange(index, 'publicationDate', e.target.value);
                                    }}
                                    value={citation.publicationDate || ''}
                                    className={!validInputs[index]?.publicationDate ? 'invalid-input' : ''}
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

MissingCitations.propTypes = {
    missing: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        missingFields: PropTypes.object.isRequired,
        author: PropTypes.string,
        publicationDate: PropTypes.string
    })).isRequired,
    onCitationChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default MissingCitations;