import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { HomePage } from './pages/HomePage';
import { OnboardingPage } from './pages/OnboardingPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { ScenarioPage } from './pages/ScenarioPage';

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/match/:id" element={<MatchDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/scenarios" element={<ScenarioPage />} />
        </Routes>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
