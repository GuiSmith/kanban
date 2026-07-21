import Head from 'next/head';
import Link from 'next/link';

// MUI
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

// MUI Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';

// Contexts
import { useAuth } from '@/contexts/AuthContext';

const boardColumns = [
  {
    title: 'A fazer',
    color: 'todo.main',
    tasks: [
      { title: 'Planejar próxima entrega', tag: 'Planejamento', accent: 'warning.main' },
      { title: 'Revisar pendências', tag: 'Organização', accent: 'info.main' },
    ],
  },
  {
    title: 'Fazendo',
    color: 'doing.main',
    tasks: [
      { title: 'Preparar apresentação', tag: 'Em andamento', accent: 'doing.main' },
    ],
  },
  {
    title: 'Feito',
    color: 'done.main',
    tasks: [
      { title: 'Organizar documentos', tag: 'Concluída', accent: 'done.main', done: true },
    ],
  },
];

const benefits = [
  {
    title: 'Enxergue o que importa',
    description: 'Prioridades, responsáveis e datas ficam visíveis para você decidir onde agir primeiro.',
    icon: InsightsOutlinedIcon,
    color: 'doing.main',
  },
  {
    title: 'Separe cada contexto',
    description: 'Crie espaços para projetos, pendências pessoais ou trabalhos compartilhados.',
    icon: SpaceDashboardOutlinedIcon,
    color: 'done.main',
  },
  {
    title: 'Avance em conjunto',
    description: 'Convide pessoas, organize responsabilidades e acompanhe mudanças no quadro.',
    icon: GroupsOutlinedIcon,
    color: 'warning.main',
  },
];

const steps = [
  {
    number: '01',
    title: 'Crie um espaço',
    description: 'Separe as tarefas pelo contexto que faz sentido para você.',
  },
  {
    number: '02',
    title: 'Organize o fluxo',
    description: 'Cadastre tarefas, defina prioridades, responsáveis e prazos.',
  },
  {
    number: '03',
    title: 'Acompanhe o avanço',
    description: 'Mova os cartões e use a Dashboard para manter o foco.',
  },
];

const FeatureIcon = ({ icon: Icon, color }) => (
  <Box
    sx={{
      display: 'grid',
      placeItems: 'center',
      width: 48,
      height: 48,
      borderRadius: 2,
      color,
      bgcolor: (theme) => alpha(theme.palette[color.split('.')[0]].main, 0.12),
    }}
  >
    <Icon aria-hidden="true" />
  </Box>
);

