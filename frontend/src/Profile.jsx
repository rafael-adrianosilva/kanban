import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getMe, updateAvatar } from './api';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

const UserAvatar = ({ src, name, size = '120px' }) => {
    const [error, setError] = useState(false);
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    if (!src || error) {
        return (
            <div style={{ 
                width: size, 
                height: size, 
                borderRadius: '50%', 
                border: '3px solid var(--accent-color)', 
                background: 'var(--accent-color)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: `calc(${size} / 2)`,
                fontWeight: 700,
                flexShrink: 0
            }}>
                {initial}
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt="Avatar" 
            onError={() => setError(true)}
            style={{ width: size, height: size, borderRadius: '50%', border: '3px solid var(--accent-color)', background: 'rgba(255,255,255,0.8)', objectFit: 'cover', flexShrink: 0 }} 
        />
    );
};

export default function Profile({ onBackToDashboard, onLogout }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Avatar State
    const avatarStyles = ['bottts', 'adventurer', 'avataaars', 'micah', 'lorelei'];
    const styleNames = {
        'bottts': 'Astro Bot (Robô)',
        'adventurer': 'Aventureiro',
        'avataaars': 'Humano Clássico',
        'micah': 'Minimalista',
        'lorelei': 'Ilustrado'
    };
    const [styleIndex, setStyleIndex] = useState(0);
    const [seed, setSeed] = useState('');
    const [fotoEditada, setFotoEditada] = useState('');
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const data = await getMe();
                setUser(data);
                setSeed(data.nome);
                setFotoEditada(data.foto_avatar);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        onLogout();
    };

    const handleGenerateAvatar = (direction) => {
        const newSeed = Math.random().toString(36).substring(7);
        let newIndex = styleIndex;
        if (direction === 'next') newIndex = (styleIndex + 1) % avatarStyles.length;
        if (direction === 'prev') newIndex = (styleIndex - 1 + avatarStyles.length) % avatarStyles.length;
        
        setStyleIndex(newIndex);
        setSeed(newSeed);
        const newUrl = `https://api.dicebear.com/7.x/${avatarStyles[newIndex]}/svg?seed=${newSeed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
        setFotoEditada(newUrl);
    };

    const handleSaveAvatar = async () => {
        setSaving(true);
        setSucesso(false);
        try {
            await updateAvatar(fotoEditada);
            user.foto_avatar = fotoEditada;
            setUser({...user});
            setSucesso(true);
            setTimeout(() => setSucesso(false), 3000);
        } catch (e) {
            console.error('Erro ao salvar avatar', e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-primary)', textAlign: 'center', marginTop: '100px' }}>Carregando Identidade...</div>;
    if (!user) return <div style={{ color: 'var(--priority-urgent)', textAlign: 'center' }}>Erro ao ler dados.</div>;

    const isDirty = fotoEditada !== user.foto_avatar && !sucesso;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', paddingTop: '10vh' }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel" 
                style={{ padding: 'clamp(1.5rem, 6vw, 3rem)', textAlign: 'center', position: 'relative' }}
            >
                <button 
                    onClick={onBackToDashboard}
                    style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >
                    &larr; Voltar
                </button>

                <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Identidade</h2>

                {/* Seletor de Bonecos */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <button onClick={() => handleGenerateAvatar('prev')} style={{ background: 'var(--glass-bg)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-primary)' }}><ChevronLeft/></button>
                        
                        <div style={{ position: 'relative' }}>
                            <UserAvatar src={fotoEditada} name={user.nome} size="120px" />
                        </div>

                        <button onClick={() => handleGenerateAvatar('next')} style={{ background: 'var(--glass-bg)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: 'var(--text-primary)' }}><ChevronRight/></button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tipo de Boneco: <strong style={{color:'var(--text-primary)'}}>{styleNames[avatarStyles[styleIndex]]}</strong></p>
                    
                    {isDirty && (
                        <button onClick={handleSaveAvatar} disabled={saving} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--priority-low)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}>
                            <Save size={16}/> {saving ? 'Salvando...' : 'Confirmar Boneco'}
                        </button>
                    )}
                    {sucesso && <p style={{ color: 'var(--priority-low)', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 'bold' }}>Identidade Salva com Sucesso!</p>}
                </div>
                
                <h3 style={{ marginBottom: '0.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.nome}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{user.email}</p>
                
                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', textAlign: 'left' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Alistamento: <strong style={{ color: 'var(--text-primary)' }}>{new Date(user.criado_em).toLocaleDateString('pt-BR')}</strong></p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nível de permissão: <strong style={{ color: 'var(--priority-low)' }}>Ativo</strong></p>
                </div>

                <button 
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: '1px solid var(--priority-urgent)', color: 'var(--priority-urgent)', fontWeight: 600, padding: '1rem 3rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseOver={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
                >
                    Encerrar Sessão
                </button>
            </motion.div>
        </div>
    );
}
