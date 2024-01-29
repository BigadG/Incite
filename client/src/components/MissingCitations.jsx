import '../styles/missingCitations.css';

function MissingCitations({ missing, onCitationChange }) {
    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => {
                // Correctly reference the nested 'url' property
                const citationUrl = citation.url.url;

                return (
                    <div key={`citation-${index}`} className="citation-input-group">
                        <label>{`Citation for ${citationUrl}`}</label>
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

