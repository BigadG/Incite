const config = {
    SERVER_URL: 'http://localhost:3001/api' // Default development URL
  };
  
  if (process.env.NODE_ENV === 'production') {
    config.SERVER_URL = 'https://your-production-url.com/api'; // Production URL
  }
  
  export default config;
  