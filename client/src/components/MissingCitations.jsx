import '../styles/missingCitations.css';

function MissingCitations({ missing, onCitationChange }) {
    console.log('Missing citations props:', missing);
    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => {
                return (
                    <div key={`citation-${index}`} className="citation-input-group">
                        <label>{`Citation for ${citation.url}`}</label>
                        {citation.missingFields.author && (
                            <input
                                type="text"
                                onChange={(e) => onCitationChange(index, 'author', e.target.value)}
                                placeholder="Author's name"
                                value={citation.author || ''}
                            />
                            )}
                        {citation.missingFields.publicationDate && (
                            <>
                                <label htmlFor={`publication-date-${index}`}>Publication Date:</label>
                                <input
                                id={`publication-date-${index}`}
                                type="date"
                                onChange={(e) => onCitationChange(index, 'publicationDate', e.target.value)}
                                value={citation.publicationDate || ''}
                                />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default MissingCitations;

