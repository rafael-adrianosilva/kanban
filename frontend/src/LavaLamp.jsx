import React from 'react';

const LavaLamp = () => {
  // Configuração dos blobs para um efeito orgânico e fluido
  const blobs = [
    { id: 1, size: '600px', color: '#00f2fe', top: '-10%', left: '-10%', duration: '20s', opacity: 0.4 },
    { id: 2, size: '500px', color: '#ff0844', bottom: '-10%', right: '-5%', duration: '25s', opacity: 0.3 },
    { id: 3, size: '450px', color: '#10b981', top: '40%', left: '20%', duration: '22s', opacity: 0.25 },
    { id: 4, size: '550px', color: '#fbbf24', top: '-15%', right: '10%', duration: '28s', opacity: 0.35 },
    { id: 5, size: '400px', color: '#8b5cf6', bottom: '20%', left: '10%', duration: '30s', opacity: 0.2 },
    { id: 6, size: '350px', color: '#f472b6', top: '10%', right: '30%', duration: '18s', opacity: 0.3 },
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
      
      {/* Camada adicional de granulação/ruído para textura premium */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        opacity: 0.03,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Ffilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
};

export default LavaLamp;
