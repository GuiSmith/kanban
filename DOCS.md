# Documentação atual do sistema

## 1. Visão geral

O sistema é uma aplicação Next.js com Pages Router para gerenciamento simples de tarefas. No estado atual, permite criar conta, fazer login, listar tarefas do usuário autenticado, criar tarefas, editar tarefas, excluir tarefas e anexar arquivos a tarefas já existentes.

A aplicação usa PostgreSQL como banco de dados, JWT para autenticação, `localStorage` para armazenar o token no navegador, Material UI para interface, `react-toastify` para mensagens ao usuário e Socket.IO com `LISTEN/NOTIFY` do PostgreSQL para atualizar a tela de tarefas em tempo real.

As principais áreas implementadas são:

- Página inicial vazia em `/`.
- Página simples "Sobre" em `/sobre`.
- Cadastro de usuário em `/usuarios/novo`.
- Login em `/usuarios/login`.
- Logout em `/usuarios/logout`.
- Gestão de tarefas em `/tarefas`.
- Gestão de arquivos dentro do formulário de edição de tarefa.

## 2. Entidades principais

### Entidade: Usuário

- **Onde aparece no código:** tabela `usuario` nas migrations `src/database/migrations/4-create-table-usuario.sql`, `5-create-column-ativo-in-usuario.sql` e `6-create-column-username-in-usuario.sql`; APIs `src/pages/api/usuarios/novo.js`, `src/pages/api/usuarios/login.js`; middleware `src/pages/api/config/middlewares/authMiddleware.js`.
- **Campos principais:**
  - `id`: chave primária serial.
  - `nome`: texto obrigatório, até 255 caracteres.
  - `avatar_public_url`: texto opcional.
  - `email`: texto obrigatório, até 100 caracteres.
  - `senha`: texto obrigatório, até 100 caracteres, armazenado com hash bcrypt.
  - `data_cadastro`: data/hora com timezone, padrão `CURRENT_TIMESTAMP`.
  - `ativo`: booleano, padrão `TRUE`.
  - `username`: texto obrigatório, único, até 15 caracteres.
- **Finalidade:** representa a conta que acessa o sistema e é dona das tarefas.
- **Relações com outras entidades:** um usuário pode ter várias tarefas por meio de `tarefa.id_usuario`.

### Entidade: Tarefa

- **Onde aparece no código:** tabela `tarefa` nas migrations `src/database/migrations/1-create-table-tarefa.sql` e `7-create-column-id-user-in-tarefa.sql`; APIs em `src/pages/api/tarefas`; página `src/pages/tarefas/index.js`; formulário `src/pages/tarefas/TarefaFormulario.js`.
- **Campos principais:**
  - `id`: chave primária serial.
  - `titulo`: texto obrigatório, até 255 caracteres.
  - `descricao`: texto.
  - `data_cadastro`: data/hora com timezone, padrão `CURRENT_TIMESTAMP`.
  - `data_atualizacao`: data/hora com timezone, padrão `CURRENT_TIMESTAMP`.
  - `id_usuario`: inteiro obrigatório, chave estrangeira para `usuario(id)`.
- **Finalidade:** representa uma tarefa cadastrada pelo usuário autenticado.
- **Relações com outras entidades:** pertence a um usuário; pode ter vários arquivos em `tarefa_arquivo`.

### Entidade: Arquivo de tarefa

- **Onde aparece no código:** tabela `tarefa_arquivo` em `src/database/migrations/3-create-table-tarefa-arquivo.sql`; APIs em `src/pages/api/tarefa_arquivos`; componentes `src/pages/tarefas/arquivos/TarefaArquivoFormulario.js` e `src/pages/tarefas/arquivos/TarefaArquivosLista.js`.
- **Campos principais:**
  - `id`: chave primária serial.
  - `id_tarefa`: inteiro, chave estrangeira para `tarefa(id)`.
  - `id_opera`: inteiro, identificador externo retornado pelo serviço Opera.
  - `descricao`: texto obrigatório, até 255 caracteres.
  - `nome`: texto obrigatório, até 255 caracteres.
  - `data_cadastro`: data/hora com timezone, padrão `CURRENT_TIMESTAMP`.
  - `public_url`: texto com caminho público retornado pelo serviço Opera.
- **Finalidade:** registra metadados de arquivos anexados a uma tarefa.
- **Relações com outras entidades:** pertence a uma tarefa por `id_tarefa`.

### Entidade: Migration

- **Onde aparece no código:** criada dinamicamente em `src/database/migrate.js`.
- **Campos principais:**
  - `nome_arquivo`: chave primária, nome da migration aplicada.
- **Finalidade:** controlar quais arquivos SQL já foram executados.
- **Relações com outras entidades:** não possui relação com as entidades de negócio.

## 3. Funcionalidades implementadas

### Cadastro de usuário

- **Rota/página relacionada:** `/usuarios/novo`.
- **Arquivo da página:** `src/pages/usuarios/novo.js`.
- **API usada:** `POST /api/usuarios/novo`.
- **Arquivo da API:** `src/pages/api/usuarios/novo.js`.
- **O que o usuário consegue fazer:** preencher e enviar e-mail, nome, username e senha para criar uma conta.
- **Regras e validações existentes:**
  - No front-end, e-mail, nome, username e senha são obrigatórios.
  - No front-end, e-mail deve passar por regex simples de e-mail.
  - Na API, método diferente de `POST` retorna `405`.
  - A API remove espaços no início/fim de todos os campos e converte e-mail para minúsculo.
  - A API exige todos os campos.
  - A API consulta o tamanho máximo real das colunas da tabela `usuario`.
  - E-mail deve ser válido.
  - Username deve conter apenas letras, números e `_`, conforme regex `^[A-Za-z0-9_]+$`.
  - E-mail não pode existir previamente.
  - Username não pode existir previamente.
  - Senha é salva com bcrypt, usando 10 salt rounds.
- **Possíveis mensagens de erro/sucesso:**
  - `Usuário criado com sucesso`
  - `Método não permitido`
  - `Preencha todos os dados para continuar`
  - `[Campo] deve ter no máximo [n] caracteres`
  - `Informe um e-mail válido.`
  - `Usuário deve ter apenas letras e números`
  - `E-mail já cadastrado.`
  - `Username já cadastrado.`
  - `Erro ao criar usuário. Contate o suporte`
  - No front-end: `Erro ao cadastrar usuário.`
- **Observações técnicas importantes:** o usuário criado retorna no corpo da resposta. Pelo código atual, a API retorna a linha do banco, que inclui `senha` com hash, pois não há remoção desse campo antes da resposta.

### Login

