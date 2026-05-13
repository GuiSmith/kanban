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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoginIcon from "@mui/icons-material/Login";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SyncIcon from "@mui/icons-material/Sync";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const acceptedExtensions = ["pdf", "jpg", "png", "jpeg"];

const messages = [
  "Tarefa criada",
  "Tarefa editada",
  "Tarefa deletada",
  "Arquivo inserido",
  "Arquivo deletado",
  "Preencha todos os dados para continuar",
  "Tarefa não encontrada",
  "Delete os arquivos antes de deletar as tarefas",
  "Credenciais inválidas",
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
                  O sistema permite criar uma conta, fazer login, gerenciar tarefas e anexar arquivos às tarefas.
                  Depois de entrar, você acessa a tela de tarefas para consultar, criar, editar e excluir registros.
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
                  você para a tela de tarefas.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SectionTitle icon={<TaskAltIcon color="primary" />} title="Tarefas" />
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Na tela de tarefas, você pode:
                </Typography>
                <BulletList items={["listar tarefas", "criar tarefa", "editar tarefa", "excluir tarefa"]} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Cada tarefa possui:
                </Typography>
                <BulletList items={["título", "descrição", "data de cadastro", "data de atualização"]} />
                <Alert severity="info" sx={{ mt: 2 }}>
                  Para criar uma tarefa, título e descrição são obrigatórios.
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
                  os arquivos primeiro e depois exclua a tarefa.
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

                <Alert severity="warning" sx={{ my: 2 }}>
                  A opção de baixar arquivo aparece na interface, mas ainda não está implementada.
                </Alert>

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
                  A tela de tarefas recebe atualizações em tempo real quando tarefas são criadas, editadas ou excluídas.
                </Typography>
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
                    "A ação de copiar tarefa ainda não está implementada.",
                    "A ação de baixar arquivo ainda não está implementada.",
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
