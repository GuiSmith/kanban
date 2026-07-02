// Next
import Head from "next/head";
import dayjs from 'dayjs';

// MUI
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

// React
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// UI Personalizado
import Loading from '@/components/Loading';
import TarefaFormulario from "./TarefaFormulario";
import { toast } from 'react-toastify';

// Utils
import authAxios from "@/utils/authAxios";
import catchAuthAxios from '@/utils/catchAxios';
import columnType from "@/utils/columnType";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";

export default function TarefasPage({ espaco }) {
  const [tarefas, setTarefas] = useState([]);
  const [colunas, setColunas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({});
  const [menu, setMenu] = useState({ anchorEl: null, coluna: null });

  const handleMenuClick = (event, coluna) => {
    setMenu({ anchorEl: event.currentTarget, coluna });
  }

  const handleClose = () => {
    setMenu({ anchorEl: null, coluna: null });
  };

  const dateFormat = 'DD/MM/YYYY HH:mm:ss';

  const tarefaCardProps = {
    elevation: 4,
    sx: {
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 8,
      },
    }
  };

  const colunaGridProps = (coluna) => ({
    size: { xs: 12, sm: 6, md: 2 },
    sx: {
      minWidth: '250px',
      maxWidth: '250px',
      overflow: 'hidden',
      position: 'relative',
      mb: 3,
      border: 1,
      borderColor: `${columnType[coluna.tipo] ?? 'default'}.main`,
      p: 1,
      borderRadius: 1,
    }
  });

  // Socket
  useEffect(() => {

    const socket = io({ path: '/api/socketio' });

    socket.emit('join_tarefas');
    socket.emit('join_colunas');

    socket.on('tarefas', payload => {

      switch (payload.op) {
        case 'DELETE':
          if (payload.entity === 'tarefa') {
            setTarefas(prev => prev.filter(tarefa => tarefa.id !== payload.data.id));
          } else if (payload.entity === 'coluna') {
            setColunas(prev => prev.filter(coluna => coluna.id !== payload.data.id));
          }
          break;
        case 'UPDATE':
          if (payload.entity === 'tarefa') {
            setTarefas(tarefas => tarefas.map(tarefa => {
              if (tarefa.id == payload.data.id) {
                return {
                  ...tarefa,
                  ...payload.data,
                };
              }
              return tarefa;
            }));
          } else if (payload.entity === 'coluna') {
            setColunas(colunas => colunas.map(coluna => {
              if (coluna.id == payload.data.id) {
                return {
                  ...coluna,
                  ...payload.data,
                };
              }
              return coluna;
            }));
          }
          break;
        case 'INSERT':
          if (payload.entity === 'tarefa') {
            setTarefas(tarefas => [...tarefas, { ...payload.data }]);
          } else if (payload.entity === 'coluna') {
            setColunas(colunas => [...colunas, { ...payload.data }]);
          }
          break;
        default:
          break;
      }
    });

    return () => {
      socket.emit('leave_tarefas');
      socket.disconnect();
    }
  }, []);

  // Buscar tarefas
  useEffect(() => {
    const fetchTarefas = async () => {
      try {
        setIsLoading(true);
        const urlParams = new URLSearchParams({ id_espaco: espaco.id });
        const res = await authAxios('post', `/api/tarefas/listarTarefas?${urlParams.toString()}`);
        setTarefas(res.data.data);
      } catch (error) {
        catchAuthAxios(error, 'Erro ao listar tarefas');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchColunas = async () => {
      try {
        setIsLoading(true);
        const urlParams = new URLSearchParams({ id_espaco: espaco.id });
        const res = await authAxios('get', `/api/colunas/listarColunas?${urlParams.toString()}`);
        setColunas(res.data.data);
      } catch (error) {
        catchAuthAxios(error, 'Erro ao listar colunas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchColunas();
    fetchTarefas();
  }, [espaco]);

  const handleNovaTarefa = (id_coluna) => {
    console.log({ id_coluna });
    setTaskFormData({ mode: 'create', initialValues: { id_espaco: espaco.id, id_coluna } });
    setIsModalOpen(true);
  };

  const handleEditarTarefa = (tarefa) => {
    setTaskFormData({ mode: 'edit', initialValues: { ...tarefa } });
    setIsModalOpen(true);
  }

  const handleFecharModal = () => {
    setTaskFormData({});
    setIsModalOpen(false);
  }

  const options = [
    { label: 'Adicionar tarefa', icon: AddIcon, handleClick: (coluna) => handleNovaTarefa(coluna.id) },
    { label: 'Editar coluna', icon: EditIcon, handleClick: () => alert('Ainda não implementado') },
  ];

  return (
    <>
      <Head>
        <title>Tarefas</title>
        <meta name="description" content="Tela de tarefas" />
      </Head>

      <Dialog
        open={isModalOpen}
        onClose={handleFecharModal}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              p: 3,
            },
          },
        }}
      >
        <TarefaFormulario
          mode={taskFormData?.mode}
          initialValues={taskFormData?.initialValues}
          onClose={handleFecharModal}
        />
      </Dialog>

      <Menu open={Boolean(menu.anchorEl)} onClose={handleClose} anchorEl={menu.anchorEl}>
        {options.map(option => {
          const Icon = option.icon;

          return (
            <MenuItem key={option.label} onClick={() => option.handleClick(menu.coluna)} >
              <Stack direction='row' spacing={2} justifyContent='start'>
                <Icon />
                <Typography>{option.label}</Typography>
              </Stack>
            </MenuItem>
          )
        })}
      </Menu>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        }}
      >
        {colunas.length !== 0 && colunas.filter(coluna => coluna?.ativo === true)?.map(coluna => {
          const tarefasDaColuna = tarefas.filter(tarefa => tarefa?.id_coluna == coluna?.id) ?? [];

          return (
            <Grid key={coluna.id} {...colunaGridProps(coluna)}>
            <Typography textAlign="center" variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {capitalizeFirstLetter(coluna.nome)}
            </Typography>
            <Tooltip title={`Esta coluna tem ${tarefasDaColuna.length} tarefas`} sx={{ position: 'absolute', top: 1, left: 1 }}>
              <Chip label={tarefasDaColuna.length} size='small' />
            </Tooltip>
            <IconButton size='small' onClick={(e) => handleMenuClick(e, coluna)} sx={{ position: 'absolute', right: 0, top: 0 }}>
              <MoreVertIcon />
            </IconButton>
            <Stack direction='column' spacing={1} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {isLoading ? <Loading /> : tarefasDaColuna.map(tarefa => (
                <Card {...tarefaCardProps} key={tarefa.id}>
                  <CardContent onClick={() => handleEditarTarefa(tarefa)}>
                    <Typography variant="h6" component="h2">
                      {tarefa.titulo || "Sem titulo"}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {dayjs(tarefa.data_atualizacao || tarefa.data_cadastro).format(dateFormat)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              <Card sx={{ textAlign: 'center' }} key='nova-tarefa' >
                <CardContent>
                  <Button onClick={() => handleNovaTarefa(coluna.id)} variant='outlined' startIcon={<AddIcon />} fullWidth>
                    Adicionar Tarefa
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          );
        })}
        <Grid key='nova-coluna' {...colunaGridProps({ id: 'nova-coluna', nome: 'Nova Coluna' })}>
          <Button variant='outlined' startIcon={<AddIcon />} fullWidth>
            Adicionar Coluna
          </Button>
        </Grid>
      </Stack>
    </>
  );
}

export const getServerSideProps = async () => ({
  props: {},
});