- **Rota/página relacionada:** `/usuarios/login`.
- **Arquivo da página:** `src/pages/usuarios/login.js`.
- **API usada:** `/api/usuarios/login`.
- **Arquivo da API:** `src/pages/api/usuarios/login.js`.
- **O que o usuário consegue fazer:** entrar com username ou e-mail e senha.
- **Regras e validações existentes:**
  - No front-end, login e senha são obrigatórios.
  - A API aceita `login` e `senha` no corpo da requisição.
  - A API busca usuário por `username` e por `email`.
  - Se encontrar ambos ou nenhum, retorna credenciais inválidas.
  - A senha é verificada com bcrypt.
  - Em caso de sucesso, gera JWT com dados do usuário sem o campo `senha`.
  - O token expira em 8 horas.
- **Possíveis mensagens de erro/sucesso:**
  - `Login realizado`
  - `Credenciais inválidas`
  - `Erro inesperado ao realizar login. Contate o suporte`
  - No front-end: `Não foi possível autenticar. Tente novamente.`
  - No front-end: `Erro ao salvar token. Contate o suporte!`
  - No front-end: `Não foi possível realizar login.`
- **Observações técnicas importantes:** a API de login não valida explicitamente o método HTTP. O token é salvo em `localStorage` pela chave `kanban-token`.

### Logout

- **Rota/página relacionada:** `/usuarios/logout`.
- **Arquivo:** `src/pages/usuarios/logout.js`.
- **APIs usadas:** nenhuma.
- **O que o usuário consegue fazer:** sair do sistema.
- **Regras e validações existentes:**
  - Remove `kanban-token` do `localStorage` se estiver no navegador.
  - Redireciona para `/usuarios/login`.
- **Possíveis mensagens de erro/sucesso:** não há toast implementado no logout.
- **Observações técnicas importantes:** o arquivo exporta uma função que executa logout; não renderiza uma tela.

### Controle de acesso às páginas

- **Arquivos relacionados:** `src/utils/hasRouteAccess.js`, `src/pages/_app.js`, `src/components/Navbar.jsx`.
- **O que o sistema faz:** decide quais páginas podem ser acessadas e quais itens aparecem no menu lateral.
- **Regras existentes:**
  - Rotas públicas: `/` e `/sobre`.
  - Rotas de convidado: `/usuarios/login` e `/usuarios/novo`.
  - Usuário logado não acessa rotas de convidado.
  - Usuário não logado não acessa rotas fora das listas pública e convidado.
  - Quando uma rota não é permitida em `_app.js`, o usuário é redirecionado para `/`.
- **Observações técnicas importantes:** a autorização de páginas acontece no cliente, baseada na existência de token no `localStorage`; a validação real das APIs protegidas acontece no backend via JWT.

### Listagem de tarefas

- **Rota/página relacionada:** `/tarefas`.
- **Arquivo da página:** `src/pages/tarefas/index.js`.
- **API usada:** `POST /api/tarefas/listarTarefas` no front-end.
- **Arquivo da API:** `src/pages/api/tarefas/listarTarefas.js`.
- **O que o usuário consegue fazer:** visualizar cards com suas tarefas, mostrando título, descrição, data de cadastro e data de atualização.
- **Regras e validações existentes:**
  - A API exige autenticação via `authMiddleware`.
  - A query filtra por `tarefa.id_usuario = req.user.id`.
  - O retorno é ordenado por `id ASC`.
  - A API não valida método HTTP; o front-end usa `POST`.
- **Possíveis mensagens de erro/sucesso:**
  - API: `Segue tarefas`
  - Front-end: `Erro ao listar tarefas`
  - Tela: `Nenhuma tarefa encontrada.`
- **Observações técnicas importantes:** a página abre uma conexão Socket.IO em `/api/socketio` e entra na sala `tarefas` para receber alterações em tempo real.

### Criação de tarefa

- **Rota/página relacionada:** `/tarefas`, botão `Criar tarefa`.
- **Arquivo do formulário:** `src/pages/tarefas/TarefaFormulario.js`.
- **API usada:** `POST /api/tarefas/criarTarefa`.
- **Arquivo da API:** `src/pages/api/tarefas/criarTarefa.js`.
- **O que o usuário consegue fazer:** criar uma tarefa com título e descrição.
- **Regras e validações existentes:**
  - No front-end, campos `Título` e `Descrição` aparecem como obrigatórios.
  - Na API, `titulo` e `descricao` são obrigatórios.
  - A API exige autenticação.
  - A API adiciona `id_usuario` com o usuário autenticado.
  - A API não valida explicitamente o método HTTP.
- **Possíveis mensagens de erro/sucesso:**
  - API: `Tarefa criada com sucesso`
  - API: `Preencha todos os dados para continuar`
  - Front-end: `Tarefa criada`
  - Front-end: `Erro ao inserir tarefa`
- **Observações técnicas importantes:** o insert é montado por `buildInsert`, que gera `INSERT INTO tarefa (...) VALUES (...) RETURNING *`.

### Edição de tarefa

- **Rota/página relacionada:** `/tarefas`, ao clicar em um card de tarefa.
- **Arquivo do formulário:** `src/pages/tarefas/TarefaFormulario.js`.
- **API usada:** `PUT /api/tarefas/editarTarefa`.
- **Arquivo da API:** `src/pages/api/tarefas/editarTarefa.js`.
- **O que o usuário consegue fazer:** alterar título e descrição de uma tarefa existente.
- **Regras e validações existentes:**
  - `id`, `titulo` e `descricao` são obrigatórios.
  - A API exige autenticação.
  - Antes de atualizar, a API verifica se a tarefa existe e pertence ao usuário autenticado.
  - Atualiza `data_atualizacao` com `CURRENT_TIMESTAMP`.
  - A API não valida explicitamente o método HTTP.
- **Possíveis mensagens de erro/sucesso:**
  - API: `Tarefa atualizada com sucesso`
  - API: `Preencha todos os dados para continuar`
  - API: `Tarefa não encontrada`
  - API: `Tarefa não encontrada!`
  - Front-end: `Tarefa editada`
  - Front-end: `Erro ao editar tarefa`
- **Observações técnicas importantes:** no modo edição aparecem campos desabilitados com as datas de cadastro e atualização.

### Exclusão de tarefa

- **Rota/página relacionada:** `/tarefas`, formulário de edição.
- **Arquivo do formulário:** `src/pages/tarefas/TarefaFormulario.js`.
- **API usada:** `DELETE /api/tarefas/deletarTarefa?id=[id]`.
- **Arquivo da API:** `src/pages/api/tarefas/deletarTarefa.js`.
- **O que o usuário consegue fazer:** excluir uma tarefa depois de confirmar no navegador.
- **Regras e validações existentes:**
  - A API aceita apenas `DELETE`.
  - O parâmetro `id` é obrigatório na query string.
  - A API exige autenticação.
  - A API verifica se a tarefa existe e pertence ao usuário autenticado.
  - Se a tarefa tiver arquivos, a API impede a exclusão.
