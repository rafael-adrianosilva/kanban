import React, { useState, useEffect } from 'react';
import LoginBoard from './LoginBoard';
import GlassDashboard from './GlassDashboard';
import Profile from './Profile';

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
      {/* Mesh Background Orbs */}
      <div className="mesh-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>

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
