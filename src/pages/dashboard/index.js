import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

// MUI
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// MUI Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';

// Components
import TaskPriorityIcon from '@/components/tarefas/TaskPriorityIcon';

// Contexts
import { useNavbar } from '@/contexts/NavbarContext';

// Utils
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { getTaskPriority, TASK_PRIORITY_OPTIONS } from '@/utils/taskPriority';

const PRIORITY_WEIGHT = {
  CRITICO: 5,
  ALTO: 4,
  MEDIO: 3,
  BAIXO: 2,
  MUITO_BAIXO: 1,
};

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const isDone = (task) => task.coluna_tipo === 'FEITO';

const getDaysUntil = (date) => {
  if (!date) return null;
  return dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day');
};

const getAttentionScore = (task) => {
  if (isDone(task)) return -1000;

  const daysUntilDeadline = getDaysUntil(task.data_limite);
  const deadlineScore = daysUntilDeadline === null
    ? 0
    : daysUntilDeadline < 0
      ? 100 + Math.abs(daysUntilDeadline)
      : Math.max(0, 30 - daysUntilDeadline * 3);

  return deadlineScore + (PRIORITY_WEIGHT[task.prioridade] ?? 3) * 10;
};

const getDeadlineLabel = (task) => {
  if (isDone(task)) return { label: 'Concluída', color: 'success' };
  if (!task.data_limite) return { label: 'Sem data limite', color: 'default' };

  const days = getDaysUntil(task.data_limite);
  if (days < 0) return { label: `${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'} em atraso`, color: 'error' };
  if (days === 0) return { label: 'Vence hoje', color: 'warning' };
  if (days === 1) return { label: 'Vence amanhã', color: 'warning' };
  return { label: `Vence em ${days} dias`, color: days <= 7 ? 'warning' : 'default' };
};

const MetricCard = ({ title, value, description, icon: Icon, color }) => (
  <Paper variant="outlined" sx={{ height: '100%', p: 2.5, borderRadius: 2 }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
      <Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h3" component="p" fontWeight={700} sx={{ my: 0.5 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{description}</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          p: 1.25,
          borderRadius: 2,
          color: `${color}.main`,
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
        }}
      >
        <Icon aria-hidden="true" />
      </Box>
    </Stack>
  </Paper>
);