- **Possíveis mensagens de erro/sucesso:**
  - Confirmação: `Deseja mesmo deletar a tarefa?`
  - API: `Tarefa deletada com sucesso`
  - API: `Método não permitido`
  - API: `Preencha todos os dados para continuar`
  - API: `Tarefa não encontrada`
  - API: `Delete os arquivos antes de deletar as tarefas`
  - Front-end: `Tarefa deletada`
  - Front-end: `Erro ao deletar tarefa`
- **Observações técnicas importantes:** existe relação por foreign key entre `tarefa_arquivo.id_tarefa` e `tarefa.id`, mas a regra de não excluir tarefa com arquivo é implementada manualmente na API.

### Listagem de arquivos da tarefa

- **Rota/página relacionada:** aparece dentro do modal de edição de tarefa em `/tarefas`.
- **Arquivos dos componentes:** `src/pages/tarefas/arquivos/index.js`, `src/pages/tarefas/arquivos/TarefaArquivosLista.js`.
- **API usada:** `GET /api/tarefa_arquivos/listarArquivos?id_tarefa=[id]`.
- **Arquivo da API:** `src/pages/api/tarefa_arquivos/listarArquivos.js`.
- **O que o usuário consegue fazer:** visualizar tabela de arquivos vinculados à tarefa, com descrição, nome, data de cadastro e ações.
- **Regras e validações existentes:**
  - A API aceita apenas `GET`.
  - `id_tarefa` é obrigatório.
  - `id_tarefa` deve ser número inteiro positivo.
  - A API exige autenticação.
  - A API verifica se a tarefa pertence ao usuário autenticado.
  - A API remove `public_url` da resposta e adiciona `src`, montado por `buildImgSrc`.
- **Possíveis mensagens de erro/sucesso:**
  - API: `Segue arquivos`
  - API: `Método não permitido`
  - API: `Informe a tarefa!`
  - API: `Tarefa inválida!`
  - API: `Tarefa não encontrada!`
  - API: `Erro ao buscar tarefas no banco de dados`
  - Front-end: `Erro ao listar arquivos!`
  - Tabela: `Nenhum registro.`
- **Observações técnicas importantes:** os links de abertura e cópia usam o campo `src`, não o `public_url` original.

### Upload de arquivo em tarefa

- **Rota/página relacionada:** aparece dentro do modal de edição de tarefa em `/tarefas`.
- **Arquivo do formulário:** `src/pages/tarefas/arquivos/TarefaArquivoFormulario.js`.
- **API usada:** `POST /api/tarefa_arquivos/inserirArquivo`.
- **Arquivo da API:** `src/pages/api/tarefa_arquivos/inserirArquivo.js`.
- **O que o usuário consegue fazer:** anexar um arquivo com descrição a uma tarefa existente.
- **Regras e validações existentes:**
  - O front-end exige seleção de um arquivo antes de enviar.
  - O front-end envia `descricao`, `arquivo` e `id_tarefa` como `multipart/form-data`.
  - A API exige autenticação.
  - A API desativa o body parser padrão do Next para usar `formidable`.
  - `arquivo`, `descricao` e `id_tarefa` são obrigatórios.
  - Tamanho máximo do arquivo: 22 MB.
  - Extensões permitidas: `pdf`, `jpg`, `png`, `jpeg`.
  - O arquivo é enviado para um serviço externo configurado por `OPERA_LINK`, `OPERA_API_KEY` e `OPERA_FOLDER_ID`.
  - Depois do upload externo, os metadados são salvos em `tarefa_arquivo`.
- **Possíveis mensagens de erro/sucesso:**
  - Front-end: `Insira 1 arquivo`
  - Front-end: `Arquivo inserido`
  - Front-end: `Erro ao inserir arquivo`
  - API: `Nenhum arquivo foi enviado`
  - API: `Informe a descrição do arquivo`
  - API: `Informe a tarefa!`
  - API: `Tarefa não encontrada!`
  - API: `Arquivo deve ter no máximo 22 MB`
  - API: `Extensões permitidas: pdf, jpg, png, jpeg`
  - API: `Erro ao salvar arquivo no banco de dados!`
  - API: `Arquivo registrado`
  - API: `Erro interno ao salvar arquivos`
- **Observações técnicas importantes:** o código tenta consultar a tarefa com `id` e `id_usuario`, mas valida apenas `if (!tarefa)`. Como o objeto de resultado da query existe mesmo quando `rowCount` é zero, essa verificação parece incompleta no estado atual.

### Ações em arquivos

- **Rota/página relacionada:** tabela de arquivos no modal de edição de tarefa.
- **Arquivo:** `src/pages/tarefas/arquivos/TarefaArquivosLista.js`.
- **O que o usuário consegue fazer:**
  - Abrir arquivo em nova aba.
  - Copiar link do arquivo para a área de transferência.
  - Tentar baixar arquivo.
  - Excluir arquivo.
- **Regras e validações existentes:**
  - Abrir usa um link com `target="_blank"` e `rel="noopener noreferrer"`.
  - Copiar exige que exista link.
  - Download não está implementado; exibe uma mensagem informativa.
  - Excluir exige confirmação no navegador.
- **Possíveis mensagens de erro/sucesso:**
  - `Nenhum link para copiar.`
  - `Link copiado.`
  - `Não foi possível copiar.`
  - `Ainda não implementado`
  - `Tem certeza de que deseja deletar este arquivo?`
  - `Deleção cancelada`
  - `Arquivo deletado`
  - `Erro ao deletar arquivo`
- **Observações técnicas importantes:** o toast de erro da exclusão usa `error?.data?.data?.mensagem`, mas o padrão dos outros lugares é `error?.response?.data?.mensagem`; isso pode fazer a mensagem específica da API não aparecer.

### Exclusão de arquivo

- **API usada:** `DELETE /api/tarefa_arquivos/deletarArquivo?id=[id]`.
- **Arquivo da API:** `src/pages/api/tarefa_arquivos/deletarArquivo.js`.
- **O que o usuário consegue fazer:** remover um arquivo vinculado a uma tarefa sua.
- **Regras e validações existentes:**
  - A API aceita apenas `DELETE`.
  - `id` é obrigatório.
  - `id` deve ser número inteiro positivo.
  - A API exige autenticação.
  - A API verifica a propriedade do arquivo por join com `tarefa` e `tarefa.id_usuario`.
  - Se existir `id_opera`, tenta deletar o arquivo no serviço Opera.
  - Mesmo que a exclusão no Opera falhe, o código continua e tenta excluir o registro no banco.
- **Possíveis mensagens de erro/sucesso:**
  - `Arquivo deletado com sucesso`
  - `Método não permitido`
  - `Informe o arquivo!`
  - `Arquivo inválido!`
  - `Arquivo não encontrado!`
  - `Erro ao deletar arquivo no banco de dados!`
  - `Erro interno ao deletar arquivos`
- **Observações técnicas importantes:** erro ao deletar no Opera é apenas logado no servidor.

