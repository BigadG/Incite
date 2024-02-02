import '../styles/MissingCitations.css';

function MissingCitations({ missing, onCitationChange, onSubmit }) {
    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
                <div key={`citation-${index}`} className="citation-section">
                    <label className="citation-title">{`INFO FOR: ${citation.title}`}</label>
                    <div className="input-container">  
                        {citation.missingFields.author && (
                            <div className="input-pair">
                                <label className="input-label">Author's name:</label>
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
                                <label htmlFor={`publication-date-${index}`} className="input-label">Publication Date:</label>
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
            <button onClick={onSubmit} className='formSubmit'>Submit Citations</button>
        </div>
    );
}

export default MissingCitations;




