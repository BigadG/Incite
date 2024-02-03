import PropTypes from 'prop-types';

function ResultTextArea({ isLoading, loadingText, result }) {
    return (
      <textarea
        name="result"
        className="textbox"
        id="result"
        placeholder={isLoading ? loadingText : 'Result'}
        value={isLoading ? loadingText : result}
        readOnly
      />
    );
}

ResultTextArea.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    loadingText: PropTypes.string,
    result: PropTypes.string
};

ResultTextArea.defaultProps = {
    loadingText: '',
    result: ''
};

export default ResultTextArea;
