import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { login, register } from './api';

export default function LoginBoard({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('General');
  const [email, setEmail] = useState('general@zengrid.com');
  const [senha, setSenha] = useState('123456');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      if (isLogin) {
          const data = await login(email, senha);
          localStorage.setItem('zengrid_token', data.token);
          onLoginSuccess();
      } else {
          // Registro
          await register(nome, email, senha);
          const data = await login(email, senha);
          localStorage.setItem('zengrid_token', data.token);
          onLoginSuccess();
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}
      >
        <h1 style={{ marginBottom: '0.5rem', fontWeight: 300, letterSpacing: '2px' }}>ZEN <span style={{ fontWeight: 700 }}>GRID</span></h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <span onClick={() => setIsLogin(true)} style={{ cursor: 'pointer', color: isLogin ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: isLogin ? 700 : 400 }}>Login</span>
            <span style={{ color: 'var(--glass-border)' }}>|</span>
            <span onClick={() => setIsLogin(false)} style={{ cursor: 'pointer', color: !isLogin ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: !isLogin ? 700 : 400 }}>Cadastro</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required
              style={{ width: '100%' }}
            />
          )}
          <input 
            type="email" 
            placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ width: '100%' }}
          />
          <input 
            type="password" 
            placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required
            style={{ width: '100%' }}
          />
          
          {erro && <p style={{ color: 'var(--priority-urgent)', fontSize: '0.8rem' }}>{erro}</p>}
          
          <button type="submit" disabled={loading} style={{ background: 'var(--accent-color)', color: 'var(--text-inverse)', fontWeight: 600, padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
            {loading ? 'Aguarde...' : isLogin ? 'Acessar' : 'Alistar-se'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
