// Next
import Head from "next/head";
import { useDroppable, DragDropProvider } from "@dnd-kit/react";
import { useSortable } from '@dnd-kit/react/sortable';

// MUI
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

// React
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// UI Personalizado
import Loading from '@/components/Loading';
import ModalCloseButton from '@/components/ModalCloseButton';
import TarefaFormulario from "./TarefaFormulario";
import ColunaFormulario from "./ColunaFormulario";

// Utils
import authAxios from "@/utils/authAxios";
import catchAuthAxios from '@/utils/catchAxios';
import columnType from "@/utils/columnType";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { formatDate } from "@/utils/formatDate";

const colunaBoxProps = (coluna, isDropTarget) => ({
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
    opacity: isDropTarget ? 0.7 : 1,
  }
});

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

const Coluna = ({ espaco, coluna, tarefas, handleOpenMenu, handleNovaTarefa, handleEditarTarefa, writePermission }) => {

  const { ref, isDropTarget } = useDroppable({
    id: `coluna:${coluna.id}`,
    type: 'column',
    accept: 'item',
    disabled: writePermission === false
  });

  const tarefasDaColuna = tarefas
    .filter(tarefa => tarefa.id_coluna == coluna.id)
    .sort((a, b) => a.ordem - b.ordem);

  return (
    <Box ref={ref} {...colunaBoxProps(coluna, isDropTarget)} >
      {/* Header */}
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {capitalizeFirstLetter(coluna.nome)}
        </Typography>
        <Stack direction='row' spacing={0.1} alignItems='center' >
          <Tooltip title={`Esta coluna tem ${tarefasDaColuna.length} tarefas`}>
            <IconButton size='small'>
              {tarefasDaColuna.length}
            </IconButton>
          </Tooltip>
          <Tooltip title='Ações da coluna'>
            <IconButton size='small' onClick={(e) => handleOpenMenu(e, coluna)} disabled={writePermission === false}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      {/* Tarefas */}
      <Stack direction='column' spacing={1} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {tarefasDaColuna.map(tarefa => (
          <TarefaCard
            espaco={espaco}
            coluna={coluna}
            tarefa={tarefa}
            key={`tarefa:${tarefa.id}`}
            handleEditarTarefa={handleEditarTarefa}
            writePermission={writePermission}
          />
        ))}
        <Card sx={{ textAlign: 'start' }} key='nova-tarefa' >
          <Button
            onClick={() => handleNovaTarefa(coluna.id)}
            variant='text'
            startIcon={<AddIcon />}
            size='small'
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            fullWidth
            disabled={writePermission === false}
          >
            Adicionar Tarefa
          </Button>
        </Card>
      </Stack>
    </Box>
  );

};

