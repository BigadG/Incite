import '../styles/missingCitations.css';

function MissingCitations({ missing, onCitationChange }) {
    // Log the structure of the first citation object for debugging purposes
    console.log('First missing citation object:', missing[0]);

    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => {
                // Assuming 'url' is a property of the 'citation' object and is a string
                const citationUrl = typeof citation.url === 'string' ? citation.url : 'Invalid URL';

                return (
                    <div key={`citation-${index}`}>
                        <label>{`Citation for ${citationUrl}`}</label>
                        {citation.missingFields?.author && (
                            <input
                                type="text"
                                onChange={(e) => onCitationChange(index, 'author', e.target.value)}
                                placeholder="Enter author's name"
                                value={citation.author || ''}
                            />
                        )}
                        {citation.missingFields?.publicationDate && (
                            <div>
                                <small>Publication Date</small>
                                <input
                                    type="date"
                                    onChange={(e) => onCitationChange(index, 'publicationDate', e.target.value)}
                                    value={citation.publicationDate || ''}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default MissingCitations;

