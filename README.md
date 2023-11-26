
# Incite

Incite is a comprehensive project that includes a Chrome extension, a React front-end application, and a Node.js server. It's designed to enhance research and essay writing processes, offering functionalities like web page saving, essay generation using APIs, and automatic citation.

## Features

- **Chrome Extension**: Save web pages for reference and research.
- **React Client**: Interactive web interface for managing saved pages and initiating essay generation.
- **Node.js Server**: Backend logic, including API integration and data processing.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm (Node Package Manager)
- Git

1. **Clone the Repository**

   ```
   git clone git@gitlab.com:BigadG/incite.git
   cd Incite
   ```

2. **Set Up the Client**

   Navigate to the `client` directory and install dependencies:

   ```
   cd client
   npm install
   ```

3. **Set Up the Server**

   In a separate terminal, navigate to the `server` directory and install dependencies:

   ```
   cd server
   npm install
   ```

4. **Run the Application**

   - To start the client (React app), run:
     ```
     npm start
     ```
   - To start the server (Node.js), run:
     ```
     npm run server
     ```

5. **Load the Chrome Extension**

   - Navigate to `chrome://extensions/` in the Chrome browser.
   - Enable "Developer mode" and click "Load unpacked".
   - Select the `extension` folder from the project directory.

### Running the Tests

To run the tests for the React application, navigate to the `client` directory and run:

```
npm test
```

## Deployment

(Later) Add additional notes about how to deploy this on a live system.

## Built With

- [React.js](https://reactjs.org/) - The web framework used for the client
- [Node.js](https://nodejs.org/) - Server Environment
- [Express.js](https://expressjs.com/) - Node.js framework used for the server

## Acknowledgments

- GPT API for AI-powered text generation
- SerpAPI for web scraping
- And any other acknowledgments
