import InciteForm from './InciteForm';

function App() {
  // Log the API base URL to confirm it's being loaded
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

  return <InciteForm apiBaseUrl={import.meta.env.VITE_API_BASE_URL} />;
}

export default App;
