import '../styles/missingCitations.css';

function MissingCitations({ missing, onCitationChange }) {
    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => {
                return (
                    <div key={`citation-${index}`} className="citation-input-group">
                        <label>{`Citation for ${citation.url}`}</label> {/* Make sure `url` is a string */}
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
                                <small>Publication Date</small>
                                <input
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

