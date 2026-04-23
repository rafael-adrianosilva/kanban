import React, { useEffect, useState } from 'react';
import { 
    getEstatisticas, getTarefas, addTarefa, getMe, updateTarefa, deleteTarefa,
    getCategorias, addCategoria, deleteCategoria, updateEmail, updateSenha,
    getHistoricoEstatisticas
} from './api';
import EisenhowerMatrix from './EisenhowerMatrix';
import TaskEditModal from './TaskEditModal';
import MeetingTimer from './MeetingTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Filter, Home, CheckSquare, Layers, Settings, Plus, Calendar, Clock, 
    Trash2, Edit3, Check, Save, Palette, Type, Mail, Lock, LogOut, BarChart2,
    Menu, X
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell
} from 'recharts';

/* --- COMPONENTES AUXILIARES --- */

const StatBox = ({ title, value, color }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, textAlign: 'center', borderTop: `4px solid ${color}` }}>
    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</h4>
    <span className="stat-box-value" style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{value}</span>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <div 
        onClick={onClick}
        style={{ 
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-sm)', 
            cursor: 'pointer', background: active ? 'rgba(255,255,255,0.4)' : 'transparent', 
            color: active ? 'var(--accent-color)' : 'var(--text-secondary)', 
            fontWeight: active ? 600 : 400, transition: 'all 0.2s' 
        }}
    >
        <Icon size={20} />
        <span>{label}</span>
    </div>
);

/* --- VIEWS --- */

// 1. Dashboard View (Matriz)
const DashboardView = ({ estatisticas, perfil, tarefas, categorias, loadData, setTarefaEditando, filtroPesquisa, setFiltroPesquisa, filtroCategoria, setFiltroCategoria }) => {
    const proximasTarefas = tarefas
        .filter(t => t.status === 'pendente' && t.data_limite)
        .sort((a, b) => new Date(a.data_limite) - new Date(b.data_limite))
        .slice(0, 3);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const tarefasFiltradas = tarefas.filter(t => {
        const matchCategoria = filtroCategoria === 'todas' || t.categoria_id === Number(filtroCategoria);
        const matchTermo = t.titulo.toLowerCase().includes(filtroPesquisa.toLowerCase()) || (t.tags && t.tags.some(tg => tg.toLowerCase().includes(filtroPesquisa.toLowerCase())));
        return matchCategoria && matchTermo;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 300, color: 'var(--text-primary)' }}>{getGreeting()}, <span style={{ fontWeight: 700 }}>{perfil?.nome.split(' ')[0]}</span>.</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>Status operacional da sua base.</p>
            </header>

            <div className="stats-grid">
                <StatBox title="Tarefas Totais" value={estatisticas.total || 0} color="var(--accent-color)" />
                <StatBox title="Concluídas (7 dias)" value={estatisticas.concluidas7Dias || 0} color="var(--priority-medium)" />
                <StatBox title="Concluídas Hoje" value={estatisticas.concluidasHoje || 0} color="var(--priority-low)" />
                <StatBox title="Atrasos" value={estatisticas.atrasadas || 0} color="var(--priority-urgent)" />
            </div>



            <div style={{ 
                display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', 
                background: 'var(--glass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--glass-border)', flexWrap: 'wrap' 
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '1 1 300px' }}>
                    <Filter size={20} color="var(--text-secondary)" />
                    <input 
                        type="text" placeholder="Pesquisar..." value={filtroPesquisa} 
                        onChange={(e) => setFiltroPesquisa(e.target.value)} 
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} 
                    />
                </div>
                <div className="desktop-only" style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }} />
                <select 
                    value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', outline: 'none', cursor: 'pointer', flex: '1 1 150px' }}
                >
                    <option value="todas">Todas as Categorias</option>
                    {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </div>

            <EisenhowerMatrix tarefas={tarefasFiltradas} onUpdate={loadData} onEditTask={setTarefaEditando} />
        </motion.div>
    );
};

