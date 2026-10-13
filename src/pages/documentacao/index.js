import Head from "next/head";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoginIcon from "@mui/icons-material/Login";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PaletteIcon from "@mui/icons-material/Palette";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SyncIcon from "@mui/icons-material/Sync";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WorkspacesIcon from "@mui/icons-material/Workspaces";

const acceptedExtensions = ["pdf", "jpg", "png", "jpeg"];
const acceptedProfileImageExtensions = ["png", "jpg", "jpeg", "webp"];

const messages = [
  "Espaço criado",
  "Espaço editado",
  "Perfil editado",
  "Imagem atualizada com sucesso",
  "Convite criado",
  "Convite cancelado",
  "Convite respondido com sucesso",
  "Permissões alteradas com sucesso!",
  "Tarefa criada com sucesso",
  "Tarefa atualizada com sucesso",
  "Coluna criada com sucesso",
  "Coluna atualizada com sucesso",
  "Tarefa deletada com sucesso",
  "Mova as tarefas desta coluna antes de desativá-la",
  "Responsável é obrigatório conforme regras do espaço",
  "Arquivo registrado",
  "Arquivo deletado com sucesso",
  "Link copiado.",
  "Preencha todos os dados para continuar",
  "Espaço não encontrado!",
  "Tarefa não encontrada",
  "Delete os arquivos antes de deletar as tarefas",
  "Credenciais inválidas",
  "Sessão expirada. Por favor, faça login novamente.",
];

const SectionTitle = ({ icon, title }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    {icon}
    <Typography component="h2" variant="h6">
      {title}
    </Typography>
  </Stack>
);

const BulletList = ({ items }) => (
  <Box component="ul" sx={{ pl: 3, my: 1 }}>
    {items.map((item) => (
      <Typography component="li" variant="body1" key={item} sx={{ mb: 0.75 }}>
        {item}
      </Typography>
    ))}
  </Box>
);

