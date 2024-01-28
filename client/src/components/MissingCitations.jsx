import '../styles/missingCitations.css';

function MissingCitations({ missing, onCitationChange }) {
    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
                <div key={`citation-${index}`}>
                    <label>{`Citation for ${citation.url}`}</label>
                    {citation.missingFields.author && (
                        <input
                            type="text"
                            onChange={(e) => onCitationChange(index, 'author', e.target.value)}
                            placeholder="Enter author's name"
                            value={citation.author || ''}
                        />
                    )}
                    {citation.missingFields.publicationDate && (
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
            ))}
        </div>
    );
}


export default MissingCitations;
  
