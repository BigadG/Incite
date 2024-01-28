function ResultTextArea({ isLoading, loadingText, result }) {
    return (
      <textarea
        name="result"
        className="textbox"
        id="result"
        placeholder={isLoading ? '' : 'Result'}
        value={isLoading ? loadingText : result}
        readOnly
      />
    );
  }
  
  export default ResultTextArea;