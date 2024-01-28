function InputField({ index, value, handleChange }) {
    return (
      <div key={`input-wrapper-${index}`}>
        {index === 0 ? (
          <label htmlFor="premise">Essay Premise:</label>
        ) : index === 1 ? (
          <label htmlFor={`input${index}-Id`}>Body Premises:</label>
        ) : null}
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
  
  export default InputField;