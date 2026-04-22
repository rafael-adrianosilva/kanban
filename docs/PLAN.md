# Plano de Orquestração: Melhorias de Perfil e Relacionamento de Tarefas

## Objetivos
O General requisitou um aprimoramento no ecossistema Zen Grid com foco nas seguintes frentes:
1. Armazenamento de perfil detalhado (Nome, Email, Avatar).
2. Tarefas categorizadas estaticamente (Trabalho, Pessoal, Estudos, Casa).
3. Sistema Multi-Tag para Tarefas (Relação N:N).
4. Tela de Perfil do Usuário com botão de Sair (Logout).

---

## Passo 1: Backend (Banco de Dados e APIs)
A cargo do especialista de backend e banco de dados.

### Alterações Estruturais (SQLite)
1. **Tabela `usuarios`:** Adicionar colunas `nome` e `foto_avatar`.
2. **Tabela `categorias`:** Remover ligação direta `usuario_id` e usar IDs fixos pré-populados (1-Trabalho, 2-Pessoal, 3-Estudos, 4-Casa) ou garantir seed na criação do usuário.
3. **Tabela `tags`:** Criar tabela para armazenar os textos das tags.
4. **Tabela `tarefa_tags`:** Relacionamento N:N ligando `tarefa_id` a `tag_id`.
5. **Tabela `tarefas`:** Remover o campo texto `tag` antigo.

### Adaptação de Endpoints (RESTful)
- `POST /auth/registro`: Passar a receber `nome` (e avatar opcional).
- `GET /auth/me`: Rota padrão para retornar o perfil completo do usuário autenticado.
- `GET /tarefas`: A query precisa trazer (usando `JOIN` ou subqueries) o array de `tags` vinculadas para cada tarefa.
- `POST/PUT /tarefas`: Lidar com a inserção de um array de strings `tags`. Ex: `["urgente", "cliente x"]` fará o backend verificar se a tag existe, criá-la se não, e lincá-la na tabela N:N.

---

## Passo 2: Frontend (UI/UX e Telas)
A cargo do especialista frontend.

1. **Atualização do Login/Registro:** Formulário de registro agora requisitará Nome.
2. **Tela de Perfil (`Profile.jsx`):** 
   - Renderização da `foto_avatar` e Detalhes Pessoais.
   - Botão de "Sair" com a lógica `localStorage.clear()` vinculada e redirecionamento.
3. **Gerenciador de Tags:** No formulário de "Nova Tarefa" do `GlassDashboard`, o campo "tag" passa de um input simple text para um sistema de badges geráveis por vírgula ou 'Enter' (multi-tags).
4. **TaskCard Visual:** Atualização dos Cartões para renderizar o array das Múltiplas Tags mapeadas com cores do Glassmorphism.

---

## Faseamento
- **Fase 1 (Atual):** Análise e aprovação deste Plano.
- **Fase 2:** Disparo paralelo de agentes. O Backend vai ajustar as rotas (`server.js`) e as tabelas preparadas (`database.js`). Simultaneamente, o Frontend ajustará o layout (`Profile.jsx`, `GlassDashboard.jsx`).
- **Fase 3:** Verificação (`lint_runner.py` / Testes Manuais HTTP).
