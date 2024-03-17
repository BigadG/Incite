# Incite

Incite is a Chrome extension integrated with a React application and a Node.js server designed to streamline the research and essay writing processes. The extension saves web pages, manages references, and generates essays complete with citations.

## Features

- **Chrome Extension**: Save and manage web pages for research.
- **React Application**: User interface for managing references and initiating essay generation.
- **Node.js Server**: Handles backend logic, API integration, and data management.

## Getting Started

Follow these instructions to set up the project on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm (Node Package Manager)
- Git
- MongoDB Atlas account

### Installation

Follow these steps to get your development environment running:

1. **Clone the Repository**

   ```bash
   git clone https://gitlab.com/BigadG/incite
   cd Incite
   ```

2. **Environment Setup**

   Set up the required environment variables. Create a `.env` file in both the `client` and `server` directories. Configure the following variables based on your setup (see attached image for reference):

   - `CHROME_ORIGIN`
   - `CLIENT_ORIGIN`
   - `DB_NAME=InciteDB`
   - `VITE_API_BASE_URL`
   - `JWT_SECRET`
   - `MONGO_ATLAS_PASSWORD`
   - `NODE_ENV`
   - `NODE_VERBOSE`
   - `OPENAI_API_KEY`
   - `organization`

   Note: The `DB_NAME` is predefined as `InciteDB`.

3. **Database Setup**

   Set up your MongoDB Atlas cluster and obtain the connection string. Update the `MONGO_ATLAS_PASSWORD` variable in your `server` `.env` with the database password.

4. **Install Dependencies**

   - Client:
     ```bash
     cd client
     npm install
     ```
   - Server:
     ```bash
     cd ../server
     npm install
     ```

5. **Run the Application**

   - Start the client:
     ```bash
     npm start
     ```
   - Start the server:
     ```bash
     npm run server
     ```

6. **Load the Chrome Extension**

   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" and click "Load unpacked".
   - Select the `extension` folder from the project directory.

### Running the Tests and Linting

- To run the tests and linting scripts for both the client and server, you can follow the CI/CD pipeline stages defined in the `.gitlab-ci.yml` file.

## Continuous Integration/Deployment

This project uses GitLab CI/CD for continuous integration and deployment:

- **Test Stage**: Runs automated tests for the server and client and lints the code.
- **Build Stage**: Builds the React client application.
- **Deploy Stage**: Deploys the server and client to Heroku. Make sure to set the necessary Heroku environment variables and SSH keys.

Refer to the `.gitlab-ci.yml` file for detailed configurations.

## Deployment

To run the application locally, use `localhost` URLs for the `CHROME_ORIGIN` and `CLIENT_ORIGIN` environment variables. Replace any hardcoded URLs with your own local or deployed URLs.

## Built With

- [React.js](https://reactjs.org/) - Front-end web framework
- [Node.js](https://nodejs.org/) - Server environment
- [Express.js](https://expressjs.com/) - Node.js web application framework
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Cloud database service

## Acknowledgments

- GPT API for AI-powered text generation
- Mozilla Readability Library for parsing page content

## Usage

After setting up the project, use the Chrome extension by clicking its icon while on a webpage to save it to your list of selections. The "Show selections" button displays saved pages, and the "Create" button initiates the essay generation process on a new page. Generate essays using saved pages, and automatically include citations. For missing citation information, you will be prompted to enter it before essay completion.