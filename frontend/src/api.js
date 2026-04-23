const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : ''; // No Vercel, as rotas serão relativas se usarmos rewrites ou se a API estiver no mesmo domínio

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('zengrid_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.erro || 'Erro na requisição');
  }

  return data;
};

export const register = (nome, email, senha) => apiFetch('/auth/registro', {
  method: 'POST',
  body: JSON.stringify({ nome, email, senha }),
});

export const login = (email, senha) => apiFetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, senha }),
});

export const loginWithGoogle = (token) => apiFetch('/auth/google', {
  method: 'POST',
  body: JSON.stringify({ token }),
});

export const getMe = () => apiFetch('/auth/me');
export const updateAvatar = (foto_avatar) => apiFetch('/auth/me/avatar', { method: 'PUT', body: JSON.stringify({ foto_avatar }) });
export const updateEmail = (email) => apiFetch('/auth/me/email', { method: 'PUT', body: JSON.stringify({ email }) });
export const updateSenha = (senha_atual, nova_senha) => apiFetch('/auth/me/senha', { method: 'PUT', body: JSON.stringify({ senha_atual, nova_senha }) });

export const getCategorias = () => apiFetch('/categorias');
export const addCategoria = (categoria) => apiFetch('/categorias', { method: 'POST', body: JSON.stringify(categoria) });
export const deleteCategoria = (id) => apiFetch(`/categorias/${id}`, { method: 'DELETE' });
export const getEstatisticas = () => apiFetch('/estatisticas');
export const getTarefas = () => apiFetch('/tarefas');
export const addTarefa = (tarefa) => apiFetch('/tarefas', {
  method: 'POST',
  body: JSON.stringify(tarefa) // tarefa.tags expected to be string array
});
export const updateTarefa = (id, updates) => apiFetch(`/tarefas/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updates)
});
export const deleteTarefa = (id) => apiFetch(`/tarefas/${id}`, {
  method: 'DELETE'
});

export const getHistoricoEstatisticas = (period = 'daily') => apiFetch(`/estatisticas/historico?period=${period}`);
