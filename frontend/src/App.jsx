import React, { useState, useEffect } from 'react';
import LavaLamp from './LavaLamp';
import LoginBoard from './LoginBoard';
import GlassDashboard from './GlassDashboard';
import Profile from './Profile';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' ou 'profile'

  useEffect(() => {
    const token = localStorage.getItem('zengrid_token');
    const tema_salvo = localStorage.getItem('zengrid_tema') || 'theme-original';
    const fonte_salva = localStorage.getItem('zengrid_fonte') || 'font-inter';

    document.body.className = `${tema_salvo} ${fonte_salva}`;

    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <>
      <SpeedInsights />
      <Analytics />
      <LavaLamp />

      {isAuthenticated ? (
        <div className="animate-fade-in">
          {currentView === 'profile' ? (
            <Profile 
              onBackToDashboard={() => setCurrentView('dashboard')} 
              onLogout={handleLogout} 
            />
          ) : (
            <GlassDashboard 
              onNavigateToProfile={() => setCurrentView('profile')}
              onLogout={handleLogout}
            />
          )}
        </div>
      ) : (
        <LoginBoard onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