### Atualização em tempo real de tarefas

- **Arquivos relacionados:** `src/pages/api/socketio.js`, `src/database/migrations/2-create-triggers-tarefa.sql`, `src/pages/tarefas/index.js`.
- **O que o sistema faz:** quando há `INSERT`, `UPDATE` ou `DELETE` na tabela `tarefa`, o PostgreSQL envia notificação no canal `tarefas`. O Socket.IO repassa esse payload para clientes na sala `tarefas`.
- **Regras e validações existentes:**
  - Triggers existem para insert, update e delete.
  - Payload de delete envia apenas `id`.
  - Payload de insert/update envia `id`, `titulo`, `descricao`, `data_cadastro` e `data_atualizacao`.
  - A tela `/tarefas` aplica o evento recebido ao estado local.
- **Possíveis mensagens:** logs no servidor e `console.debug(payload)` no cliente.
- **Observações técnicas importantes:** o canal Socket.IO não filtra por usuário. O payload do trigger também não inclui `id_usuario`. Isso pode fazer uma sessão receber eventos de tarefas de outros usuários e inserir/alterar cards no estado local.

## 4. Casos de uso atuais

### Caso de uso: Criar conta

- **Ator:** visitante não autenticado.
- **Objetivo:** criar uma conta para acessar funcionalidades protegidas.
- **Pré-condições:** acessar `/usuarios/novo`.
- **Fluxo principal:**
  1. Usuário preenche e-mail, nome, username e senha.
  2. Front-end valida obrigatoriedade e formato do e-mail.
  3. Front-end envia `POST /api/usuarios/novo`.
  4. API valida dados, tamanhos, unicidade de e-mail e username.
  5. API salva a senha com bcrypt.
  6. API insere o usuário no banco.
  7. Interface mostra mensagem de sucesso.
- **Fluxos alternativos:** dados faltando, e-mail inválido, username inválido, e-mail duplicado, username duplicado ou erro interno retornam toast de erro.
- **Regras aplicadas:** campos obrigatórios; e-mail minúsculo; username único e alfanumérico com `_`; senha com hash bcrypt.
- **Arquivos envolvidos:** `src/pages/usuarios/novo.js`, `src/pages/api/usuarios/novo.js`, `src/pages/api/utils/encryptPassword.js`, `src/pages/api/utils/getTableColumns.js`, `src/pages/api/utils/buildInsert.js`.

### Caso de uso: Fazer login

- **Ator:** usuário cadastrado.
- **Objetivo:** obter acesso autenticado ao sistema.
- **Pré-condições:** existir usuário no banco com senha válida.
- **Fluxo principal:**
  1. Usuário acessa `/usuarios/login`.
  2. Informa username ou e-mail e senha.
  3. Front-end envia requisição para `/api/usuarios/login`.
  4. API busca usuário por username e e-mail.
  5. API valida a senha com bcrypt.
  6. API gera JWT com expiração de 8 horas.
  7. Front-end salva o token em `localStorage`.
  8. Usuário é redirecionado para `redirectUrl` ou `/tarefas`.
- **Fluxos alternativos:** login vazio, senha vazia, usuário não encontrado, conflito de busca ou senha incorreta retornam `Credenciais inválidas`.
- **Regras aplicadas:** token JWT; senha não entra no payload do token; token salvo como `kanban-token`.
- **Arquivos envolvidos:** `src/pages/usuarios/login.js`, `src/pages/api/usuarios/login.js`, `src/pages/api/utils/verifyPassword.js`, `src/utils/setToken.js`.

### Caso de uso: Sair do sistema

- **Ator:** usuário autenticado.
- **Objetivo:** remover a autenticação local.
- **Pré-condições:** estar logado e acessar `/usuarios/logout` pelo menu.
- **Fluxo principal:**
  1. O código remove `kanban-token` do `localStorage`.
  2. Redireciona para `/usuarios/login`.
- **Fluxos alternativos:** não há tratamento visual específico.
- **Regras aplicadas:** remoção local do token.
- **Arquivos envolvidos:** `src/pages/usuarios/logout.js`, `src/components/Navbar.jsx`.

### Caso de uso: Listar tarefas

- **Ator:** usuário autenticado.
- **Objetivo:** visualizar suas tarefas.
- **Pré-condições:** possuir token salvo em `localStorage`.
- **Fluxo principal:**
  1. Usuário acessa `/tarefas`.
  2. Página abre socket em `/api/socketio`.
  3. Página chama `/api/tarefas/listarTarefas` com header `authorization`.
  4. API valida o token e busca tarefas do usuário.
  5. Tela exibe cards ou mensagem de lista vazia.
- **Fluxos alternativos:** token ausente ou inválido bloqueia a API; erro de listagem mostra toast.
- **Regras aplicadas:** filtro por `id_usuario`; ordenação por `id ASC`.
- **Arquivos envolvidos:** `src/pages/tarefas/index.js`, `src/pages/api/tarefas/listarTarefas.js`, `src/utils/authAxios.js`, `src/pages/api/config/middlewares/authMiddleware.js`.

### Caso de uso: Criar tarefa

- **Ator:** usuário autenticado.
- **Objetivo:** registrar uma nova tarefa.
- **Pré-condições:** estar em `/tarefas` com token válido.
- **Fluxo principal:**
  1. Usuário clica em `Criar tarefa`.
  2. Modal abre formulário em modo `create`.
  3. Usuário informa título e descrição.
  4. Front-end chama `POST /api/tarefas/criarTarefa`.
  5. API valida campos obrigatórios.
  6. API associa a tarefa ao usuário autenticado.
  7. API insere no banco.
  8. Modal fecha e toast de sucesso aparece.
- **Fluxos alternativos:** campos faltando ou erro interno exibem toast de erro.
- **Regras aplicadas:** `titulo` e `descricao` obrigatórios; `id_usuario` vem do token.
- **Arquivos envolvidos:** `src/pages/tarefas/index.js`, `src/pages/tarefas/TarefaFormulario.js`, `src/pages/api/tarefas/criarTarefa.js`.

### Caso de uso: Editar tarefa

- **Ator:** usuário autenticado.
- **Objetivo:** atualizar título ou descrição de uma tarefa própria.
- **Pré-condições:** existir tarefa do usuário.
- **Fluxo principal:**
  1. Usuário clica em um card.
  2. Modal abre em modo `edit`.
  3. Usuário altera título e/ou descrição.
  4. Front-end chama `PUT /api/tarefas/editarTarefa`.
  5. API verifica campos e propriedade da tarefa.
  6. API atualiza título, descrição e `data_atualizacao`.
  7. Modal fecha e toast de sucesso aparece.