const StatusChart = ({ tasks }) => {
  const theme = useTheme();
  const statusCounts = {
    todo: tasks.filter((task) => !['FAZENDO', 'FEITO'].includes(task.coluna_tipo)).length,
    doing: tasks.filter((task) => task.coluna_tipo === 'FAZENDO').length,
    done: tasks.filter(isDone).length,
  };
  const total = tasks.length;
  const todoEnd = total ? (statusCounts.todo / total) * 100 : 0;
  const doingEnd = total ? todoEnd + (statusCounts.doing / total) * 100 : 0;
  const background = total
    ? `conic-gradient(${theme.palette.todo.main} 0 ${todoEnd}%, ${theme.palette.doing.main} ${todoEnd}% ${doingEnd}%, ${theme.palette.done.main} ${doingEnd}% 100%)`
    : `conic-gradient(${theme.palette.action.disabledBackground} 0 100%)`;

  const items = [
    { label: 'A fazer', value: statusCounts.todo, color: theme.palette.todo.main },
    { label: 'Fazendo', value: statusCounts.doing, color: theme.palette.doing.main },
    { label: 'Feito', value: statusCounts.done, color: theme.palette.done.main },
  ];

  return (
    <Paper component="section" aria-labelledby="status-chart-title" variant="outlined" sx={{ height: '100%', p: 3, borderRadius: 2 }}>
      <Typography id="status-chart-title" component="h2" variant="h6" sx={{ mb: 3 }}>
        Distribuição por etapa
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-around" spacing={3}>
        <Box
          role="img"
          aria-label={`${statusCounts.todo} a fazer, ${statusCounts.doing} fazendo e ${statusCounts.done} concluídas`}
          sx={{
            width: 156,
            height: 156,
            borderRadius: '50%',
            background,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 98,
              height: 98,
              borderRadius: '50%',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h5" fontWeight={700}>{total}</Typography>
            <Typography variant="caption" color="text.secondary">tarefas</Typography>
          </Stack>
        </Box>
        <Stack spacing={1.5} sx={{ minWidth: 150 }}>
          {items.map((item) => (
            <Stack key={item.label} direction="row" alignItems="center" justifyContent="space-between" spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                <Typography variant="body2">{item.label}</Typography>
              </Stack>
              <Typography fontWeight={700}>{item.value}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

const PriorityChart = ({ tasks }) => {
  const maxValue = Math.max(1, ...TASK_PRIORITY_OPTIONS.map(({ value }) => tasks.filter((task) => task.prioridade === value).length));

  return (
    <Paper component="section" aria-labelledby="priority-chart-title" variant="outlined" sx={{ height: '100%', p: 3, borderRadius: 2 }}>
      <Typography id="priority-chart-title" component="h2" variant="h6" sx={{ mb: 3 }}>
        Distribuição por prioridade
      </Typography>
      <Stack spacing={2}>
        {TASK_PRIORITY_OPTIONS.map((priority) => {
          const count = tasks.filter((task) => task.prioridade === priority.value).length;
          return (
            <Box key={priority.value}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TaskPriorityIcon priority={priority.value} fontSize="small" />
                  <Typography variant="body2">{priority.label}</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={700}>{count}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(count / maxValue) * 100}
                aria-label={`${count} tarefas com prioridade ${priority.label}`}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { bgcolor: priority.paletteColor, borderRadius: 4 },
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

const ActivityChart = ({ tasks }) => {
  const [period, setPeriod] = useState('month');

  const activityData = useMemo(() => {
    if (period === 'day') {
      return Array.from({ length: 7 }, (_, index) => {
        const date = dayjs().subtract(6 - index, 'day').startOf('day');
        const count = tasks.filter((task) => dayjs(task.data_atualizacao).isSame(date, 'day')).length;
        return {
          key: date.format('YYYY-MM-DD'),
          label: date.format('DD/MM'),
          tooltipLabel: date.format('DD/MM/YYYY'),
          count,
        };
      });
    }

    if (period === 'week') {
      const today = dayjs().startOf('day');
      const currentWeekStart = today.subtract((today.day() + 6) % 7, 'day');
      return Array.from({ length: 8 }, (_, index) => {
        const start = currentWeekStart.subtract(7 - index, 'week');
        const end = start.add(6, 'day').endOf('day');
        const count = tasks.filter((task) => {
          const updatedAt = dayjs(task.data_atualizacao);
          return !updatedAt.isBefore(start) && !updatedAt.isAfter(end);
        }).length;
        return {
          key: start.format('YYYY-MM-DD'),
          label: start.format('DD/MM'),
          tooltipLabel: `${start.format('DD/MM')} a ${end.format('DD/MM/YYYY')}`,
          count,
        };
      });
    }

    return Array.from({ length: 6 }, (_, index) => {
      const month = dayjs().subtract(5 - index, 'month');
      return {
        key: month.format('YYYY-MM'),
        label: MONTH_LABELS[Number(month.format('M')) - 1],
        tooltipLabel: `${MONTH_LABELS[Number(month.format('M')) - 1]}/${month.format('YYYY')}`,
        count: tasks.filter((task) => dayjs(task.data_atualizacao).format('YYYY-MM') === month.format('YYYY-MM')).length,
      };
    });
  }, [period, tasks]);

  const maxValue = Math.max(1, ...activityData.map(({ count }) => count));
  const periodLabel = period === 'day' ? 'dia' : period === 'week' ? 'semana' : 'mês';

  return (
    <Paper component="section" aria-labelledby="activity-chart-title" variant="outlined" sx={{ height: '100%', p: 3, borderRadius: 2 }}>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography id="activity-chart-title" component="h2" variant="h6">Atividade recente</Typography>
            <Typography variant="caption" color="text.secondary">Tarefas atualizadas por {periodLabel}</Typography>
          </Box>
          <UpdateOutlinedIcon color="action" aria-hidden="true" />
        </Stack>
        <ToggleButtonGroup
          value={period}
          exclusive
          size="small"
          fullWidth
          onChange={(_, value) => value && setPeriod(value)}
          aria-label="Período do gráfico de atividade"
        >
          <ToggleButton value="day" aria-label="Visualizar por dia">Dia</ToggleButton>
          <ToggleButton value="week" aria-label="Visualizar por semana">Semana</ToggleButton>
          <ToggleButton value="month" aria-label="Visualizar por mês">Mês</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack direction="row" alignItems="flex-end" spacing={1.5} sx={{ height: 178 }}>
        {activityData.map(({ key, label, tooltipLabel, count }) => (
          <Stack key={key} alignItems="center" justifyContent="flex-end" spacing={1} sx={{ flex: 1, height: '100%', minWidth: 0 }}>
            <Tooltip title={`${tooltipLabel}: ${count} tarefa${count === 1 ? '' : 's'} atualizada${count === 1 ? '' : 's'}`}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 42,
                  height: `${Math.max(count ? 12 : 3, (count / maxValue) * 130)}px`,
                  bgcolor: count ? 'primary.main' : 'action.disabledBackground',
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'height 0.2s ease',
                }}
              />
            </Tooltip>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

const FocusList = ({ tasks }) => (
  <Paper component="section" aria-labelledby="focus-list-title" variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
    <Box sx={{ p: 3, pb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <InsightsOutlinedIcon color="primary" aria-hidden="true" />
        <Typography id="focus-list-title" component="h2" variant="h6">Foco imediato</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Priorizado por atraso, proximidade do prazo e criticidade.
      </Typography>
    </Box>
    <Divider />
    {tasks.length === 0 ? (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 42, mb: 1 }} />
        <Typography fontWeight={600}>Nenhuma tarefa exige atenção agora.</Typography>
        <Typography variant="body2" color="text.secondary">Seu radar está limpo.</Typography>
      </Box>
    ) : (
      <List disablePadding>
        {tasks.map((task, index) => {
          const deadline = getDeadlineLabel(task);
          const priority = getTaskPriority(task.prioridade);
          return (
            <Box key={task.id}>
              {index > 0 ? <Divider component="li" /> : null}
              <ListItem disablePadding>
                <ListItemButton component={Link} href={`/espacos?id=${task.id_espaco}`} sx={{ px: 3, py: 2 }}>
                  <TaskPriorityIcon priority={task.prioridade} sx={{ mr: 2 }} />
                  <ListItemText
                    primary={task.titulo}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.75 }}>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {task.espaco_sigla} · {task.coluna_nome ?? 'Sem etapa'}
                        </Typography>
                        {task.data_prevista ? (
                          <Typography component="span" variant="caption" color="text.secondary">
                            Prevista: {formatDate(task.data_prevista)}
                          </Typography>
                        ) : null}
                        <Typography component="span" variant="caption" color="text.secondary">
                          Criada: {formatDate(task.data_cadastro)}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          Atualizada: {formatDateTime(task.data_atualizacao)}
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                  <Stack alignItems="flex-end" spacing={1} sx={{ ml: 2 }}>
                    <Chip label={deadline.label} color={deadline.color} size="small" variant={deadline.color === 'default' ? 'outlined' : 'filled'} />
                    <Typography variant="caption" color="text.secondary">{priority.label}</Typography>
                  </Stack>
                </ListItemButton>
              </ListItem>
            </Box>
          );
        })}
      </List>
    )}
  </Paper>
);

export default function DashboardPage() {
  const { profile } = useNavbar();
  const [tasks, setTasks] = useState([]);
  const [spaceFilter, setSpaceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const response = await authAxios('GET', '/api/dashboard/listarTarefas');
        setTasks(response?.data?.data ?? []);
      } catch (error) {
        setHasError(true);
        catchAuthAxios(error, 'Erro ao carregar a dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const spaces = useMemo(() => {
    const uniqueSpaces = new Map();
    tasks.forEach((task) => uniqueSpaces.set(task.id_espaco, { id: task.id_espaco, nome: task.espaco_nome }));
    return [...uniqueSpaces.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [tasks]);

  const filteredTasks = useMemo(() => (
    spaceFilter === 'all' ? tasks : tasks.filter((task) => Number(task.id_espaco) === Number(spaceFilter))
  ), [spaceFilter, tasks]);

  const metrics = useMemo(() => {
    const openTasks = filteredTasks.filter((task) => !isDone(task));
    const overdue = openTasks.filter((task) => getDaysUntil(task.data_limite) < 0);
    const dueSoon = openTasks.filter((task) => {
      const days = getDaysUntil(task.data_limite);
      return days !== null && days >= 0 && days <= 7;
    });
    return {
      open: openTasks.length,
      doing: openTasks.filter((task) => task.coluna_tipo === 'FAZENDO').length,
      overdue: overdue.length,
      dueSoon: dueSoon.length,
    };
  }, [filteredTasks]);

  const focusTasks = useMemo(() => (
    [...filteredTasks]
      .filter((task) => !isDone(task))
      .sort((a, b) => getAttentionScore(b) - getAttentionScore(a))
      .slice(0, 8)
  ), [filteredTasks]);

  return (
    <>
      <Head>
        <title>Dashboard | Kanban</title>
        <meta name="description" content="Acompanhe prazos, prioridades e o andamento das tarefas sob sua responsabilidade." />
      </Head>

      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2}>
          <Box component="header">
            <Typography component="h1" variant="h4" fontWeight={700}>Radar do meu trabalho</Typography>
            <Typography color="text.secondary">
              {profile?.nome ? `${profile.nome}, veja` : 'Veja'} o que merece sua atenção agora.
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 240 } }}>
            <InputLabel id="dashboard-space-filter-label">Espaço</InputLabel>
            <Select
              labelId="dashboard-space-filter-label"
              value={spaceFilter}
              label="Espaço"
              onChange={(event) => setSpaceFilter(event.target.value)}
            >
              <MenuItem value="all">Todos os espaços</MenuItem>
              {spaces.map((space) => <MenuItem key={space.id} value={space.id}>{space.nome}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        {hasError ? <Alert severity="error">Não foi possível carregar os dados da dashboard.</Alert> : null}

        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 360 }}>
            <CircularProgress />
            <Typography color="text.secondary">Montando seu radar de tarefas...</Typography>
          </Stack>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard title="Em aberto" value={metrics.open} description="Tarefas ainda não concluídas" icon={AssignmentOutlinedIcon} color="primary" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard title="Em andamento" value={metrics.doing} description="Tarefas na etapa Fazendo" icon={AccessTimeIcon} color="info" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard title="Atrasadas" value={metrics.overdue} description="Prazo limite já ultrapassado" icon={ErrorOutlineIcon} color="error" />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard title="Próximos 7 dias" value={metrics.dueSoon} description="Prazos que estão se aproximando" icon={CalendarMonthOutlinedIcon} color="warning" />
              </Grid>
            </Grid>

            {filteredTasks.length === 0 ? (
              <Paper variant="outlined" sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 2 }}>
                <AssignmentOutlinedIcon color="disabled" sx={{ fontSize: 56, mb: 2 }} />
                <Typography component="h2" variant="h6">Nenhuma tarefa sob sua responsabilidade</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                  Quando uma tarefa for atribuída a você, os indicadores aparecerão aqui.
                </Typography>
                <Button component={Link} href="/espacos" variant="contained" endIcon={<ArrowForwardIcon />}>
                  Ir para espaços
                </Button>
              </Paper>
            ) : (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={4}><StatusChart tasks={filteredTasks} /></Grid>
                  <Grid item xs={12} md={6} lg={4}><PriorityChart tasks={filteredTasks} /></Grid>
                  <Grid item xs={12} md={6} lg={4}><ActivityChart tasks={filteredTasks} /></Grid>
                </Grid>
                <FocusList tasks={focusTasks} />
              </>
            )}
          </>
        )}
      </Stack>
    </>
  );
}
