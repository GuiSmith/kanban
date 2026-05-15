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
  "Tarefa criada",
  "Tarefa editada",
  "Tarefa deletada",
  "Arquivo inserido",
  "Arquivo deletado com sucesso",
  "Preencha todos os dados para continuar",
  "Espaço não encontrado!",
  "Tarefa não encontrada",
  "Delete os arquivos antes de deletar as tarefas",
  "Credenciais inválidas",
  "Ainda não implementado",
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
                  de espaços para criar um espaço e gerenciar suas abas.
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
                    "O e-mail não pode estar duplicado.",
                    "O username não pode estar duplicado.",
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
                  A imagem de perfil também pode ser alterada. Clique no avatar, escolha Trocar imagem e salve a nova
                  imagem.
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
                  Espaços são áreas usadas para agrupar tarefas. Na tela de espaços, você pode criar e editar espaços
                  informando:
                </Typography>
                <BulletList items={["ícone", "nome", "sigla", "descrição", "status ativo ou inativo"]} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Regras visíveis no cadastro de espaços:
                </Typography>
                <BulletList
                  items={[
                    "Todos os campos são obrigatórios.",
                    "O nome deve ter no máximo 50 caracteres.",
                    "A sigla deve ter exatamente 2 caracteres.",
                    "A descrição deve ter no máximo 255 caracteres.",
                    "Ao salvar um espaço como inativo, o sistema pede confirmação.",
                    "Espaços inativos deixam de aparecer na Navbar.",
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
                  Ao abrir um espaço salvo, a aba Usuários fica disponível. Nela, você pode visualizar os usuários
                  vinculados ao espaço e acompanhar os convites cadastrados.
                </Typography>
                <BulletList
                  items={[
                    "A lista de usuários mostra avatar, nome, username, e-mail e vínculo com o espaço.",
                    "O proprietário aparece como Proprietário.",
                    "Usuários adicionados ao espaço aparecem como Participante.",
                    "A área de convites permite buscar uma pessoa por nome, username ou e-mail.",
                    "Quando nenhum resultado é encontrado na busca, o sistema mostra Nenhum usuário encontrado.",
                    "Antes de convidar, é possível escolher se o sistema deve enviar e-mail.",
                    "Depois de criar um convite, a lista de convites é atualizada.",
                  ]}
                />
                <Alert severity="info" sx={{ mt: 2 }}>
                  A busca de usuários para convite não lista o usuário atual, usuários já vinculados ao espaço, o
                  proprietário do espaço ou usuários com convite pendente para o mesmo espaço.
                </Alert>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<DashboardIcon color="primary" />} title="Quadro do espaço" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Ao abrir um espaço salvo, a aba Quadro fica disponível. Nela, você pode:
                </Typography>
                <BulletList items={["listar tarefas", "criar tarefa", "editar tarefa", "excluir tarefa"]} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Cada tarefa possui:
                </Typography>
                <BulletList items={["título", "descrição", "data de cadastro", "data de atualização"]} />
                <Alert severity="info" sx={{ mt: 2 }}>
                  Para criar uma tarefa, título e descrição são obrigatórios. A tarefa fica vinculada ao espaço aberto.
                </Alert>
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
                  A aba Quadro recebe atualizações em tempo real quando tarefas são criadas, editadas ou excluídas.
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
                    "Usuários logados podem acessar Perfil, Início, Sobre, Espaços, Documentação e Sair.",
                    "O item Perfil mostra a imagem do usuário quando existe uma imagem cadastrada.",
                    "O menu lateral pode ser recolhido e essa escolha fica salva no navegador.",
                    "A lista de espaços ativos do menu pode ser expandida ou recolhida.",
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
                    "A página inicial ainda não possui conteúdo.",
                    "A página Sobre ainda é simples.",
                    "A tela de espaços não possui exclusão definitiva de espaço; espaços podem ser inativados.",
                    "A ação de copiar tarefa ainda não está implementada.",
                    "A rota de listagem usada na busca de usuários para convite ainda concentra responsabilidades e precisa ser separada em fluxos menores.",
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

export const getServerSideProps = async () => ({
  props: {},
});