const TarefaCard = ({ espaco, tarefa, coluna, handleEditarTarefa, writePermission }) => {

  const { ref } = useSortable({
    id: `tarefa:${tarefa.id}`,
    index: tarefa.ordem,
    type: 'item',
    accept: 'item',
    group: `coluna:${coluna.id}`,
    disabled: writePermission === false
  });

  return (
    <Card ref={ref} {...tarefaCardProps} >
      <CardContent onClick={() => handleEditarTarefa(tarefa)}>
        <Typography color='info'>{espaco.sigla}-{tarefa.id}</Typography>
        <Typography variant="h6" component="h2">
          {tarefa.titulo || "Sem titulo"}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary">
            {formatDate(tarefa.data_atualizacao || tarefa.data_cadastro)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function TarefasPage({ espaco, writePermission }) {
  const [tarefas, setTarefas] = useState([]);
  const [colunas, setColunas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tarefaModal, setTarefaModal] = useState({ open: false, data: {} });
  const [colunaModal, setColunaModal] = useState({ open: false, data: {} });
  const [menu, setMenu] = useState({ anchorEl: null, coluna: null });

  const handleOpenMenu = (event, coluna) => {
    setMenu({ anchorEl: event.currentTarget, coluna });
  }

  const handleCloseMenu = () => {
    setMenu({ anchorEl: null, coluna: null });
  };

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
    setTarefaModal({
      open: true,
      data: {
        mode: 'create',
        initialValues: {
          id_espaco: espaco.id,
          id_coluna
        }
      }
    });
  };

  const handleEditarTarefa = (tarefa) => {
    setTarefaModal({
      open: true,
      data: {
        mode: 'edit',
        initialValues: { ...tarefa }
      }
    });
  }

  const handleFecharTarefaModal = () => {
    setTarefaModal({
      open: false,
      data: {}
    });
  }

  const handleNovaColuna = () => {
    setColunaModal({
      open: true,
      data: {
        mode: 'create',
        initialValues: {
          id_espaco: espaco.id,
        }
      }
    });
  };

  const handleEditarColuna = (coluna) => {
    setColunaModal({
      open: true,
      data: {
        mode: 'edit',
        initialValues: { ...coluna }
      }
    });
  };

  const handleFecharColunaModal = () => {
    setColunaModal({
      open: false,
      data: {}
    });
  }

  const handleOptionClick = (option) => {
    const coluna = menu.coluna;

    handleCloseMenu();

    if (!coluna) return;

    option.handleClick(coluna);

  }

  const options = [
    { label: 'Adicionar tarefa', icon: AddIcon, handleClick: (coluna) => handleNovaTarefa(coluna.id) },
    { label: 'Editar coluna', icon: EditIcon, handleClick: (coluna) => handleEditarColuna(coluna) },
  ];

  const handleDragEnd = (event) => {
    if (event.canceled) return;

    const id = Number(event.operation.source.id.split(':').pop());
    const id_coluna = Number((event.operation.target.type == 'column' ? event.operation.target.id : event.operation.target.group).split(':').pop());
    const ordem = Number(event.operation.target.index ?? 0);
    const tarefa = tarefas.find(tarefa => tarefa.id == id);

    if (tarefa.ordem == ordem && tarefa.id_coluna == id_coluna) {
      return;
    }

    const data = { id };

    if (tarefa.ordem != ordem) data.ordem = ordem;
    if (tarefa.id_coluna != id_coluna) data.id_coluna = id_coluna;

    // const coluna = colunas.find(coluna => coluna.id == event.operation.target.id.split(':').pop());

    try {
      setIsLoading(true);
      const res = authAxios('put', '/api/tarefas/editarTarefa', data);
    } catch (error) {
      catchAuthAxios(error, 'Erro ao mover tarefa');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Tarefas</title>
        <meta name="description" content="Tela de tarefas" />
      </Head>

      <Dialog open={tarefaModal.open} onClose={handleFecharTarefaModal} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { p: 3, position: 'relative' } } }} >
        <ModalCloseButton onClick={handleFecharTarefaModal} />
        <TarefaFormulario
          mode={tarefaModal.data?.mode}
          initialValues={tarefaModal.data?.initialValues}
          onClose={handleFecharTarefaModal}
          colunas={colunas}
          writePermission={writePermission}
        />
      </Dialog>

      <Dialog open={colunaModal.open} onClose={handleFecharColunaModal} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { p: 3, position: 'relative' } } }} >
        <ModalCloseButton onClick={handleFecharColunaModal} />
        <ColunaFormulario
          mode={colunaModal.data?.mode}
          initialValues={colunaModal.data?.initialValues}
          onClose={handleFecharColunaModal}
          writePermission={writePermission}
        />
      </Dialog>

      <Menu open={Boolean(menu.anchorEl)} onClose={handleCloseMenu} anchorEl={menu.anchorEl}>
        {options.map(option => {
          const Icon = option.icon;

          return (
            <MenuItem key={option.label} onClick={() => handleOptionClick(option)} >
              <Stack direction='row' spacing={2} justifyContent='start'>
                <Icon />
                <Typography>{option.label}</Typography>
              </Stack>
            </MenuItem>
          )
        })}
      </Menu>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', overflowY: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', py: 1, }} >
          {isLoading ? <Loading /> : colunas.length !== 0 && colunas.filter(coluna => coluna?.ativo === true)?.map(coluna => (
            <Coluna
              espaco={espaco}
              coluna={coluna}
              key={`coluna:${coluna.id}`}
              tarefas={tarefas}
              handleOpenMenu={handleOpenMenu}
              handleNovaTarefa={handleNovaTarefa}
              handleEditarTarefa={handleEditarTarefa}
              writePermission={writePermission}
            />
          ))}
          <Box key='nova-coluna' {...colunaBoxProps({ id: 'nova-coluna', nome: 'Nova Coluna' })}>
            <Button
              variant='text'
              startIcon={<AddIcon />}
              fullWidth
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              onClick={handleNovaColuna}
              disabled={writePermission === false}
            >
              Adicionar Coluna
            </Button>
          </Box>
        </Stack>
      </DragDropProvider>

    </>
  );
}

export const getServerSideProps = async () => ({
  props: {},
});