- **Fluxos alternativos:** tarefa sem id, título ou descrição; tarefa inexistente; tarefa de outro usuário; erro interno.
- **Regras aplicadas:** somente dono da tarefa pode editar; `data_atualizacao` atualizada no SQL.
- **Arquivos envolvidos:** `src/pages/tarefas/TarefaFormulario.js`, `src/pages/api/tarefas/editarTarefa.js`.

### Caso de uso: Excluir tarefa

- **Ator:** usuário autenticado.
- **Objetivo:** remover uma tarefa própria.
- **Pré-condições:** tarefa existir, pertencer ao usuário e não possuir arquivos.
- **Fluxo principal:**
  1. Usuário abre a tarefa em modo edição.
  2. Clica em `Deletar`.
  3. Confirma a exclusão.
  4. Front-end chama `DELETE /api/tarefas/deletarTarefa?id=[id]`.
  5. API valida propriedade da tarefa.
  6. API verifica se não há arquivos vinculados.
  7. API remove a tarefa.
  8. Modal fecha e toast de sucesso aparece.
- **Fluxos alternativos:** cancelamento pelo usuário; tarefa com arquivos; tarefa inexistente; método incorreto.
- **Regras aplicadas:** arquivos devem ser deletados antes da tarefa.
- **Arquivos envolvidos:** `src/pages/tarefas/TarefaFormulario.js`, `src/pages/api/tarefas/deletarTarefa.js`.

### Caso de uso: Anexar arquivo à tarefa

- **Ator:** usuário autenticado.
- **Objetivo:** salvar arquivo relacionado a uma tarefa.
- **Pré-condições:** tarefa já existir e estar aberta em modo edição.
- **Fluxo principal:**
  1. Usuário informa descrição.
  2. Seleciona um arquivo.
  3. Clica em `Enviar`.
  4. Front-end monta `FormData`.
  5. API valida dados, tamanho e extensão.
  6. API envia o arquivo ao serviço Opera.
  7. API salva metadados no banco.
  8. Interface adiciona o novo arquivo na tabela.
- **Fluxos alternativos:** sem arquivo, sem descrição, sem tarefa, arquivo grande, extensão não permitida, falha no serviço externo ou banco.
- **Regras aplicadas:** máximo 22 MB; extensões `pdf`, `jpg`, `png`, `jpeg`; metadados em `tarefa_arquivo`.
- **Arquivos envolvidos:** `src/pages/tarefas/arquivos/TarefaArquivoFormulario.js`, `src/pages/api/tarefa_arquivos/inserirArquivo.js`, `src/pages/api/utils/parseForm.js`, `src/pages/api/utils/readFileAsync.js`, `src/pages/api/utils/maxSize.js`, `src/pages/api/utils/buildImgSrc.js`.

### Caso de uso: Consultar arquivos de uma tarefa

- **Ator:** usuário autenticado.
- **Objetivo:** visualizar arquivos anexados a uma tarefa própria.
- **Pré-condições:** abrir tarefa em modo edição.
- **Fluxo principal:**
  1. Componente de arquivos recebe `tarefa.id`.
  2. Chama `GET /api/tarefa_arquivos/listarArquivos?id_tarefa=[id]`.
  3. API valida token e propriedade da tarefa.
  4. API busca arquivos.
  5. API monta `src` público para cada arquivo.
  6. Tabela renderiza os registros.
- **Fluxos alternativos:** tarefa ausente, inválida ou não encontrada retorna erro.
- **Regras aplicadas:** somente arquivos de tarefa própria devem ser listados.
- **Arquivos envolvidos:** `src/pages/tarefas/arquivos/index.js`, `src/pages/tarefas/arquivos/TarefaArquivosLista.js`, `src/pages/api/tarefa_arquivos/listarArquivos.js`.

### Caso de uso: Excluir arquivo

- **Ator:** usuário autenticado.
- **Objetivo:** remover arquivo de uma tarefa própria.
- **Pré-condições:** arquivo existir e estar vinculado a uma tarefa do usuário.
- **Fluxo principal:**
  1. Usuário clica no ícone de excluir na tabela.
  2. Confirma a exclusão.
  3. Front-end chama `DELETE /api/tarefa_arquivos/deletarArquivo?id=[id]`.
  4. API valida token, id e propriedade.
  5. API tenta deletar o arquivo no Opera.
  6. API remove o registro do banco.
  7. Front-end remove o item da tabela.
- **Fluxos alternativos:** cancelamento, id inválido, arquivo não encontrado, erro no banco.
- **Regras aplicadas:** propriedade verificada por join entre `tarefa_arquivo` e `tarefa`.
- **Arquivos envolvidos:** `src/pages/tarefas/arquivos/TarefaArquivosLista.js`, `src/pages/api/tarefa_arquivos/deletarArquivo.js`.

## 5. Fluxos importantes

### Cadastro de usuário

1. Usuário acessa `/usuarios/novo`.
2. Preenche e-mail, nome, username e senha.
3. O front-end valida obrigatoriedade e formato de e-mail.
4. A página envia `POST /api/usuarios/novo`.
5. A API normaliza os campos, valida obrigatoriedade e tamanho máximo de acordo com o banco.
6. A API valida e-mail e username.
7. A API verifica se e-mail e username já existem.
8. A senha é criptografada com bcrypt.
9. O usuário é inserido no banco.
10. A tela mostra `Usuário criado com sucesso`.

### Login

1. Usuário acessa `/usuarios/login`.
2. Preenche `Usuário ou E-mail` e `Senha`.
3. O front-end envia os dados para `/api/usuarios/login`.
4. A API procura por username e por e-mail.
5. A API exige que exatamente uma busca encontre usuário.
6. A API compara senha informada com hash salvo.
7. A API gera JWT com expiração de 8 horas.
8. O front-end salva o token em `localStorage` com chave `kanban-token`.
9. O usuário é redirecionado para `redirectUrl` ou `/tarefas`.

### Criação de tarefa

1. Usuário logado acessa `/tarefas`.
2. Clica em `Criar tarefa`.
3. Informa título e descrição.
4. O front-end chama `POST /api/tarefas/criarTarefa`.
5. A API valida token, título e descrição.
6. A API adiciona `id_usuario`.
7. A API insere a tarefa.
8. O banco dispara trigger de notificação.
9. O socket repassa o evento para clientes conectados à sala `tarefas`.

### Listagem de tarefas

1. Usuário acessa `/tarefas`.
2. A página inicia loading.
3. A página chama `/api/tarefas/listarTarefas` usando `authAxios`.
4. `authAxios` envia o token no header `authorization`.
5. A API valida o JWT e busca tarefas do usuário.
6. A página renderiza cards ou `Nenhuma tarefa encontrada.`

### Edição de tarefa

1. Usuário clica em um card de tarefa.
2. O modal abre com os dados iniciais da tarefa.
3. Usuário altera título e/ou descrição.
4. O front-end chama `PUT /api/tarefas/editarTarefa`.
5. A API valida token, campos obrigatórios e propriedade.
6. A API atualiza tarefa e `data_atualizacao`.
7. A interface mostra `Tarefa editada` e fecha o modal.