const ProductBoard = () => (
  <Paper
    role="img"
    aria-label="Exemplo de um quadro Kanban com tarefas a fazer, em andamento e concluídas"
    elevation={16}
    sx={{
      position: 'relative',
      p: { xs: 1.5, sm: 2 },
      borderRadius: 3,
      border: 1,
      borderColor: 'divider',
      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.94),
      overflow: 'hidden',
      transform: { lg: 'perspective(1200px) rotateY(-4deg) rotateX(2deg)' },
      transformOrigin: 'center',
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 0.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box component="img" src="/brand/kanban-logo.png" alt="" sx={{ width: 28, height: 28 }} />
        <Typography variant="subtitle2" fontWeight={700}>Projeto em movimento</Typography>
      </Stack>
      <Stack direction="row" spacing={-0.75}>
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.main', border: 2, borderColor: 'background.paper' }}>GS</Avatar>
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'done.main', color: 'common.black', border: 2, borderColor: 'background.paper' }}>+</Avatar>
      </Stack>
    </Stack>

    <Grid container spacing={1.25}>
      {boardColumns.map((column) => (
        <Grid size={4} key={column.title}>
          <Box
            sx={{
              height: '100%',
              minHeight: { xs: 250, sm: 290 },
              p: 1,
              borderRadius: 2,
              borderTop: 3,
              borderColor: column.color,
              bgcolor: 'action.hover',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
              <Typography variant="caption" fontWeight={700}>{column.title}</Typography>
              <Typography variant="caption" color="text.secondary">{column.tasks.length}</Typography>
            </Stack>
            <Stack spacing={1}>
              {column.tasks.map((task) => (
                <Paper key={task.title} variant="outlined" sx={{ p: { xs: 1, sm: 1.25 }, borderRadius: 1.5 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, textDecoration: task.done ? 'line-through' : 'none' }}
                  >
                    {task.title}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={0.5} sx={{ mt: 1.25 }}>
                    <Chip
                      label={task.tag}
                      size="small"
                      sx={{ height: 20, fontSize: '0.62rem', bgcolor: (theme) => alpha(theme.palette[task.accent.split('.')[0]].main, 0.14) }}
                    />
                    {task.done
                      ? <CheckCircleOutlineIcon sx={{ fontSize: 17, color: 'done.main' }} />
                      : <CalendarMonthOutlinedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

export default function Home() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? '/dashboard' : '/usuarios/novo';
  const primaryLabel = isAuthenticated ? 'Abrir minha Dashboard' : 'Criar minha conta';

  return (
    <>
      <Head>
        <title>Kanban | Organize tarefas e avance com clareza</title>
        <meta
          name="description"
          content="Organize tarefas não recorrentes, acompanhe prioridades e prazos e colabore em espaços visuais com o Kanban."
        />
        <meta property="og:title" content="Kanban | Organize tarefas e avance com clareza" />
        <meta property="og:description" content="Transforme tarefas dispersas em um fluxo visual, claro e compartilhado." />
        <meta property="og:type" content="website" />
      </Head>

      <Box
        component="main"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          mx: { xs: -3, sm: 0 },
          mt: -3,
          pt: 3,
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            background: (theme) => `
              radial-gradient(circle at 12% 10%, ${alpha(theme.palette.doing.main, 0.18)}, transparent 28%),
              radial-gradient(circle at 88% 22%, ${alpha(theme.palette.done.main, 0.14)}, transparent 25%)
            `,
          }}
        />

        <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 3 } }}>
          <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center" sx={{ minHeight: { lg: 'calc(100vh - 150px)' }, py: { xs: 7, md: 10 } }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack alignItems="flex-start" spacing={3}>
                <Chip
                  icon={<AutoAwesomeOutlinedIcon />}
                  label="Organize sem complicar"
                  color="primary"
                  variant="outlined"
                  sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06) }}
                />
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: '2.55rem', sm: '3.7rem', lg: '4.35rem' },
                    lineHeight: 1.03,
                    letterSpacing: '-0.045em',
                    fontWeight: 800,
                    maxWidth: 720,
                  }}
                >
                  Tire as tarefas da cabeça.{' '}
                  <Box component="span" sx={{ color: 'doing.main' }}>Coloque o progresso em movimento.</Box>
                </Typography>
                <Typography variant="h6" component="p" color="text.secondary" fontWeight={400} sx={{ lineHeight: 1.65, maxWidth: 620 }}>
                  Reúna afazeres não recorrentes, defina o que merece atenção e acompanhe cada avanço em um quadro visual feito para ser simples.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    component={Link}
                    href={primaryHref}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ px: 3, py: 1.4 }}
                  >
                    {primaryLabel}
                  </Button>
                  <Button component={Link} href="/documentacao" variant="outlined" size="large" sx={{ px: 3, py: 1.4 }}>
                    Conhecer os recursos
                  </Button>
                </Stack>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2.5}>
                  {[
                    { icon: ViewKanbanOutlinedIcon, label: 'Fluxo visual' },
                    { icon: SyncOutlinedIcon, label: 'Atualização em tempo real' },
                    { icon: LockOutlinedIcon, label: 'Controle de acesso' },
                  ].map(({ icon: Icon, label }) => (
                    <Stack key={label} direction="row" alignItems="center" spacing={0.75} color="text.secondary">
                      <Icon sx={{ fontSize: 18 }} aria-hidden="true" />
                      <Typography variant="caption">{label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <ProductBoard />
            </Grid>
          </Grid>

          <Box component="section" aria-labelledby="benefits-title" sx={{ py: { xs: 8, md: 12 } }}>
            <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: 6 }}>
              <Typography color="primary" fontWeight={700} sx={{ mb: 1 }}>MENOS DISPERSÃO, MAIS CLAREZA</Typography>
              <Typography id="benefits-title" component="h2" variant="h3" fontWeight={800} sx={{ mb: 2 }}>
                Seu trabalho precisa de direção, não de mais ruído
              </Typography>
              <Typography color="text.secondary" variant="h6" fontWeight={400}>
                O Kanban reúne as informações necessárias para transformar pendências soltas em próximos passos visíveis.
              </Typography>
            </Box>
            <Grid container spacing={3} justifyContent="center">
              {benefits.map(({ title, description, icon, color }) => (
                <Grid size={{ xs: 12, md: 4 }} key={title}>
                  <Paper variant="outlined" sx={{ height: '100%', p: 3.5, borderRadius: 3 }}>
                    <FeatureIcon icon={icon} color={color} />
                    <Typography component="h3" variant="h5" fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>{title}</Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>{description}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Grid container spacing={4} alignItems="stretch" sx={{ py: { xs: 8, md: 12 } }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                component="section"
                aria-labelledby="deadline-title"
                sx={{
                  height: '100%',
                  p: { xs: 3, sm: 5 },
                  borderRadius: 3,
                  color: 'common.white',
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.doing.main}, #315fbd)`,
                  overflow: 'hidden',
                }}
              >
                <CalendarMonthOutlinedIcon sx={{ fontSize: 42, mb: 3 }} aria-hidden="true" />
                <Typography id="deadline-title" component="h2" variant="h3" fontWeight={800} sx={{ maxWidth: 560 }}>
                  Não deixe um prazo virar surpresa
                </Typography>
                <Typography sx={{ mt: 2, mb: 4, maxWidth: 590, color: alpha('#fff', 0.82), lineHeight: 1.75 }}>
                  Combine data prevista, data limite e prioridade para reconhecer atrasos e antecipar o que está chegando.
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                  <Chip label="Crítica" sx={{ bgcolor: alpha('#fff', 0.18), color: 'common.white' }} />
                  <Chip label="Vence hoje" sx={{ bgcolor: alpha('#fff', 0.18), color: 'common.white' }} />
                  <Chip label="Próximos 7 dias" sx={{ bgcolor: alpha('#fff', 0.18), color: 'common.white' }} />
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                component="section"
                aria-labelledby="dashboard-title"
                variant="outlined"
                sx={{ height: '100%', p: { xs: 3, sm: 5 }, borderRadius: 3 }}
              >
                <DashboardOutlinedIcon color="primary" sx={{ fontSize: 42, mb: 3 }} aria-hidden="true" />
                <Typography id="dashboard-title" component="h2" variant="h4" fontWeight={800}>
                  Uma visão feita para decidir
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.75 }}>
                  A Dashboard reúne tarefas sob sua responsabilidade e destaca etapas, prioridades, atividade recente e foco imediato.
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box component="section" aria-labelledby="steps-title" sx={{ py: { xs: 8, md: 12 } }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography id="steps-title" component="h2" variant="h3" fontWeight={800}>Do caos à clareza em três passos</Typography>
            </Box>
            <Grid container spacing={3}>
              {steps.map((step) => (
                <Grid size={{ xs: 12, md: 4 }} key={step.number}>
                  <Stack direction="row" spacing={2.5} alignItems="flex-start">
                    <Typography color="primary" fontWeight={800} sx={{ fontSize: '1.1rem', pt: 0.4 }}>{step.number}</Typography>
                    <Box>
                      <Typography component="h3" variant="h5" fontWeight={700} sx={{ mb: 1 }}>{step.title}</Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>{step.description}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Paper
            component="section"
            aria-labelledby="cta-title"
            variant="outlined"
            sx={{
              position: 'relative',
              overflow: 'hidden',
              my: { xs: 8, md: 12 },
              p: { xs: 4, sm: 7 },
              borderRadius: 4,
              textAlign: 'center',
              bgcolor: (theme) => alpha(theme.palette.done.main, 0.07),
            }}
          >
            <Typography id="cta-title" component="h2" variant="h3" fontWeight={800} sx={{ maxWidth: 760, mx: 'auto' }}>
              A próxima tarefa já sabe para onde ir
            </Typography>
            <Typography color="text.secondary" variant="h6" fontWeight={400} sx={{ maxWidth: 650, mx: 'auto', mt: 2, mb: 4 }}>
              Comece com um espaço, organize o que está pendente e deixe o quadro mostrar o caminho.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1.5}>
              <Button component={Link} href={primaryHref} variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                {primaryLabel}
              </Button>
              {!isAuthenticated ? (
                <Button component={Link} href="/usuarios/login" variant="text" size="large">Já tenho uma conta</Button>
              ) : (
                <Button component={Link} href="/espacos" variant="text" size="large">Ver meus espaços</Button>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

Home.disableMainCard = true;
