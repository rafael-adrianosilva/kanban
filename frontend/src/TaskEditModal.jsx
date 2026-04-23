import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function TaskEditModal({ tarefa = {}, categorias = [], onClose, onSave }) {
  const isEditing = !!tarefa.id;
  const [titulo, setTitulo] = useState(tarefa.titulo || '');
  const [descricao, setDescricao] = useState(tarefa.descricao || '');
  const [prioridade, setPrioridade] = useState(tarefa.prioridade || 'media');
  const [categoriaId, setCategoriaId] = useState(tarefa.categoria_id || (categorias.length > 0 ? categorias[0].id : ''));
  const [tagsInput, setTagsInput] = useState(tarefa.tags ? tarefa.tags.join(', ') : '');
  const [dataLimite, setDataLimite] = useState(tarefa.data_limite ? (tarefa.data_limite.includes(' ') ? tarefa.data_limite.replace(' ', 'T') : tarefa.data_limite) : '');

  const handleSave = (e) => {
    e.preventDefault();
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      id: tarefa.id,
      titulo,
      descricao,
      prioridade,
      categoria_id: categoriaId,
      tags: tagsArray,
      data_limite: dataLimite ? dataLimite.replace('T', ' ') : null
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: 'clamp(1.2rem, 5vw, 2rem)', width: '100%', maxWidth: '500px', margin: '0 1rem', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 style={{ marginBottom: '1.5rem', fontWeight: 300 }}>{isEditing ? 'Editar' : 'Nova'} <span style={{ fontWeight: 700 }}>Tarefa</span></h2>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required
            style={{ width: '100%' }}
          />

          <input 
            type="datetime-local" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)}
            style={{ width: '100%' }}
          />
          
          <textarea 
            placeholder="Descrição da Tarefa..." value={descricao} onChange={(e) => setDescricao(e.target.value)}
            style={{ width: '100%', minHeight: '80px', fontFamily: 'inherit' }}
          />
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select 
              value={prioridade} onChange={(e) => setPrioridade(e.target.value)}
              style={{ flex: '1 1 120px' }}
            >
              <option value="urgente">Urgente</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
            
            <select 
              value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
              style={{ flex: '1 1 120px' }}
            >
              {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
              {/* Fallback caso Reunião não esteja na lista vinda do banco */}
              {!categorias.some(c => c.nome === 'Reunião') && <option value="reuniao_fallback">Reunião</option>}
            </select>
          </div>

          <input 
            type="text" placeholder="Tags (separadas por vírgula)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
            style={{ width: '100%' }}
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} style={{ flex: '1 1 120px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ flex: '1 1 120px', background: 'var(--accent-color)', color: 'var(--text-inverse)', fontWeight: 600, padding: '1rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}>{isEditing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
