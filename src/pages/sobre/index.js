import Head from "next/head";

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// MUI Icons
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';

const principles = [
  {
    title: 'Simplicidade',
    description: 'Organizar tarefas sem adicionar processos ou etapas desnecessárias.',
    icon: ViewKanbanOutlinedIcon,
  },
  {
    title: 'Organização visual',
    description: 'Tornar o andamento das atividades fácil de compreender em poucos instantes.',
    icon: VisibilityOutlinedIcon,
  },
  {
    title: 'Flexibilidade',
    description: 'Separar projetos, pendências e outros contextos em espaços distintos.',
    icon: WorkspacesOutlinedIcon,
  },
  {
    title: 'Colaboração',
    description: 'Permitir que pessoas compartilhem a organização de um mesmo trabalho.',
    icon: GroupsOutlinedIcon,
  },
];

const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

export default function SobrePage() {
  return (
    <>
      <Head>
        <title>Sobre | Kanban</title>
        <meta
          name="description"
          content="Conheça o propósito do Kanban, para quem ele foi desenvolvido e quem mantém o projeto."
        />
      </Head>

      <Container component="article" maxWidth="lg" disableGutters>
        <Stack spacing={{ xs: 5, md: 7 }}>
          <Box component="header" sx={{ textAlign: 'center', maxWidth: 760, mx: 'auto' }}>
            <Box
              component="img"
              src="/brand/kanban-logo.png"
              alt="Símbolo do Kanban"
              sx={{ width: { xs: 72, sm: 88 }, height: { xs: 72, sm: 88 }, mb: 2 }}
            />
            <Typography component="h1" variant="h2" sx={{ fontSize: { xs: '2.25rem', sm: '3rem' }, mb: 2 }}>
              Sobre o Kanban
            </Typography>
            <Typography variant="h6" component="p" color="text.secondary" fontWeight={400}>
              Uma aplicação para organizar tarefas e afazeres não recorrentes de forma simples, visual e colaborativa.
            </Typography>
          </Box>

          <Grid container spacing={3} component="section" aria-labelledby="proposito-title">
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <Typography id="proposito-title" component="h2" variant="h4" sx={{ mb: 2 }}>
                  Por que o projeto existe
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Tarefas pontuais frequentemente acabam espalhadas entre anotações, mensagens e lembretes. O Kanban
                  nasceu para reunir esses afazeres em um único ambiente e oferecer uma visão clara do que precisa ser
                  feito, do que está em andamento e do que já foi concluído.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <Typography component="h2" variant="h4" sx={{ mb: 2 }}>
                  Para quem foi desenvolvido
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  O projeto foi pensado para pessoas e pequenos grupos que desejam organizar projetos pessoais,
                  pendências e trabalhos compartilhados sem depender de processos excessivamente complexos.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box component="section" aria-labelledby="principios-title">
            <Typography id="principios-title" component="h2" variant="h4" align="center" sx={{ mb: 1 }}>
              Como o projeto é pensado
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
              Quatro princípios orientam as decisões e a evolução da aplicação.
            </Typography>
            <Grid container spacing={2}>
              {principles.map(({ title, description, icon: Icon }) => (
                <Grid item xs={12} sm={6} md={3} key={title}>
                  <Paper variant="outlined" sx={{ height: '100%', p: 3, borderRadius: 2 }}>
                    <Icon color="primary" sx={{ fontSize: 36, mb: 2 }} aria-hidden="true" />
                    <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider />

          <Box component="section" aria-labelledby="developer-title">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                      flexShrink: 0,
                    }}
                  >
                    <PersonOutlineIcon color="primary" fontSize="large" aria-hidden="true" />
                  </Box>
                  <Box>
                    <Typography id="developer-title" component="h2" variant="h4">
                      Guilherme Smith
                    </Typography>
                    <Typography color="text.secondary">Desenvolvedor e mantenedor</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                  O Kanban é um projeto pessoal desenvolvido e mantido exclusivamente por Guilherme Smith. Seu
                  desenvolvimento é contínuo e orientado pelas necessidades percebidas durante o uso da aplicação.
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5}>
                  <Button
                    component="a"
                    href="https://kanban.guismith.com"
                    variant="contained"
                    startIcon={<LanguageIcon />}
                    {...externalLinkProps}
                  >
                    Acessar o Kanban
                  </Button>
                  <Button
                    component="a"
                    href="https://github.com/GuiSmith/kanban"
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    {...externalLinkProps}
                  >
                    Repositório
                  </Button>
                  <Button
                    component="a"
                    href="https://github.com/GuiSmith"
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    {...externalLinkProps}
                  >
                    GitHub
                  </Button>
                  <Button
                    component="a"
                    href="https://www.linkedin.com/in/guilherme-smith-8b4bb6238/"
                    variant="outlined"
                    startIcon={<LinkedInIcon />}
                    {...externalLinkProps}
                  >
                    LinkedIn
                  </Button>
                  <Button
                    component="a"
                    href="mailto:guilhermessmith2014@gmail.com"
                    variant="text"
                    startIcon={<EmailOutlinedIcon />}
                  >
                    Entrar em contato
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Container>
    </>
  );
}
