
# Incite Chrome Extension

Incite is a Chrome extension designed to enhance research and essay writing processes. It allows users to save web pages, generate essays using GPT API and SerpAPI, and includes automatic citation generation.

## Features

- **Save Web Pages**: Users can add web pages to a list (up to 7 pages) for reference and research.
- **View Saved Pages**: Easy access to a list of saved pages through the Chrome extension icon.
- **Generate Essays**: Leverages GPT API and SerpAPI to create essays based on the saved web pages.
- **Automatic Citations**: Includes citations in the generated essays.
- **List Management**: Clears the saved pages list after the user completes an essay, readying the tool for the next use.

## Project Structure

- **/popup**: Contains HTML, CSS, and JavaScript for the extension's popup UI.
- **/content**: JavaScript files for content scripts that interact with web pages.
- **/background**: Background scripts for the extension.
- **/icons**: Icons used in the extension.
- **/client**: Front-end for the webpage where users can generate essays, built with React.js and powered by Vite.
- **/server**: Node.js server handling API integrations and back-end logic.
- **manifest.json**: Chrome extension manifest file.

## Setup and Installation

1. **Clone the Repository**:
   ```bash
   git clone [repository_url]
   ```
2. **Install Dependencies**:
   - Navigate to `/server` and `/client` directories and run `npm install` in each.

## Usage

1. **Load the Extension in Chrome**:
   - Navigate to `chrome://extensions/` in the Chrome browser.
   - Enable "Developer mode" and click on "Load unpacked".
   - Select the folder containing the extension files.

2. **Running the Web Application**:
   - In the `/client` directory, start the Vite development server by running `npm run dev`.
   - Start the Node.js server in the `/server` directory.

## GitLab CI/CD

This project uses GitLab's Continuous Integration/Continuous Deployment (CI/CD) for automated testing and deployment. The `.gitlab-ci.yml` file contains the configuration for this process.

### Key CI/CD Processes:

- **Automated Testing**: Run tests on each commit to ensure code integrity.
- **Deployment**: Automated deployment of the server and client applications to the production environment.

## Contributing

While this project is currently not open for contributions, feedback and suggestions are always welcome.

## Authors

- Your Name - *Initial work*

## Acknowledgments

- GPT API for providing the AI-powered essay generation.
- SerpAPI for web page data extraction.