### Exclusão de tarefa

1. Usuário abre uma tarefa.
2. Clica em `Deletar`.
3. Confirma no `confirm`.
4. A API verifica método `DELETE`, token, id e propriedade.
5. A API bloqueia exclusão se houver arquivos.
6. Sem arquivos, a tarefa é deletada.
7. A interface mostra `Tarefa deletada`.

### Upload de arquivo

1. Usuário abre uma tarefa existente.
2. A seção `Arquivos` é exibida.
3. Usuário preenche descrição e seleciona arquivo.
4. Front-end envia `multipart/form-data` para `/api/tarefa_arquivos/inserirArquivo`.
5. API usa `formidable` para ler campos e arquivo temporário.
6. API valida arquivo, descrição, tarefa, tamanho e extensão.
7. API lê o arquivo em buffer.
8. API envia o buffer para o serviço Opera.
9. API grava metadados na tabela `tarefa_arquivo`.
10. API retorna dados do arquivo com `src`.
11. Front-end adiciona o arquivo à lista.

### Abertura e cópia de link de arquivo

1. Na tabela de arquivos, o usuário clica no ícone de abrir.
2. O navegador abre o `src` em nova aba.
3. Para copiar, usuário clica no ícone de cópia.
4. O código usa `navigator.clipboard.writeText(src)`.
5. Exibe `Link copiado.` ou `Não foi possível copiar.`

## 6. Regras de autenticação e autorização

### Como o login funciona

O login é feito pela API `src/pages/api/usuarios/login.js`. A API recebe `login` e `senha`, busca o usuário por `username` e por `email`, valida a senha com bcrypt e gera um JWT usando `process.env.JWT_SECRET`. O token expira em 8 horas.

### Onde o token é salvo/lido

- O token é salvo em `localStorage` pela função `src/utils/setToken.js`.
- A chave usada é `kanban-token`.
- O token é lido por `src/utils/getToken.js`.
- Requisições autenticadas usam `src/utils/authAxios.js`, que envia o token no header `authorization`.

### Quais rotas são públicas

Conforme `src/utils/hasRouteAccess.js`, são públicas:

- `/`
- `/sobre`

### Quais rotas são de visitante

Conforme `src/utils/hasRouteAccess.js`, são rotas para usuário não logado:

- `/usuarios/login`
- `/usuarios/novo`

Usuário logado não tem acesso a essas rotas pelo controle de página do cliente.

### Quais rotas exigem login

Qualquer rota que não esteja em `public` nem em `guest` exige token no cliente. No código atual, isso inclui:

- `/tarefas`
- `/usuarios/logout`

### Como as APIs validam o usuário

As APIs protegidas usam `authMiddleware`, localizado em `src/pages/api/config/middlewares/authMiddleware.js`.

O middleware:

1. Lê `req.headers.authorization`.
2. Retorna `401` com `Não autorizado` se não houver token.
3. Verifica o JWT com `process.env.JWT_SECRET`.
4. Busca o usuário por `id` no banco.
5. Retorna `401` se não encontrar exatamente um usuário.
6. Retorna `401` se `usuario.ativo !== true`.
7. Define `req.user` com a linha do usuário.
8. Chama o handler protegido.

### APIs protegidas

- `/api/tarefas/listarTarefas`
- `/api/tarefas/criarTarefa`
- `/api/tarefas/editarTarefa`
- `/api/tarefas/deletarTarefa`
- `/api/tarefa_arquivos/listarArquivos`
- `/api/tarefa_arquivos/inserirArquivo`
- `/api/tarefa_arquivos/deletarArquivo`

### APIs públicas ou sem middleware de autenticação

- `/api/usuarios/novo`
- `/api/usuarios/login`
- `/api/hello`
- `/api/socketio`

### Limitações atuais de segurança

- O token é salvo em `localStorage`, ficando acessível a JavaScript no navegador.
- O controle de acesso das páginas é feito no cliente e depende apenas da existência do token, não da validade dele.
- `authAxios` tenta redirecionar para `/login?redirectUrl=...`, mas a rota real de login é `/usuarios/login`.
- A API de login não valida explicitamente o método HTTP.
- Algumas APIs de tarefas não validam explicitamente o método HTTP.
- O Socket.IO de tarefas não filtra eventos por usuário, podendo propagar eventos de tarefas entre sessões diferentes.
- O trigger de tarefa não inclui `id_usuario`, então o cliente não consegue filtrar corretamente eventos recebidos por usuário.
- O upload de arquivo consulta se a tarefa pertence ao usuário, mas a checagem atual parece incompleta porque não testa `rowCount`.
- A criação de usuário retorna a linha do usuário incluindo o hash da senha, conforme o código atual.

## 7. Estrutura das rotas

### Páginas

- **Rota:** `/`
  - **Arquivo:** `src/pages/index.js`
  - **Finalidade:** página inicial. Atualmente renderiza um `<main>` vazio.

- **Rota:** `/sobre`
  - **Arquivo:** `src/pages/sobre/index.js`
  - **Finalidade:** página simples com título `Sobre`.

- **Rota:** `/tarefas`
  - **Arquivo:** `src/pages/tarefas/index.js`
  - **Finalidade:** listar tarefas, abrir modal de criação/edição e iniciar socket de atualização.

- **Rota:** `/usuarios/novo`
  - **Arquivo:** `src/pages/usuarios/novo.js`
  - **Finalidade:** formulário de cadastro de usuário.

- **Rota:** `/usuarios/login`
  - **Arquivo:** `src/pages/usuarios/login.js`
  - **Finalidade:** formulário de login.

- **Rota:** `/usuarios/logout`
  - **Arquivo:** `src/pages/usuarios/logout.js`
  - **Finalidade:** remove token e redireciona para login. Não renderiza tela própria.

### APIs

- **Método HTTP:** não validado explicitamente no código.
  - **Endpoint:** `/api/hello`
  - **Arquivo:** `src/pages/api/hello.js`
  - **Payload esperado:** nenhum.
  - **Resposta esperada:** `{ mensagem: "The API os ok :)" }` se conectar ao banco.
  - **Validações:** tenta `db.connect()`.

- **Método HTTP:** inicialização via rota API do Next.
  - **Endpoint:** `/api/socketio`
  - **Arquivo:** `src/pages/api/socketio.js`
  - **Payload esperado:** nenhum para inicialização; eventos `join_tarefas` e `leave_tarefas` no socket.
  - **Resposta esperada:** encerra a resposta HTTP e mantém servidor Socket.IO.
  - **Validações:** não exige autenticação.

