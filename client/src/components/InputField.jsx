import PropTypes from 'prop-types';

function InputField({ index, value, handleChange }) {
    return (
      <div>
        {index === 0 ? (
          <label htmlFor="premise">Essay Premise:</label>
        ) : (
          <label htmlFor={`input${index}-Id`}>Body Premises:</label>
        )}
        <input
          type="text"
          className="textbox"
          name={index === 0 ? "premise" : `prompt${index}`}
          id={index === 0 ? "premise" : `input${index}-Id`}
          placeholder={index === 0 ? "Essay Premise" : `Body ${index}`}
          value={value}
          onChange={(event) => handleChange(index)(event)}
        />
      </div>
    );
}

InputField.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default InputField;
