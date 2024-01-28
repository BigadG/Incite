import '../styles/missingCitations.css';

function MissingCitations({ missing, onCitationChange }) {
    return (
        <div className="missing-citations">
            <h3>Missing Citation Information</h3>
            {missing.map((citation, index) => (
                <div key={`citation-${index}`}>
                <label>{`Citation for URL: ${citation.url}`}</label>
                <input
                    type="text"
                    onChange={(e) => onCitationChange(index, 'author', e.target.value)}
                    placeholder="Enter author's name"
                    value={citation.author}
                />
                <input
                    type="date"
                    onChange={(e) => onCitationChange(index, 'publicationDate', e.target.value)}
                    placeholder="Enter publication date"
                    value={citation.publicationDate}
                />
                </div>
            ))}
        </div>
    );
}

export default MissingCitations;
  
