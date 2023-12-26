import React from 'react';
import '../styles/inciteStyles.css';

class InciteForm extends React.Component {
  // Handle form submission later
  handleSubmit = (event) => {
    event.preventDefault();
    // Implement logic to generate results here
  };

  // When I have a function to generate results, define it here
  generateResult = () => {

  };

  render() {
    return (
      <main>
        <h1>INCITE™</h1>
        <form onSubmit={this.handleSubmit}>
          <input type="text" className="textbox" name="input1-Name" id="input1-Id" placeholder="Premises" />
          <input type="text" className="textbox" name="input2-Name" id="input2-Id" placeholder="Data" />
          <input type="text" className="textbox" name="input3-Name" id="input3-Id" placeholder="Sources" />
          <textarea className="textbox" name="message" id="result" placeholder="Result"></textarea>
          <br />
          <button type="submit" className="submit">Sum It!</button>
        </form>
        <div id="chat-log">
          {/* Chat log content would go here */}
        </div>
      </main>
    );
  }
}

export default InciteForm;
