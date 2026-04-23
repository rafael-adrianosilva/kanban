import React from 'react';
import { motion } from 'framer-motion';
import { 
    Flower2, Wind, Droplets, AlertTriangle, Sun, Moon, Cloud, 
    Home, Trees, Ghost, Cat, Rabbit, Bird, Star, Heart,
    Coffee, Utensils, Sparkles, MapPin, Fence
} from 'lucide-react';

export default function ZenGarden({ tarefas = [], estatisticas = {} }) {
    const totalConcluidas = tarefas.filter(t => t.status === 'concluida').length;
    const totalAtrasadas = estatisticas.atrasadas || 0;
    
    // Nível do jardim (0 a 1)
    const healthyRatio = totalConcluidas / (tarefas.length || 1);
    const gardenLevel = Math.max(0, Math.min(1, healthyRatio - (totalAtrasadas * 0.1)));
    
    const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;

    const flowers = Array.from({ length: Math.floor(gardenLevel * 20) });
    const characters = Array.from({ length: Math.floor(gardenLevel * 5) });
    const stars = Array.from({ length: isNight ? 20 : 0 });

    const skyColor = isNight ? 'linear-gradient(to bottom, #1a1c2c, #4a3e87)' : 'linear-gradient(to bottom, #87ceeb, #e0f6ff)';
    const groundColor = gardenLevel > 0.4 ? '#91db69' : '#e8c170';
    const darkGroundColor = gardenLevel > 0.4 ? '#4eab5f' : '#c49a50';

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="glass-panel"
            style={{ 
                padding: '1.5rem', 
                minHeight: '75vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                position: 'relative', 
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-lg)'
            }}
        >
            <div style={{ zIndex: 10, textAlign: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', color: 'var(--text-primary)' }}>
                    Mundo <span style={{ color: 'var(--accent-color)' }}>Zen</span>
                </h2>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '0.4rem' }}>
                    <div style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', fontWeight: 700 }}>🌸 {totalConcluidas} Concluídas</div>
                    <div style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700 }}>⚠️ {totalAtrasadas} Atrasos</div>
                </div>
            </div>

            {/* --- WORLD BOX --- */}
            <div style={{ 
                width: '100%', flex: 1, position: 'relative', borderRadius: '24px', 
                overflow: 'hidden', border: '6px solid #333', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                background: skyColor
            }}>
                {/* --- SKY --- */}
                <div style={{ position: 'absolute', top: '15%', left: '15%', zIndex: 2 }}>
                    {isNight ? (
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }}><Moon size={50} color="#fff176" fill="#fff176" style={{ filter: 'drop-shadow(0 0 15px rgba(255,241,118,0.5))' }} /></motion.div>
                    ) : (
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }}><Sun size={60} color="#ffb74d" fill="#ffb74d" style={{ filter: 'drop-shadow(0 0 20px rgba(255,183,77,0.4))' }} /></motion.div>
                    )}
                </div>

                {stars.map((_, i) => (
                    <motion.div 
                        key={`star-${i}`}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: i * 0.3 }}
                        style={{ position: 'absolute', top: Math.random() * 35 + '%', left: Math.random() * 95 + '%', zIndex: 1 }}
                    >
                        <Star size={Math.random() * 6 + 2} color="white" fill="white" />
                    </motion.div>
                ))}

                {/* Clouds */}
                {!isNight && [1,2,3].map(i => (
                    <motion.div 
                        key={`cloud-${i}`}
                        animate={{ x: [-150, 600] }}
                        transition={{ repeat: Infinity, duration: 25 + i * 8, ease: "linear", delay: i * -12 }}
                        style={{ position: 'absolute', top: (8 + i * 12) + '%', zIndex: 2, opacity: 0.7 }}
                    >
                        <Cloud size={50 + i * 15} color="white" fill="white" />
                    </motion.div>
                ))}

                {/* --- GROUND --- */}
                {/* Background Hills */}
                <div style={{ position: 'absolute', bottom: '38%', left: '-10%', width: '60%', height: '25%', background: darkGroundColor, borderRadius: '50% 50% 0 0', zIndex: 3, opacity: 0.8 }} />
                <div style={{ position: 'absolute', bottom: '35%', right: '-5%', width: '50%', height: '20%', background: darkGroundColor, borderRadius: '50% 50% 0 0', zIndex: 3, opacity: 0.6 }} />

                {/* Main Ground */}
                <div style={{ 
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%', 
                    background: groundColor, zIndex: 4, 
                    borderTop: '5px solid rgba(0,0,0,0.1)'
                }} />

                {/* Garden Path */}
                <div style={{ 
                    position: 'absolute', bottom: 0, left: '45%', width: '12%', height: '42%', 
                    background: '#d1d5db', zIndex: 4.1, clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                    opacity: 0.6
                }} />

                {/* --- DECORATIONS --- */}
                {/* Picket Fence */}
                <div style={{ position: 'absolute', bottom: '38%', left: '5%', right: '5%', zIndex: 5, display: 'flex', justifyContent: 'space-between' }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`fence-${i}`} style={{ width: '8px', height: '24px', background: '#fff', border: '1px solid #ccc', borderRadius: '2px 2px 0 0' }} />
                    ))}
                    <div style={{ position: 'absolute', top: '8px', left: 0, right: 0, height: '4px', background: '#fff', border: '1px solid #ccc' }} />
                </div>

                {/* The Cottage (House) */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    style={{ position: 'absolute', bottom: '32%', left: '50%', transform: 'translateX(-50%)', zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                    {/* Roof */}
                    <div style={{ width: 0, height: 0, borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: '40px solid #e11d48' }} />
                    {/* Body */}
                    <div style={{ width: '100px', height: '70px', background: '#fff1f2', border: '4px solid #333', position: 'relative', marginTop: '-4px' }}>
                        {/* Door */}
                        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '24px', height: '35px', background: '#4c1d95', borderRadius: '12px 12px 0 0', border: '2px solid #333' }}>
                             <div style={{ position: 'absolute', right: '4px', top: '18px', width: '4px', height: '4px', background: '#fbbf24', borderRadius: '50%' }} />
                        </div>
                        {/* Windows */}
                        <div style={{ position: 'absolute', top: '15px', left: '15px', width: '18px', height: '18px', background: isNight ? '#fbbf24' : '#bae6fd', border: '2px solid #333' }} />
                        <div style={{ position: 'absolute', top: '15px', right: '15px', width: '18px', height: '18px', background: isNight ? '#fbbf24' : '#bae6fd', border: '2px solid #333' }} />
                    </div>
                </motion.div>

                {/* Trees */}
                <div style={{ position: 'absolute', bottom: '38%', left: '12%', zIndex: 4.5 }}>
                    <motion.div animate={{ rotate: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 5 }}>
                        <Trees size={70} color="#166534" fill="#22c55e" strokeWidth={1.5} />
                    </motion.div>
                </div>
                <div style={{ position: 'absolute', bottom: '36%', right: '12%', zIndex: 4.5 }}>
                    <motion.div animate={{ rotate: [2, -2, 2] }} transition={{ repeat: Infinity, duration: 4.5 }}>
                        <Trees size={50} color="#166534" fill="#22c55e" strokeWidth={1.5} />
                    </motion.div>
                </div>

                {/* Garden Areas (Flowers) */}
                <div style={{ position: 'absolute', bottom: '5%', left: '10%', right: '10%', height: '25%', zIndex: 5.5, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {flowers.map((_, i) => (
                        <motion.div 
                            key={`flower-${i}`}
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Flower2 size={22} color={['#f472b6', '#fb7185', '#c084fc', '#60a5fa'][i % 4]} fill={['#fdf2f8', '#fff1f2', '#f5f3ff', '#eff6ff'][i % 4]} />
                        </motion.div>
                    ))}
                </div>

                {/* Characters */}
                {characters.map((_, i) => {
                    const Icons = [Cat, Rabbit, Bird, Ghost];
                    const CharIcon = Icons[i % Icons.length];
                    return (
                        <motion.div 
                            key={`char-${i}`}
                            animate={{ 
                                x: [0, 30, -30, 0], 
                                y: [0, -5, 0],
                                scaleX: [1, -1, 1]
                            }}
                            transition={{ repeat: Infinity, duration: 6 + i, ease: "easeInOut" }}
                            style={{ position: 'absolute', bottom: (8 + Math.random() * 15) + '%', left: (15 + i * 20) + '%', zIndex: 7 }}
                        >
                            <CharIcon size={32} color="#333" fill="#fff" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                        </motion.div>
                    );
                })}

                {/* Warnings (Atrasadas) */}
                {totalAtrasadas > 0 && Array.from({ length: Math.min(totalAtrasadas, 8) }).map((_, i) => (
                    <motion.div 
                        key={`warn-${i}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                        style={{ position: 'absolute', bottom: (2 + Math.random() * 10) + '%', left: (Math.random() * 90) + '%', zIndex: 8 }}
                    >
                        <AlertTriangle size={18} color="#ef4444" fill="#fee2e2" />
                    </motion.div>
                ))}

                {/* High Health Effects */}
                {gardenLevel > 0.8 && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <motion.div
                                key={`sparkle-${i}`}
                                animate={{ y: [0, -50], opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                                style={{ position: 'absolute', bottom: '40%', left: (10 + i * 15) + '%' }}
                            >
                                <Sparkles size={20} color="#fcd34d" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- STATS BAR --- */}
            <div style={{ width: '100%', marginTop: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)' }}>VITALIDADE DO MUNDO</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent-color)' }}>{Math.round(gardenLevel * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${gardenLevel * 100}%` }} 
                            style={{ height: '100%', background: 'var(--accent-color)', boxShadow: '0 0 10px var(--accent-color)' }} 
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        <Wind size={12} /> VENTO: {gardenLevel > 0.6 ? 'SUAVE' : 'FORTE'}
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        <MapPin size={12} /> ZONA: VALE ZEN
                     </div>
                </div>
            </div>
        </motion.div>
    );
}
