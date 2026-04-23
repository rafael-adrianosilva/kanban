import React, { useState, useEffect } from 'react';

export default function MeetingTimer({ targetDate, isConcluida }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (isConcluida) {
      setTimeLeft('Terminado');
      return;
    }
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft('Acontecendo agora ou já passou');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px', 
      background: 'rgba(14, 165, 233, 0.1)', 
      color: 'var(--accent-color)', 
      padding: '4px 10px', 
      borderRadius: '20px', 
      fontSize: '0.75rem', 
      fontWeight: 700,
      border: '1px solid var(--accent-color)',
      marginTop: '8px'
    }}>
      <span style={{ fontSize: '1rem' }}>⏱</span> {timeLeft}
    </div>
  );
}