- **Método HTTP:** não validado explicitamente.
  - **Endpoint:** `/api/usuarios/login`
  - **Arquivo:** `src/pages/api/usuarios/login.js`
  - **Payload esperado:** `{ login, senha }`.
  - **Resposta esperada:** `{ mensagem: "Login realizado", data: token }`.
  - **Validações:** login e senha obrigatórios; busca por username/e-mail; senha bcrypt.

- **Método HTTP:** `POST`.
  - **Endpoint:** `/api/usuarios/novo`
  - **Arquivo:** `src/pages/api/usuarios/novo.js`
  - **Payload esperado:** `{ email, nome, username, senha }`.
  - **Resposta esperada:** `{ mensagem: "Usuário criado com sucesso", data: user }`.
  - **Validações:** método, obrigatoriedade, tamanho máximo por coluna, e-mail, username, duplicidade, hash de senha.

- **Método HTTP:** não validado explicitamente; front-end usa `POST`.
  - **Endpoint:** `/api/tarefas/listarTarefas`
  - **Arquivo:** `src/pages/api/tarefas/listarTarefas.js`
  - **Payload esperado:** nenhum.
  - **Resposta esperada:** `{ mensagem: "Segue tarefas", data: tarefas }`.
  - **Validações:** autenticação; filtro por usuário.

- **Método HTTP:** não validado explicitamente; front-end usa `POST`.
  - **Endpoint:** `/api/tarefas/criarTarefa`
  - **Arquivo:** `src/pages/api/tarefas/criarTarefa.js`
  - **Payload esperado:** `{ titulo, descricao }`.
  - **Resposta esperada:** `{ mensagem: "Tarefa criada com sucesso", data: tarefa }`.
  - **Validações:** autenticação; título e descrição obrigatórios; associação ao usuário autenticado.

- **Método HTTP:** não validado explicitamente; front-end usa `PUT`.
  - **Endpoint:** `/api/tarefas/editarTarefa`
  - **Arquivo:** `src/pages/api/tarefas/editarTarefa.js`
  - **Payload esperado:** `{ id, titulo, descricao }`.
  - **Resposta esperada:** `{ mensagem: "Tarefa atualizada com sucesso", data: tarefa }`.
  - **Validações:** autenticação; campos obrigatórios; tarefa deve pertencer ao usuário.

- **Método HTTP:** `DELETE`.
  - **Endpoint:** `/api/tarefas/deletarTarefa?id=[id]`
  - **Arquivo:** `src/pages/api/tarefas/deletarTarefa.js`
  - **Payload esperado:** query string com `id`.
  - **Resposta esperada:** `{ mensagem: "Tarefa deletada com sucesso", data: tarefa }`.
  - **Validações:** método; autenticação; id obrigatório; tarefa deve pertencer ao usuário; tarefa não pode ter arquivos.

- **Método HTTP:** `GET`.
  - **Endpoint:** `/api/tarefa_arquivos/listarArquivos?id_tarefa=[id]`
  - **Arquivo:** `src/pages/api/tarefa_arquivos/listarArquivos.js`
  - **Payload esperado:** query string com `id_tarefa`.
  - **Resposta esperada:** `{ mensagem: "Segue arquivos", data: arquivos }`.
  - **Validações:** método; autenticação; tarefa obrigatória; id inteiro positivo; tarefa deve pertencer ao usuário.

- **Método HTTP:** não validado explicitamente; front-end usa `POST`.
  - **Endpoint:** `/api/tarefa_arquivos/inserirArquivo`
  - **Arquivo:** `src/pages/api/tarefa_arquivos/inserirArquivo.js`
  - **Payload esperado:** `multipart/form-data` com `descricao`, `arquivo`, `id_tarefa`.
  - **Resposta esperada:** `{ mensagem: "Arquivo registrado", data: arquivo }`.
  - **Validações:** autenticação; arquivo obrigatório; descrição obrigatória; tarefa obrigatória; tamanho máximo 22 MB; extensão permitida.

- **Método HTTP:** `DELETE`.
  - **Endpoint:** `/api/tarefa_arquivos/deletarArquivo?id=[id]`
  - **Arquivo:** `src/pages/api/tarefa_arquivos/deletarArquivo.js`
  - **Payload esperado:** query string com `id`.
  - **Resposta esperada:** `{ mensagem: "Arquivo deletado com sucesso", data: arquivo }`.
  - **Validações:** método; autenticação; id obrigatório; id inteiro positivo; arquivo deve pertencer a tarefa do usuário.

## 8. Banco de dados

### Tabela: `usuario`

- **Criada em:** `src/database/migrations/4-create-table-usuario.sql`.
- **Alterada em:** `5-create-column-ativo-in-usuario.sql`, `6-create-column-username-in-usuario.sql`.
- **Campos:**
  - `id SERIAL PRIMARY KEY`
  - `nome VARCHAR(255) NOT NULL`
  - `avatar_public_url TEXT`
  - `email VARCHAR(100) NOT NULL`
  - `senha VARCHAR(100) NOT NULL`
  - `data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`
  - `ativo BOOLEAN DEFAULT TRUE`
  - `username VARCHAR(15) UNIQUE NOT NULL`
- **Relacionamentos:** referenciada por `tarefa.id_usuario`.
- **Regras automáticas:** `data_cadastro` preenchida automaticamente; `ativo` padrão `TRUE`; `username` único.

### Tabela: `tarefa`

- **Criada em:** `src/database/migrations/1-create-table-tarefa.sql`.
- **Alterada em:** `src/database/migrations/7-create-column-id-user-in-tarefa.sql`.
- **Campos:**
  - `id SERIAL PRIMARY KEY`
  - `titulo VARCHAR(255) NOT NULL`
  - `descricao TEXT`
  - `data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`
  - `data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`
  - `id_usuario INT NOT NULL REFERENCES usuario(id)`
- **Relacionamentos:** pertence a `usuario`; referenciada por `tarefa_arquivo.id_tarefa`.
- **Regras automáticas:** datas com padrão `CURRENT_TIMESTAMP`; triggers de notificação para insert/update/delete.

### Tabela: `tarefa_arquivo`

- **Criada em:** `src/database/migrations/3-create-table-tarefa-arquivo.sql`.
- **Campos:**
  - `id SERIAL PRIMARY KEY`
  - `id_tarefa INT REFERENCES tarefa(id)`
  - `id_opera INT`
  - `descricao VARCHAR(255) NOT NULL`
  - `nome VARCHAR(255) NOT NULL`
  - `data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP`
  - `public_url TEXT`
- **Relacionamentos:** pertence a `tarefa`.
- **Regras automáticas:** `data_cadastro` preenchida automaticamente.

### Tabela: `migrations`

- **Criada em:** `src/database/migrate.js`.
- **Campos:**
  - `nome_arquivo VARCHAR(200) PRIMARY KEY`
- **Finalidade:** registrar migrations já executadas.

### Triggers e funções

- **Função:** `notify_tarefa_changes()`
  - **Arquivo:** `src/database/migrations/2-create-triggers-tarefa.sql`.
  - **Comportamento:** monta payload JSON e executa `pg_notify('tarefas', payload::text)`.

