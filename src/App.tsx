import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import AgentChat from './pages/AgentChat';
import AutoSocialSettings from './pages/AutoSocialSettings';
import MatchDetail from './pages/MatchDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Home />} />
        <Route path="/agent-chat" element={<AgentChat />} />
        <Route path="/auto-social-settings" element={<AutoSocialSettings />} />
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
