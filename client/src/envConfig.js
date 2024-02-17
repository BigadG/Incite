const getAPIBaseURL = () => {
    // When running in Jest, 'process.env' is available, but 'import.meta.env' is not.
    if (process.env.NODE_ENV === 'test') {
      return process.env.VITE_API_BASE_URL || 'http://localhost:3001';
    }
    // When running in Vite, 'import.meta.env' is available.
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  };
  
  export const API_BASE_URL = getAPIBaseURL();
  