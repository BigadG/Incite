
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Set up a function to call the API to add a selection
const addSelection = async (selectionData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}/add-selection`, selectionData, config);

  return response.data;
};

// Export the service functions
export { addSelection };