// 2. Minhas Tarefas View (Lista Linear Colorida)
const TasksView = ({ tarefas, onUpdate, onEdit }) => {
    const getColor = (task) => {
        if (task.status === 'concluida') return '#3b82f6'; // Azul
        if (task.prioridade === 'urgente') return '#ef4444'; // Vermelho
        if (task.prioridade === 'media') return '#f59e0b'; // Amarelo
        if (task.prioridade === 'baixa') return '#10b981'; // Verde
        return 'var(--text-secondary)';
    };

    const getLabel = (task) => {
        if (task.status === 'concluida') return 'Concluída';
        if (task.prioridade === 'urgente') return 'Fazer Agora';
        if (task.prioridade === 'media') return 'Agendar / Focar';
        if (task.prioridade === 'baixa') return 'Delegar / Depois';
        return '';
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Minhas <span style={{ fontWeight: 700 }}>Tarefas</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tarefas.sort((a,b) => b.id - a.id).map(t => (
                    <div key={t.id} className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `6px solid ${getColor(t)}`, flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem', fontSize: '1.1rem' }}>{t.titulo}</h4>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getColor(t), textTransform: 'uppercase', letterSpacing: '0.5px' }}>{getLabel(t)}</span>
                                {t.data_limite && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⏱ {new Date(t.data_limite).toLocaleDateString('pt-BR', {timeZone:'UTC'})}</span>}
                                {t.categoria_nome === 'Reunião' && t.data_limite && <MeetingTimer targetDate={t.data_limite} />}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={async () => { await updateTarefa(t.id, { status: t.status === 'concluida' ? 'pendente' : 'concluida' }); onUpdate(); }} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><Check size={18} /></button>
                            <button onClick={() => onEdit(t)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><Edit3 size={18} /></button>
                            <button onClick={async () => { await deleteTarefa(t.id); onUpdate(); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--priority-urgent)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// 3. Categorias View
const CategoriesView = ({ categorias, onUpdate }) => {
    const [novoNome, setNovoNome] = useState('');
    const [novaCor, setNovaCor] = useState('#0ea5e9');

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            if (!novoNome.trim()) return;
            if (novoNome.toLowerCase() === 'reunião') {
                alert('A categoria "Reunião" já é um padrão do sistema.');
                return;
            }
            await addCategoria({ nome: novoNome, cor: novaCor });
            setNovoNome('');
            onUpdate();
        } catch (err) {
            alert(err.message || 'Erro ao adicionar categoria');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Gerenciar <span style={{ fontWeight: 700 }}>Categorias</span></h2>
            
            <form onSubmit={handleAdd} className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nome da Categoria</label>
                    <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: Projetos X" required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Cor de Destaque</label>
                    <input type="color" value={novaCor} onChange={(e) => setNovaCor(e.target.value)} style={{ width: '100%', height: '45px', padding: '2px', cursor: 'pointer' }} />
                </div>
                <button type="submit" style={{ padding: '1rem 2rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' }}>Adicionar</button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {categorias.map(c => (
                    <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.cor }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.nome}</span>
                        </div>
                        {!['Casa', 'Estudos', 'Pessoal', 'Trabalho', 'Reunião'].includes(c.nome) && ![1, 2, 3, 4, 5].includes(c.id) && (
                            <button onClick={async () => { await deleteCategoria(c.id); onUpdate(); }} style={{ background: 'transparent', border: 'none', color: 'var(--priority-urgent)', cursor: 'pointer' }}><Trash2 size={18}/></button>
                        )}
                    </div>
                ))}
                {/* Fixed "Reunião" card if not present in DB as default but logic needs it */}
                {!categorias.find(c => c.nome === 'Reunião') && (
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ff0844' }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Reunião (Sistema)</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// 5. Gráficos View
const ChartsView = () => {
    const [dados, setDados] = useState([]);
    const [periodo, setPeriodo] = useState('semana'); // 'semana', 'mes', 'ano'
    const chartColor = localStorage.getItem('zengrid_chart_color') || 'var(--accent-color)';
    const chartStyle = localStorage.getItem('zengrid_chart_style') || 'column';

    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        setLoading(true);
        getHistoricoEstatisticas(periodo === 'ano' ? 'monthly' : 'daily')
            .then(res => {
                console.log('Dados do Gráfico:', res);
                setDados(res || []);
                setErro(null);
            })
            .catch(err => {
                console.error('Erro ao carregar gráficos:', err);
                setErro('Não foi possível carregar os dados operativos.');
            })
            .finally(() => setLoading(false));
    }, [periodo]);

    const dataFiltrada = periodo === 'semana' ? dados.slice(-7) : dados;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Análise de <span style={{ fontWeight: 700 }}>Produtividade</span></h2>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {['semana', 'mes', 'ano'].map(p => (
                        <button 
                            key={p} 
                            onClick={() => setPeriodo(p)}
                            style={{ 
                                padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
                                background: periodo === p ? 'var(--accent-color)' : 'transparent',
                                color: periodo === p ? 'white' : 'var(--text-secondary)', cursor: 'pointer', textTransform: 'capitalize'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Carregando dados...</div>
                ) : erro ? (
                    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--priority-urgent)' }}>{erro}</div>
                ) : dados.length === 0 ? (
                    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Sem dados para o período selecionado.</div>
                ) : (
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart 
                                data={dataFiltrada} 
                                layout={chartStyle === 'bar' ? 'vertical' : 'horizontal'}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                                {chartStyle === 'bar' ? <YAxis dataKey="data" stroke="var(--text-secondary)" type="category" /> : <XAxis dataKey="data" stroke="var(--text-secondary)" />}
                                {chartStyle === 'bar' ? <XAxis type="number" stroke="var(--text-secondary)" /> : <YAxis stroke="var(--text-secondary)" />}
                                <Tooltip 
                                    contentStyle={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Legend />
                                <Bar dataKey="registradas" name="Registradas" fill={chartColor} radius={chartStyle === 'bar' ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
                                <Bar dataKey="concluidas" name="Concluídas" fill="var(--priority-low)" radius={chartStyle === 'bar' ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
                                <Bar dataKey="atrasadas" name="Atrasadas" fill="var(--priority-urgent)" radius={chartStyle === 'bar' ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// 4. Configurações View
const SettingsView = ({ perfil, onLogout }) => {
    const [email, setEmail] = useState(perfil?.email || '');
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [tema, setTema] = useState(localStorage.getItem('zengrid_tema') || 'theme-original');
    const [fonte, setFonte] = useState(localStorage.getItem('zengrid_fonte') || 'font-inter');
    
    // Novas configs de gráfico
    const [chartColor, setChartColor] = useState(localStorage.getItem('zengrid_chart_color') || '#0ea5e9');
    const [chartStyle, setChartStyle] = useState(localStorage.getItem('zengrid_chart_style') || 'column');

    // Quadrant Colors
    const [qUrgent, setQUrgent] = useState(localStorage.getItem('zengrid_q_urgent') || '#ef4444');
    const [qMedium, setQMedium] = useState(localStorage.getItem('zengrid_q_medium') || '#f59e0b');
    const [qLow, setQLow] = useState(localStorage.getItem('zengrid_q_low') || '#10b981');
    const [qDone, setQDone] = useState(localStorage.getItem('zengrid_q_done') || '#0ea5e9');
    const [animacoesQuadrantes, setAnimacoesQuadrantes] = useState(localStorage.getItem('zengrid_anim_quad') === 'true');

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        try {
            await updateEmail(email);
            alert('E-mail atualizado!');
        } catch(e) { alert(e.erro || 'Falha ao atualizar e-mail'); }
    };

    const handleUpdateSenha = async (e) => {
        e.preventDefault();
        try {
            await updateSenha(senhaAtual, novaSenha);
            alert('Senha alterada!');
            setSenhaAtual(''); setNovaSenha('');
        } catch(e) { alert(e.erro || 'Falha ao atualizar senha'); }
    };

    const applyTheme = (t) => {
        setTema(t);
        localStorage.setItem('zengrid_tema', t);
        const currentFont = localStorage.getItem('zengrid_fonte') || 'font-inter';
        document.body.className = `${t} ${currentFont}`;
    };

    const applyFont = (f) => {
        setFonte(f);
        localStorage.setItem('zengrid_fonte', f);
        const currentTheme = localStorage.getItem('zengrid_tema') || 'theme-original';
        document.body.className = `${currentTheme} ${f}`;
    };

    const applyChartColor = (c) => {
        setChartColor(c);
        localStorage.setItem('zengrid_chart_color', c);
    };

    const applyChartStyle = (s) => {
        setChartStyle(s);
        localStorage.setItem('zengrid_chart_style', s);
    };

    const applyQuadrantColor = (key, color) => {
        localStorage.setItem(`zengrid_q_${key}`, color);
        document.documentElement.style.setProperty(`--priority-${key === 'urgent' ? 'urgent' : key === 'medium' ? 'medium' : key === 'low' ? 'low' : 'done'}`, color);
        if (key === 'urgent') setQUrgent(color);
        if (key === 'medium') setQMedium(color);
        if (key === 'low') setQLow(color);
        if (key === 'done') setQDone(color);
    };

    const applyAnimacoes = (val) => {
        setAnimacoesQuadrantes(val);
        localStorage.setItem('zengrid_anim_quad', val);
        window.dispatchEvent(new Event('storage')); // Trigger update for other components if needed
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Configurações do <span style={{ fontWeight: 700 }}>Sistema</span></h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {/* Aparência */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Palette size={20}/> Personalização</h3>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Tema Visual</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            {['Original', 'Dark', 'Natureza', 'Sakura'].map(t => {
                                const id = `theme-${t.toLowerCase().replace('natureza', 'nature')}`;
                                return (
                                    <button 
                                        key={t} 
                                        onClick={() => applyTheme(id)}
                                        style={{ 
                                            padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: tema === id ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                                            background: tema === id ? 'var(--accent-color)' : 'transparent', color: tema === id ? 'white' : 'var(--text-primary)', cursor: 'pointer'
                                        }}
                                    >
                                        {t}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Gráficos: Estilo e Cor</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button onClick={() => applyChartStyle('column')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: chartStyle === 'column' ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)', background: chartStyle === 'column' ? 'rgba(14,165,233,0.1)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Colunas</button>
                            <button onClick={() => applyChartStyle('bar')} style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: chartStyle === 'bar' ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)', background: chartStyle === 'bar' ? 'rgba(14,165,233,0.1)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Barras</button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['#0ea5e9', '#10b981', '#f59e0b', '#ec4899'].map(c => (
                                <div key={c} onClick={() => applyChartColor(c)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, cursor: 'pointer', border: chartColor === c ? '3px solid white' : 'none', boxShadow: chartColor === c ? '0 0 10px rgba(0,0,0,0.3)' : 'none' }} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Fonte do Sistema</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            {[
                                { id: 'font-inter', label: 'Inter', font: 'Inter' },
                                { id: 'font-outfit', label: 'Outfit', font: 'Outfit' },
                                { id: 'font-poppins', label: 'Poppins', font: 'Poppins' },
                                { id: 'font-montserrat', label: 'Montserrat', font: 'Montserrat' },
                                { id: 'font-playfair', label: 'Playfair', font: 'Playfair Display' },
                                { id: 'font-mono', label: 'Fira Code', font: 'Fira Code' }
                            ].map(f => (
                                <button 
                                    key={f.id} 
                                    onClick={() => applyFont(f.id)}
                                    style={{ 
                                        padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: fonte === f.id ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                                        background: fonte === f.id ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer',
                                        fontFamily: f.font, fontSize: '0.95rem'
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Cores dos Quadrantes</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="color" value={qUrgent} onChange={(e) => applyQuadrantColor('urgent', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer' }} />
                                <span style={{ fontSize: '0.85rem' }}>Fazer Agora</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="color" value={qMedium} onChange={(e) => applyQuadrantColor('medium', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer' }} />
                                <span style={{ fontSize: '0.85rem' }}>Agendar / Focar</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="color" value={qLow} onChange={(e) => applyQuadrantColor('low', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer' }} />
                                <span style={{ fontSize: '0.85rem' }}>Delegar / Depois</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="color" value={qDone} onChange={(e) => applyQuadrantColor('done', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', cursor: 'pointer' }} />
                                <span style={{ fontSize: '0.85rem' }}>Concluídas</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input 
                                type="checkbox" 
                                checked={animacoesQuadrantes} 
                                onChange={(e) => applyAnimacoes(e.target.checked)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                            />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Ativar Animações de Brilho</span>
                        </div>
                    </div>
                </div>

                {/* Segurança */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={20}/> Alterar E-mail</h3>
                        <form onSubmit={handleUpdateEmail} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1 }} />
                            <button type="submit" style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}><Save size={20}/></button>
                        </form>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={20}/> Alterar Senha</h3>
                        <form onSubmit={handleUpdateSenha} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="password" placeholder="Senha Atual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
                            <input type="password" placeholder="Nova Senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
                            <button type="submit" style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', border: 'none', padding: '1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Trocar Senha</button>
                        </form>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        <button onClick={() => { localStorage.removeItem('zengrid_token'); onLogout(); }} style={{ width: '100%', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 600 }}>
                            <LogOut size={20}/> Encerrar Sessão
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* --- MAIN DASHBOARD COMPONENT --- */

export default function GlassDashboard({ onNavigateToProfile, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'tasks', 'categories', 'settings'
  const [estatisticas, setEstatisticas] = useState({ total: 0, concluidasHoje: 0, atrasadas: 0, concluidas7Dias: 0 });
  const [tarefas, setTarefas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPesquisa, setFiltroPesquisa] = useState('');

  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadData = async () => {
    try {
      const [stats, tasks, dataPerfil, cats] = await Promise.all([ 
          getEstatisticas(), getTarefas(), getMe(), getCategorias() 
      ]);
      setEstatisticas(stats); 
      setTarefas(tasks); 
      setPerfil(dataPerfil);
      setCategorias(cats);
    } catch (e) { 
        console.error(e); 
    } finally { 
        if (isInitialLoad) setIsInitialLoad(false); 
    }
  };

  useEffect(() => { 
    loadData(); 
    // Apply saved preferences
    const t = localStorage.getItem('zengrid_tema') || 'theme-original';
    const f = localStorage.getItem('zengrid_fonte') || 'font-inter';
    document.body.className = `${t} ${f}`;

    // Apply quadrant colors
    const qu = localStorage.getItem('zengrid_q_urgent') || '#ef4444';
    const qm = localStorage.getItem('zengrid_q_medium') || '#f59e0b';
    const ql = localStorage.getItem('zengrid_q_low') || '#10b981';
    const qd = localStorage.getItem('zengrid_q_done') || '#0ea5e9';
    document.documentElement.style.setProperty('--priority-urgent', qu);
    document.documentElement.style.setProperty('--priority-medium', qm);
    document.documentElement.style.setProperty('--priority-low', ql);
    document.documentElement.style.setProperty('--priority-done', qd);
  }, []);

  const handleSaveModal = async (taskData) => {
    try {
        if (taskData.id) {
            await updateTarefa(taskData.id, taskData);
        } else {
            if (!taskData.titulo) {
                alert('O título da tarefa é obrigatório');
                return;
            }
            await addTarefa(taskData);
        }
        setTarefaEditando(null);
        setIsNewTaskModalOpen(false);
        loadData();
    } catch (err) {
        alert(err.message || 'Erro ao salvar tarefa');
    }
  };

  if (isInitialLoad) return <div style={{ color: 'var(--text-primary)', textAlign: 'center', marginTop: '10vh' }}>Iniciando Base...</div>;

  return (
    <div className="dashboard-container">
        
        {/* Modals */}
        {tarefaEditando && <TaskEditModal tarefa={tarefaEditando} categorias={categorias} onClose={() => setTarefaEditando(null)} onSave={handleSaveModal} />}
        {isNewTaskModalOpen && <TaskEditModal tarefa={{}} categorias={categorias} onClose={() => setIsNewTaskModalOpen(false)} onSave={handleSaveModal} />}

        {/* Mobile Header */}
        <div className="mobile-header">
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                Zen Grid
            </h2>
            <div style={{ width: 24 }} /> {/* Spacer */}
        </div>

        {/* Sidebar Overlay */}
        <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

        {/* --- SIDEBAR --- */}
        <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : ''}`}>
            <div style={{ padding: '2.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 15px var(--accent-color)' }} />
                    Zen Grid
                </h2>
                <button className="mobile-only" onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'none' }}>
                    <X size={24} />
                </button>
            </div>
            
            <nav style={{ flex: 1, padding: '0 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SidebarItem icon={Home} label="Dashboard" active={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={CheckSquare} label="Minhas Tarefas" active={activeView === 'tasks'} onClick={() => { setActiveView('tasks'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={BarChart2} label="Gráficos" active={activeView === 'charts'} onClick={() => { setActiveView('charts'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Layers} label="Categorias" active={activeView === 'categories'} onClick={() => { setActiveView('categories'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Settings} label="Configurações" active={activeView === 'settings'} onClick={() => { setActiveView('settings'); setIsSidebarOpen(false); }} />
            </nav>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                <div onClick={onNavigateToProfile} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }} className="hover-highlight">
                    <img src={perfil?.foto_avatar} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-color)', objectFit: 'cover' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{perfil?.nome}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{perfil?.email}</p>
                    </div>
                </div>
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="main-content">
            <AnimatePresence mode="wait">
                {activeView === 'dashboard' && (
                    <DashboardView 
                        key="v-dash"
                        estatisticas={estatisticas} perfil={perfil} tarefas={tarefas} 
                        categorias={categorias} 
                        loadData={loadData} setTarefaEditando={setTarefaEditando}
                        filtroPesquisa={filtroPesquisa} setFiltroPesquisa={setFiltroPesquisa}
                        filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
                    />
                )}
                {activeView === 'tasks' && (
                    <TasksView key="v-tasks" tarefas={tarefas} onUpdate={loadData} onEdit={setTarefaEditando} />
                )}
                {activeView === 'charts' && (
                    <ChartsView key="v-charts" />
                )}
                {activeView === 'categories' && (
                    <CategoriesView key="v-cats" categorias={categorias} onUpdate={loadData} />
                )}
                {activeView === 'settings' && (
                    <SettingsView key="v-sett" perfil={perfil} onLogout={onLogout} />
                )}
            </AnimatePresence>

            {/* Botão FAB de Criação Rápida */}
            <button 
                onClick={() => setIsNewTaskModalOpen(true)}
                title="Nova Tarefa"
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', borderRadius: '50%',
                    background: 'var(--accent-color)', color: '#fff', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 15px 35px rgba(14, 165, 233, 0.4)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', zIndex: 999
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'; e.currentTarget.style.boxShadow = '0 20px 45px rgba(14, 165, 233, 0.6)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(14, 165, 233, 0.4)'; }}
            >
                <Plus size={32} />
            </button>
        </main>
    </div>
  );
}