- **Trigger:** `trg_tarefa_insert_notify`
  - **Evento:** `AFTER INSERT ON tarefa`.
  - **Ação:** chama `notify_tarefa_changes()`.

- **Trigger:** `trg_tarefa_update_notify`
  - **Evento:** `AFTER UPDATE ON tarefa`.
  - **Ação:** chama `notify_tarefa_changes()`.

- **Trigger:** `trg_tarefa_delete_notify`
  - **Evento:** `AFTER DELETE ON tarefa`.
  - **Ação:** chama `notify_tarefa_changes()`.

### Regras automáticas do banco

- `usuario.data_cadastro`, `tarefa.data_cadastro`, `tarefa.data_atualizacao` e `tarefa_arquivo.data_cadastro` recebem `CURRENT_TIMESTAMP` por padrão.
- `usuario.username` é único.
- `tarefa.id_usuario` exige usuário existente.
- `tarefa_arquivo.id_tarefa` exige tarefa existente.
- Alterações em `tarefa` disparam notificações PostgreSQL no canal `tarefas`.

## 9. Pontos de atenção

- A página inicial `/` está vazia, apesar de existir no menu como `Início`.
- A página `/sobre` contém apenas o título `Sobre`.
- O botão `Copiar` da tarefa em modo edição não copia a tarefa; exibe `Ainda não implementado`.
- O botão de download de arquivo não baixa o arquivo; exibe `Ainda não implementado`.
- A API de login não restringe método HTTP.
- As APIs `listarTarefas`, `criarTarefa`, `editarTarefa` e `inserirArquivo` não restringem explicitamente método HTTP.
- `authAxios` redireciona para `/login`, mas a rota implementada é `/usuarios/login`.
- `authAxios` envolve apenas a criação da promise do axios em `try/catch`; erros assíncronos normalmente são tratados pelos componentes que fazem `await`.
- O controle de acesso de páginas é feito no cliente e não valida a expiração do token antes de permitir renderização.
- O cadastro de usuário retorna o objeto de usuário vindo do banco, incluindo o hash da senha no estado atual do código.
- A criação de usuário valida username com regex que permite `_`, mas a mensagem diz `Usuário deve ter apenas letras e números`.
- A migration `6-create-column-username-in-usuario.sql` adiciona coluna `username VARCHAR(15) UNIQUE NOT NULL`; em bancos com usuários existentes, isso pode exigir tratamento manual.
- A API de upload de arquivo parece ter verificação incompleta de propriedade da tarefa, pois testa `if (!tarefa)` em vez de `rowCount`.
- A checagem de extensão de upload é case-sensitive; `JPG` ou `PDF` em maiúsculo não entram na lista permitida.
- O Socket.IO de tarefas é global e não separa eventos por usuário; isso pode fazer clientes receberem tarefas de outros usuários em tempo real.
- O payload do trigger de tarefa não inclui `id_usuario`, impossibilitando filtro por usuário no cliente com os dados atuais.
- As triggers notificam apenas mudanças em tarefas, não em arquivos.
- `tarefa_arquivo.id_tarefa` aceita `NULL` no schema, embora o fluxo da API exija tarefa.
- `tarefa.descricao` permite `NULL` no schema, mas as APIs de criação/edição exigem descrição.
- A exclusão de tarefa é bloqueada se houver arquivos, mas não há cascade no banco.
- Erro ao deletar arquivo no Opera não impede a exclusão do registro no banco.
- Em `TarefaArquivosLista.js`, o tratamento de erro de exclusão usa um caminho diferente do padrão do Axios, podendo ocultar mensagens específicas da API.
- O componente `Footer` existe, mas não é usado em `_app.js`.
- Existe `isLoading` em `_app.js`, mas não há código alterando esse estado.
- `src/pages/api/hello.js` mantém uma conexão obtida com `db.connect()` sem liberar explicitamente o client.

## 10. Texto sugerido para a tela de Documentação

### O que é o sistema

Este sistema permite cadastrar uma conta, entrar com usuário ou e-mail e gerenciar tarefas pessoais. Depois do login, você pode criar tarefas, editar informações, excluir tarefas e anexar arquivos a cada tarefa.

### Conta e acesso

Para usar as tarefas, é necessário ter uma conta. No cadastro, informe e-mail, nome, username e senha. O e-mail precisa ter formato válido, e o username deve ser único.

Na tela de login, você pode entrar usando seu username ou seu e-mail junto com a senha. Após o login, o sistema salva sua sessão no navegador por meio de um token. Ao sair, esse token é removido e você volta para a tela de login.

### Tarefas

Na tela `Tarefas`, o sistema mostra as tarefas vinculadas ao usuário logado. Cada tarefa aparece como um card com título, descrição, data de cadastro e data de atualização.

Para criar uma tarefa, clique em `Criar tarefa`, informe título e descrição e confirme. Para editar, clique no card da tarefa, altere os campos desejados e clique em `Salvar`.

Para excluir uma tarefa, abra a tarefa e clique em `Deletar`. O sistema pedirá confirmação. Uma tarefa só pode ser excluída se não possuir arquivos anexados; nesse caso, exclua os arquivos antes.

### Arquivos da tarefa

Arquivos aparecem dentro da tela de edição de uma tarefa. Para anexar um arquivo, informe uma descrição, selecione o arquivo e clique em `Enviar`.

Arquivos aceitos atualmente:

- `pdf`
- `jpg`
- `png`
- `jpeg`

O tamanho máximo permitido é de 22 MB.

Na lista de arquivos, você pode abrir o arquivo em uma nova aba, copiar o link ou excluir o arquivo. A opção de download aparece na interface, mas ainda não está implementada no código atual.

### Atualização em tempo real

A tela de tarefas recebe atualizações em tempo real quando tarefas são criadas, editadas ou excluídas. Esse comportamento é implementado com Socket.IO e notificações do PostgreSQL.

### Mensagens comuns

- `Tarefa criada`: a tarefa foi salva.
- `Tarefa editada`: as alterações foram salvas.
- `Tarefa deletada`: a tarefa foi removida.
- `Arquivo inserido`: o arquivo foi anexado à tarefa.
- `Arquivo deletado`: o arquivo foi removido.
- `Preencha todos os dados para continuar`: há campos obrigatórios faltando.
- `Tarefa não encontrada`: a tarefa não existe ou não pertence ao usuário logado.
- `Delete os arquivos antes de deletar as tarefas`: a tarefa ainda possui anexos.
- `Credenciais inválidas`: login ou senha não conferem.

### Limitações atuais visíveis para o usuário

A página inicial ainda não possui conteúdo. A página `Sobre` possui apenas o título. A ação de copiar tarefa e a ação de baixar arquivo ainda exibem mensagem de funcionalidade não implementada.
