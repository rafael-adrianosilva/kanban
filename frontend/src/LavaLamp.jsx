import React from 'react';

const LavaLamp = () => {
  // Configuração dos blobs para um efeito orgânico e fluido
  const blobs = [
    { id: 1, size: '700px', color: '#00f2fe', top: '-15%', left: '-10%', duration: '25s', opacity: 0.3 },
    { id: 2, size: '600px', color: '#ff0844', bottom: '-10%', right: '-5%', duration: '35s', opacity: 0.2 },
    { id: 3, size: '550px', color: '#10b981', top: '35%', left: '20%', duration: '30s', opacity: 0.25 },
    { id: 4, size: '650px', color: '#fbbf24', top: '-20%', right: '15%', duration: '40s', opacity: 0.3 },
  ];

  return (
    <div className="mesh-bg" style={{ pointerEvents: 'none' }}>
      {blobs.map((blob) => (
        <div
          key={blob.id}
          className="orb"
          style={{
            width: blob.size,
            height: blob.size,
            backgroundColor: blob.color,
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
            opacity: blob.opacity,
            '--duration': blob.duration,
          }}
        />
      ))}
    </div>
  );
};

export default LavaLamp;
