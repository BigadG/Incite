import InciteForm from './InciteForm';

function App() {
  return <InciteForm apiBaseUrl={import.meta.env.VITE_API_BASE_URL} />;
}

export default App;