export default function DocumentacaoPage() {
  return (
    <>
      <Head>
        <title>Documentação</title>
        <meta name="description" content="Documentação de uso do sistema" />
      </Head>

      <Container maxWidth="md" component="main" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
              <MenuBookIcon color="primary" fontSize="large" />
              <Typography component="h1" variant="h3">
                Documentação
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Guia rápido para entender as principais telas e ações disponíveis no sistema.
            </Typography>
          </Box>

          <Alert severity="info">
            Esta página descreve apenas funcionalidades que já existem no sistema atualmente.
          </Alert>

          <Card>
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
              <Stack spacing={1.5}>
                <SectionTitle icon={<MenuBookIcon color="primary" />} title="Introdução" />
                <Typography variant="body1">
                  O sistema permite criar uma conta, fazer login, organizar tarefas por espaços, anexar arquivos às
                  tarefas já cadastradas e gerenciar usuários e convites do espaço. Depois de entrar, você acessa a área
                  de espaços para consultar suas abas e a Dashboard para acompanhar as tarefas sob sua responsabilidade.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={1.5}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<PersonAddIcon color="primary" />} title="Criar conta" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Para criar uma conta, informe:
                </Typography>
                <BulletList items={["nome", "e-mail", "username", "senha"]} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Regras visíveis no cadastro:
                </Typography>
                <BulletList
                  items={[
                    "O e-mail deve ter um formato válido.",
                    "O username deve conter apenas letras, números e underline.",
                    "O username deve ter no máximo 15 caracteres.",
                    "O e-mail não pode estar duplicado.",
                    "O username não pode estar duplicado.",
                    "Ao criar a conta, o sistema também cria um espaço pessoal padrão.",
                  ]}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<LoginIcon color="primary" />} title="Login" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  Você pode entrar usando seu username ou e-mail junto com a senha. Após o login, o sistema direciona
                  você para a documentação, a menos que exista um redirecionamento específico na tela acessada antes.
                </Typography>
                <BulletList
                  items={[
                    "O botão Entrar com Google permite usar uma conta Google. Se não houver conta com o mesmo e-mail, o sistema cria uma com username gerado automaticamente; você pode ajustá-lo no Perfil.",
                    "Perfil, Dashboard e espaços exigem login. Início, Sobre e Documentação são públicos.",
                    "Para encerrar a sessão, escolha Sair no menu. Você será direcionado para a tela de login.",
                  ]}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<AccountCircleIcon color="primary" />} title="Perfil" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Usuários logados podem acessar a tela Perfil pelo menu lateral. Nessa tela, você pode visualizar e
                  editar seus dados básicos:
                </Typography>
                <BulletList items={["nome", "e-mail", "username"]} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Regras visíveis no perfil:
                </Typography>
                <BulletList
                  items={[
                    "Nome, e-mail e username são obrigatórios.",
                    "O e-mail deve ter um formato válido.",
                    "O e-mail não pode estar duplicado.",
                    "O username deve conter apenas letras, números e underline.",
                    "O username não pode estar duplicado.",
                    "Senha e permissões não são alteradas pela tela de perfil.",
                  ]}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  A aba Espaços inativos lista os espaços que foram desativados. Eles não aparecem na Navbar, mas podem
                  ser abertos pela lista para consulta ou edição.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  A aba Convites mostra os convites recebidos para participar de espaços. Ao abrir um convite, você vê
                  os dados do espaço, o status, as datas do convite e pode aceitar ou recusar convites pendentes.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  A imagem de perfil também pode ser alterada. Clique no avatar, escolha Trocar imagem e salve a nova
                  imagem. Para remover a foto atual, clique em Remover imagem.
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Extensões aceitas para imagem de perfil:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {acceptedProfileImageExtensions.map((extension) => (
                    <Chip key={extension} label={extension} color="primary" variant="outlined" />
                  ))}
                </Stack>
                <Typography variant="body1">
                  Tamanho máximo permitido: <strong>5 MB</strong>.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<WorkspacesIcon color="primary" />} title="Espaços" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Espaços são áreas usadas para agrupar tarefas. A tela reúne ícone, nome, sigla e descrição.
                  Em espaços existentes, a edição exige permissão de escrita. Também é possível configurar:
                </Typography>
                <BulletList items={["status ativo ou inativo", "responsável obrigatório nas tarefas"]} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Regras visíveis no cadastro de espaços:
                </Typography>
                <BulletList
                  items={[
                    "Ícone, nome, sigla e descrição são obrigatórios.",
                    "O nome deve ter no máximo 50 caracteres.",
                    "A sigla deve ter exatamente 2 caracteres.",
                    "A descrição deve ter no máximo 255 caracteres.",
                    "Ao salvar um espaço como inativo, o sistema pede confirmação.",
                    "Espaços inativos deixam de aparecer no menu lateral e podem ser acessados pela aba Espaços inativos do Perfil.",
                    "Quando Responsável obrigatório estiver marcado, as tarefas precisam ter um responsável para serem salvas.",
                  ]}
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  O menu lateral mostra a opção Espaços e, quando houver espaços ativos cadastrados, exibe atalhos para
                  eles.
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<PersonAddIcon color="primary" />} title="Usuários e convites do espaço" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Ao abrir um espaço salvo com acesso à aba Usuários, você pode visualizar os usuários vinculados ao
                  espaço e acompanhar os convites cadastrados. Alterações exigem permissão de escrita nessa área.
                </Typography>
                <BulletList
                  items={[
                    "A lista de usuários mostra avatar, nome, username, e-mail e vínculo com o espaço.",
                    "O proprietário aparece como Proprietário.",
                    "Usuários adicionados ao espaço aparecem como Participante.",
                    "Ao clicar em um usuário, é possível consultar e alterar permissões do espaço.",
                    "As permissões disponíveis são Sem permissão, Apenas leitura e Escrita, definidas separadamente para Espaço, Quadro e Usuários.",
                    "O indicador no alto da tela informa Modo leitura ou Modo escrita para a aba aberta.",
                    "No modo leitura, você pode consultar os dados; os controles de alteração ficam desabilitados.",
                    "As permissões do proprietário aparecem bloqueadas para edição.",
                    "A área de convites permite buscar uma pessoa por nome, username ou e-mail.",
                    "Quando nenhum resultado é encontrado na busca, o sistema mostra Nenhum usuário encontrado.",
                    "Antes de convidar, é possível escolher se o sistema deve enviar e-mail.",
                    "Depois de criar um convite, a lista de convites é atualizada.",
                    "Convites pendentes podem ser cancelados pela tela de detalhes do convite.",
                  ]}
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  A busca de usuários para convite não lista o usuário atual, usuários já vinculados ao espaço, o
                  proprietário do espaço ou usuários com convite pendente para o mesmo espaço.
                </Alert>
                <Alert severity="info" sx={{ mt: 2 }}>
                  O envio de e-mails de convite possui limite de 5 e-mails em 24 horas por usuário convidado, e convites
                  expiram em 3 dias.
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<DashboardIcon color="primary" />} title="Quadro do espaço" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Ao abrir um espaço salvo com acesso à aba Quadro, as tarefas aparecem em colunas. Com permissão de escrita, você pode:
                </Typography>
                <BulletList
                  items={[
                    "criar uma coluna pelo botão Adicionar coluna",
                    "adicionar uma tarefa pelo botão Adicionar Tarefa ou pelo menu de ações da coluna",
                    "abrir uma tarefa clicando no cartão para consultar ou editar seus dados",
                    "excluir uma tarefa aberta, usando Deletar",
                    "arrastar tarefas para mudar sua ordem ou movê-las entre colunas",
                    "arrastar o cabeçalho de uma coluna para mudar a ordem das colunas",
                  ]}
                />
                <Typography variant="body1">
                  Para navegar horizontalmente pelo quadro, use a barra de rolagem ou arraste uma área vazia com o mouse.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Cada tarefa possui:
                </Typography>
                <BulletList items={["título e descrição", "coluna", "prioridade", "responsável", "data prevista e data limite (opcionais)", "data de cadastro e data de atualização (somente consulta)"]} />
                <BulletList
                  items={[
                    "As prioridades disponíveis são Crítico, Alto, Médio, Baixa e Muito baixa. A prioridade inicial é Médio.",
                    "O responsável é escolhido entre os usuários do espaço e é obrigatório quando essa regra estiver ativa no espaço.",
                    "O cartão mostra o identificador da tarefa, a prioridade, o avatar do responsável e a data limite, quando informada.",
                    "Na criação, preencha os dados e clique em Criar. Na edição, textos e datas são salvos ao sair do campo; coluna, prioridade e responsável são salvos ao selecionar uma opção.",
                  ]}
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  Para criar uma tarefa, informe título, descrição, coluna e prioridade, além do responsável quando exigido. A tarefa fica vinculada ao espaço aberto.
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<DashboardIcon color="primary" />} title="Colunas do quadro" />
              </AccordionSummary>
              <AccordionDetails>
                <BulletList
                  items={[
                    "Cada coluna tem nome obrigatório, com até 50 caracteres, descrição opcional e um tipo: A FAZER, FAZENDO ou FEITO.",
                    "O tipo da coluna indica a etapa das tarefas. Na Dashboard, tarefas em colunas do tipo FEITO são consideradas concluídas.",
                    "Para editar uma coluna, use Editar coluna no menu de ações e clique em Salvar após as alterações.",
                    "A descrição pode ser consultada ao passar o mouse sobre o cabeçalho da coluna.",
                    "Para desativar uma coluna, mova todas as tarefas para outras colunas primeiro e desmarque Ativo na edição.",
                    "Colunas inativas deixam de aparecer no quadro.",
                  ]}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<DashboardIcon color="primary" />} title="Dashboard" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  Acesse Dashboard no menu para abrir o Radar do meu trabalho. Ele reúne as tarefas atribuídas a você
                  em espaços ativos, sem incluir tarefas de colunas inativas. Você pode filtrar por espaço.
                </Typography>
                <BulletList
                  items={[
                    "Os indicadores mostram tarefas em aberto, em andamento, atrasadas e com data limite entre hoje e os próximos 7 dias.",
                    "Os gráficos mostram a distribuição por etapa e prioridade.",
                    "Atividade recente conta as tarefas pela última atualização nos últimos 7 dias, 8 semanas e 6 meses; não representa um histórico de todas as alterações.",
                    "Foco imediato lista até 8 tarefas em aberto, ordenadas por atraso, proximidade do prazo e prioridade.",
                    "Clique em uma tarefa do Foco imediato para abrir seus detalhes no quadro do espaço, conforme suas permissões de acesso.",
                    "Quando não há tarefas atribuídas a você no filtro escolhido, a tela oferece um atalho para Espaços.",
                  ]}
                />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<WarningAmberIcon color="warning" />} title="Exclusão de tarefas" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  Uma tarefa só pode ser excluída se não possuir arquivos anexados. Se a tarefa tiver arquivos, exclua
                  os arquivos primeiro e depois exclua a tarefa. Antes da exclusão, o navegador pede confirmação.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<AttachFileIcon color="primary" />} title="Arquivos da tarefa" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Os arquivos ficam disponíveis dentro da edição da tarefa. Nessa área, você pode:
                </Typography>
                <BulletList
                  items={[
                    "anexar arquivo",
                    "listar arquivos",
                    "abrir arquivo em nova aba",
                    "copiar link do arquivo",
                    "excluir arquivo",
                  ]}
                />

                <Typography variant="body1" sx={{ mb: 1 }}>
                  Extensões aceitas:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {acceptedExtensions.map((extension) => (
                    <Chip key={extension} label={extension} color="primary" variant="outlined" />
                  ))}
                </Stack>

                <Typography variant="body1">
                  Tamanho máximo permitido: <strong>22 MB</strong>.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<SyncIcon color="primary" />} title="Atualização em tempo real" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  A aba Quadro recebe atualizações em tempo real de tarefas e colunas, incluindo criação, edição, movimentação de tarefas, reordenação e desativação de colunas.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<PaletteIcon color="primary" />} title="Navegação e tema" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  O menu lateral mostra as telas disponíveis para o seu estado de acesso:
                </Typography>
                <BulletList
                  items={[
                    "Visitantes podem acessar Início, Sobre, Documentação, Criar conta e Entrar.",
                    "Usuários logados podem acessar Perfil, Dashboard, Início, Sobre, Espaços, Documentação e Sair.",
                    "Início apresenta o sistema e atalhos para começar. Sobre explica o propósito do projeto e mostra informações e contatos do mantenedor.",
                    "O item Perfil mostra a imagem do usuário quando existe uma imagem cadastrada.",
                    "O menu lateral pode ser recolhido e essa escolha fica salva no navegador.",
                    "A lista de espaços ativos do menu pode ser expandida ou recolhida e separa os grupos Meus e Compartilhados.",
                    "Documentação é o guia de uso das telas, regras e limitações atuais do sistema.",
                    "O botão de tema alterna entre modo claro e escuro e também salva a escolha no navegador.",
                  ]}
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  Se você tentar acessar uma tela sem permissão, o sistema redireciona para a página inicial.
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<MenuBookIcon color="primary" />} title="Mensagens comuns" />
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1,
                  }}
                >
                  {messages.map((message) => (
                    <Alert
                      key={message}
                      severity="success"
                      icon={false}
                      sx={{
                        minWidth: 0,
                        py: 0.75,
                        "& .MuiAlert-message": {
                          minWidth: 0,
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        },
                      }}
                    >
                      {message}
                    </Alert>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<WarningAmberIcon color="warning" />} title="Limitações atuais" />
              </AccordionSummary>
              <AccordionDetails>
                <BulletList
                  items={[
                    "Na tela Criar espaço, o botão Salvar e os campos ficam desabilitados por falta de permissão de escrita; a criação por essa tela está bloqueada atualmente.",
                    "Não há uma área na interface para listar ou reativar colunas desativadas.",
                    "A Dashboard carrega os dados ao abrir a tela e não acompanha as alterações do quadro em tempo real. Recarregue a página para atualizar os indicadores.",
                    "Os arquivos podem ser abertos em outra aba, mas não há um botão específico para baixar arquivos.",
                  ]}
                />
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

DocumentacaoPage.disableMainCard = true;
