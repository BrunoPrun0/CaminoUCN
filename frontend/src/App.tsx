
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { usuario } = useAuth();
  
 
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={usuario ? <Home /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default App;