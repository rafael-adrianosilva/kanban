const express = require('express');
const cors = require('cors');
const db = require('./database'); // Agora exporta o Firestore
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'segredo_zengrid_super_seguro_2026';

app.use(cors());
app.use(express.json());

const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ erro: 'Token inválido' });
        req.usuarioId = user.id;
        next();
    });
};

/* --- ENDPOINTS DE AUTENTICAÇÃO E PERFIL --- */

app.post('/auth/registro', async (req, res) => {
    const { nome, email, senha, foto_avatar } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios' });

    try {
        const hash = await bcrypt.hash(senha, 10);
        const avatarToUse = foto_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nome)}&radius=50&backgroundColor=6366f1`;

        // Verificar se usuário já existe
        const userSnapshot = await db.collection('usuarios').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ erro: 'E-mail já está em uso' });
        }

        const userRef = await db.collection('usuarios').add({
            nome,
            email,
            senha: hash,
            foto_avatar: avatarToUse,
            criado_em: new Date().toISOString()
        });

        res.status(201).json({ id: userRef.id, email, nome });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        const userSnapshot = await db.collection('usuarios').where('email', '==', email).get();
        if (userSnapshot.empty) return res.status(404).json({ erro: 'Usuário não encontrado' });

        const usuarioDoc = userSnapshot.docs[0];
        const usuario = { id: usuarioDoc.id, ...usuarioDoc.data() };

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas' });

        const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, foto: usuario.foto_avatar } });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao realizar login' });
    }
});

app.get('/auth/me', autenticarToken, async (req, res) => {
    try {
        const userDoc = await db.collection('usuarios').doc(req.usuarioId).get();
        if (!userDoc.exists) return res.status(404).json({ erro: 'Perfil não encontrado' });
        
        const usuario = { id: userDoc.id, ...userDoc.data() };
        delete usuario.senha;
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar perfil' });
    }
});

app.put('/auth/me/avatar', autenticarToken, async (req, res) => {
    const { foto_avatar } = req.body;
    if (!foto_avatar) return res.status(400).json({ erro: 'Avatar URL é obrigatório' });
    try {
        await db.collection('usuarios').doc(req.usuarioId).update({ foto_avatar });
        res.status(200).json({ mensagem: 'Identidade atualizada com sucesso', foto_avatar });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar avatar' });
    }
});

app.put('/auth/me/email', autenticarToken, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório' });
    try {
        const userSnapshot = await db.collection('usuarios').where('email', '==', email).get();
        if (!userSnapshot.empty) return res.status(400).json({ erro: 'E-mail indisponível' });

        await db.collection('usuarios').doc(req.usuarioId).update({ email });
        res.status(200).json({ mensagem: 'E-mail atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar e-mail' });
    }
});

app.put('/auth/me/senha', autenticarToken, async (req, res) => {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) return res.status(400).json({ erro: 'Forneça a senha atual e a nova' });

    try {
        const userDoc = await db.collection('usuarios').doc(req.usuarioId).get();
        if (!userDoc.exists) return res.status(500).json({ erro: 'Usuário não encontrado' });

        const userData = userDoc.data();
        const senhaValida = await bcrypt.compare(senha_atual, userData.senha);
        if (!senhaValida) return res.status(401).json({ erro: 'Senha atual incorreta' });

        const hash = await bcrypt.hash(nova_senha, 10);
        await db.collection('usuarios').doc(req.usuarioId).update({ senha: hash });
        res.status(200).json({ mensagem: 'Senha alterada com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao trocar senha' });
    }
});

/* --- ENDPOINTS RESTful TAREFAS/CATEGORIAS --- */

app.get('/categorias', async (req, res) => {
    try {
        const snapshot = await db.collection('categorias').orderBy('nome', 'asc').get();
        const categorias = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar categorias' });
    }
});

app.post('/categorias', autenticarToken, async (req, res) => {
    const { nome, cor } = req.body;
    if (!nome || !cor) return res.status(400).json({ erro: 'Nome e Cor são obrigatórios' });

    try {
        const snapshot = await db.collection('categorias').where('nome', '==', nome).get();
        if (!snapshot.empty) return res.status(400).json({ erro: 'Categoria já existe' });

        const docRef = await db.collection('categorias').add({ nome, cor });
        res.status(201).json({ id: docRef.id, nome, cor });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar categoria' });
    }
});

app.delete('/categorias/:id', autenticarToken, async (req, res) => {
    const defaultIds = ['1', '2', '3', '4', '5']; // Firestore IDs são strings
    if (defaultIds.includes(req.params.id)) return res.status(403).json({ erro: 'Categoria de sistema, inalterável.' });

    try {
        await db.collection('categorias').doc(req.params.id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: 'Falha ao deletar categoria' });
    }
});

app.get('/tarefas', autenticarToken, async (req, res) => {
    const status = req.query.status;
    try {
        let query = db.collection('tarefas').where('usuario_id', '==', req.usuarioId);
        
        if (status) {
            query = query.where('status', '==', status);
        }
        
        const snapshot = await query.get();
        const tarefas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Ordenar manualmente (Firestore tem limitações com índices compostos dinâmicos sem configuração prévia)
        tarefas.sort((a, b) => {
            if (a.data_limite < b.data_limite) return -1;
            if (a.data_limite > b.data_limite) return 1;
            return b.criado_em.localeCompare(a.criado_em);
        });

        res.status(200).json(tarefas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar tarefas' });
    }
});

app.get('/estatisticas', autenticarToken, async (req, res) => {
    const hoje = new Date().toISOString().split('T')[0];
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const seteDiasAtrasISO = seteDiasAtras.toISOString().split('T')[0];

    try {
        const snapshot = await db.collection('tarefas').where('usuario_id', '==', req.usuarioId).get();
        const tarefas = snapshot.docs.map(doc => doc.data());

        const total = tarefas.length;
        const concluidasHoje = tarefas.filter(t => t.status === 'concluida' && t.concluido_em && t.concluido_em.startsWith(hoje)).length;
        const atrasadas = tarefas.filter(t => t.status === 'pendente' && t.data_limite && t.data_limite < hoje).length;
        const concluidas7Dias = tarefas.filter(t => t.status === 'concluida' && t.concluido_em && t.concluido_em >= seteDiasAtrasISO).length;

        res.status(200).json({ total, concluidasHoje, atrasadas, concluidas7Dias });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.get('/estatisticas/historico', autenticarToken, async (req, res) => {
    const period = req.query.period || 'daily';

    try {
        const snapshot = await db.collection('tarefas').where('usuario_id', '==', req.usuarioId).get();
        const tarefas = snapshot.docs.map(doc => doc.data());

        let result = [];
        const hoje = new Date();

        if (period === 'monthly') {
            for (let i = 0; i < 12; i++) {
                const dataRef = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
                const mesAno = `${String(dataRef.getMonth() + 1).padStart(2, '0')}/${dataRef.getFullYear()}`;
                
                const registradas = tarefas.filter(t => t.criado_em.startsWith(dataRef.toISOString().slice(0, 7))).length;
                const concluidas = tarefas.filter(t => t.status === 'concluida' && t.concluido_em && t.concluido_em.startsWith(dataRef.toISOString().slice(0, 7))).length;
                
                result.push({ data: mesAno, registradas, concluidas, atrasadas: 0 }); // Simplificado
            }
        } else {
            for (let i = 0; i < 30; i++) {
                const dataRef = new Date();
                dataRef.setDate(hoje.getDate() - i);
                const dataISO = dataRef.toISOString().split('T')[0];

                const registradas = tarefas.filter(t => t.criado_em.startsWith(dataISO)).length;
                const concluidas = tarefas.filter(t => t.status === 'concluida' && t.concluido_em && t.concluido_em.startsWith(dataISO)).length;
                const atrasadas = tarefas.filter(t => t.status === 'pendente' && t.data_limite && t.data_limite < dataISO).length;

                result.push({ data: dataISO, registradas, concluidas, atrasadas });
            }
        }

        res.status(200).json(result.reverse());
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
});

app.post('/tarefas', autenticarToken, async (req, res) => {
    const { titulo, descricao, data_limite, prioridade, categoria_id, tags } = req.body;
    if (!titulo) return res.status(400).json({ erro: 'Título é obrigatório' });

    try {
        const novaTarefa = {
            usuario_id: req.usuarioId,
            titulo,
            descricao: descricao || '',
            data_limite: data_limite || null,
            prioridade: prioridade || 'media',
            categoria_id: categoria_id || '1',
            status: 'pendente',
            criado_em: new Date().toISOString(),
            tags: tags || []
        };

        const docRef = await db.collection('tarefas').add(novaTarefa);
        res.status(201).json({ id: docRef.id, titulo });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar a tarefa' });
    }
});

app.put('/tarefas/:id', autenticarToken, async (req, res) => {
    const id = req.params.id;
    const { titulo, descricao, data_limite, prioridade, status, categoria_id, tags } = req.body;
    
    try {
        const tarefaRef = db.collection('tarefas').doc(id);
        const doc = await tarefaRef.get();
        
        if (!doc.exists || doc.data().usuario_id !== req.usuarioId) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }

        let updateData = {};
        if (titulo !== undefined) updateData.titulo = titulo;
        if (descricao !== undefined) updateData.descricao = descricao;
        if (data_limite !== undefined) updateData.data_limite = data_limite;
        if (prioridade !== undefined) updateData.prioridade = prioridade;
        if (categoria_id !== undefined) updateData.categoria_id = categoria_id;
        if (tags !== undefined) updateData.tags = tags;
        
        if (status !== undefined) {
            updateData.status = status;
            if (status === 'concluida') {
                updateData.concluido_em = new Date().toISOString();
            } else {
                updateData.concluido_em = null;
            }
        }

        await tarefaRef.update(updateData);
        res.status(200).json({ mensagem: 'Tarefa atualizada' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar a tarefa' });
    }
});

app.delete('/tarefas/:id', autenticarToken, async (req, res) => {
    try {
        const tarefaRef = db.collection('tarefas').doc(req.params.id);
        const doc = await tarefaRef.get();
        if (!doc.exists || doc.data().usuario_id !== req.usuarioId) {
            return res.status(404).json({ erro: 'Tarefa não encontrada' });
        }
        await tarefaRef.delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar tarefa' });
    }
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`API Zen Grid Multi-Tag/Perfil rodando na porta ${PORT}`);
    });
}

module.exports = app;
