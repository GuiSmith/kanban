// Next
import Head from "next/head";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from '@dnd-kit/helpers';
import { useSortable } from '@dnd-kit/react/sortable';
import { CollisionPriority } from '@dnd-kit/abstract';

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
import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { io } from 'socket.io-client';

// UI Personalizado
import Loading from '@/components/common/Loading';
import ModalCloseButton from '@/components/common/ModalCloseButton';
import TarefaFormulario from "../../components/tarefas/TarefaFormulario";
import ColunaFormulario from "../../components/tarefas/ColunaFormulario";

// Utils
import authAxios from "@/utils/authAxios";
import catchAuthAxios from '@/utils/catchAxios';
import columnType from "@/utils/columnType";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { formatDate } from "@/utils/formatDate";
import ProfilePicture from "@/components/common/ProfilePicture";

const hoverOpacity = 0.5;

const colunaBoxProps = (coluna, isDropTarget, isDragging) => ({
  size: { xs: 12, sm: 6, md: 2 },
  sx: {
    minWidth: '250px',
    maxWidth: '250px',
    overflow: 'hidden',
    position: 'relative',
    mb: 3,
    px: 1,
    border: 1,
    borderColor: `${columnType[coluna.tipo] ?? 'default'}.main`,
    borderRadius: 1,
    opacity: isDropTarget || isDragging ? hoverOpacity : 1,
  }
});

const tarefaCardProps = (tarefa, isDragging) => ({
  elevation: 4,
  sx: {
    cursor: "pointer",
    opacity: isDragging ? hoverOpacity : 1,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: 8,
    },
  }
});

const Coluna = memo(({ children, id, index, coluna, qtdTarefas, handleOpenMenu, writePermission }) => {

  const { ref, isDragging, isDropTarget, handleRef } = useSortable({
    id,
    index,
    type: 'coluna',
    collisionPriority: CollisionPriority.Low,
    accept: ['tarefa', 'coluna'],
    disabled: writePermission === false
  });

  return (
    <Box ref={ref} {...colunaBoxProps(coluna, isDropTarget, isDragging)} >
      {/* Header */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
      >
        <Tooltip title={`${coluna.id} - ${capitalizeFirstLetter(coluna.nome)}`}>
          <Typography variant="h6" sx={{ cursor: 'grab' }} ref={handleRef} >
            {capitalizeFirstLetter(coluna.nome)}
          </Typography>
        </Tooltip>
        <Stack direction='row' spacing={0.1} alignItems='center' >
          <Tooltip title={`Esta coluna tem ${qtdTarefas} tarefas`}>
            <IconButton size='small'>
              {qtdTarefas}
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
        {children}
      </Stack>
    </Box>
  );

});

const TarefaCard = memo(({ id, espaco, index, tarefa, idColuna, handleEditarTarefa, writePermission }) => {

  const { ref, isDragging } = useSortable({
    id,
    index,
    type: 'tarefa',
    accept: 'tarefa',
    group: idColuna,
    disabled: writePermission === false
  });

  return (
    <Card ref={ref} {...tarefaCardProps(tarefa, isDragging)} data-dragging={isDragging} >
      <CardContent onClick={() => handleEditarTarefa(tarefa)} sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        <Typography variant="h6" component="h2">{tarefa.titulo}</Typography>
        <Typography variant="caption" display="block" color="text.secondary">{tarefa.data_limite ? `Data limite: ${formatDate(tarefa.data_limite)}` : null}</Typography>
        <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1} >
          <Typography color='info'>{espaco.sigla}-{tarefa.id}</Typography>
          <ProfilePicture size='small' user={tarefa?.usuario} />
        </Stack>
      </CardContent>
    </Card>
  );
});

const fetchTarefas = async (id_espaco) => {
  try {
    const urlParams = new URLSearchParams({ id_espaco });
    const res = await authAxios('get', `/api/tarefas/listarTarefas?${urlParams.toString()}`);
    return res.data.data;
  } catch (error) {
    catchAuthAxios(error, 'Erro ao listar tarefas');
  }
};

// Buscar tarefas, colunas e usuários
const fetchColunas = async (id_espaco) => {
  try {
    const urlParams = new URLSearchParams({ id_espaco });
    const res = await authAxios('get', `/api/colunas/listarColunas?${urlParams.toString()}`);
    return res.data.data;
  } catch (error) {
    catchAuthAxios(error, 'Erro ao listar colunas');
  }
};

const fetchUsuarios = async (id_espaco) => {
  try {
    const urlParams = new URLSearchParams({ id_espaco });
    const res = await authAxios('get', `/api/espacos/listarUsuarios?${urlParams.toString()}`);
    return res.data.data;
  } catch (error) {
    catchAuthAxios(error, 'Erro ao listar colunas');
  }
};

export default function TarefasPage({ espaco, writePermission }) {

  // Dados
  const [espacoUsuarios, setEspacoUsuarios] = useState([]);
  const [tarefasPorColuna, setTarefasPorColuna] = useState({});
  const [colunas, setColunas] = useState([]);
  const [idColunas, setIdColunas] = useState([]);

  // Menus
  const [isLoading, setIsLoading] = useState(false);
  const [tarefaModal, setTarefaModal] = useState({ open: false, data: {} });
  const [colunaModal, setColunaModal] = useState({ open: false, data: {} });
  const [menu, setMenu] = useState({ anchorEl: null, coluna: null });

  const arrastandoTarefa = useRef(false);
  const precisaAtualizarTarefas = useRef(false);
  const precisaAtualizarColunas = useRef(false);

  useEffect(() => {
    const socket = io({
      path: '/api/socketio',
    });

    socket.emit('join_tarefas');

    socket.on('tarefas', payload => {
      if (payload.entity === 'coluna') {
        switch (payload.op) {
          case 'INSERT':
            setColunas(colunas => [...colunas, { ...payload.data }]);
            setIdColunas(idColunas => [...idColunas, payload.data.id]);
            setTarefasPorColuna(prev => ({ ...prev, [payload.data.id]: [] }));
            break;
          case 'UPDATE':
            setColunas(colunas => colunas.map(coluna => {
              if (coluna.id == payload.data.id) {
                return {
                  ...coluna,
                  ...payload.data,
                };
              }
              return coluna;
            }));

            if (payload.data.ativo === false) {
              setIdColunas(prev => prev.filter(idColuna => idColuna !== payload.data.id));
              setTarefasPorColuna(prev => {
                delete prev?.[payload.data.id];

                return prev;
              });
            }
            break;
          case 'DELETE':
            setColunas(prev => prev.filter(coluna => coluna.id !== payload.data.id));
            setIdColunas(prev => prev.filter(idColuna => idColuna !== payload.data.id));
            setTarefasPorColuna(prev => {
              delete prev?.[payload.data.id];

              return prev;
            });
          default:
            console.error('Operação desconhecida: ', payload.op);
        }
        return;
      }

      if (payload.entity === 'tarefa') {
        setTarefasPorColuna(prev => {
          const map = {};

          // Copia os arrays para não alterar o estado anterior diretamente
          for (const idColuna in prev) {
            map[idColuna] = [...prev[idColuna]];
          }

          const idTarefa = payload.data.id;

          switch (payload.op) {
            case 'DELETE': {
              for (const idColuna in map) {
                map[idColuna] = map[idColuna].filter(
                  tarefa => Number(tarefa.id) !== Number(idTarefa)
                );
              }

              break;
            }

            case 'UPDATE': {
              let tarefaAtual = null;

              // Procura e remove a tarefa da posição/coluna antiga
              for (const idColuna in map) {
                const index = map[idColuna].findIndex(
                  tarefa => Number(tarefa.id) === Number(idTarefa)
                );

                if (index >= 0) {
                  tarefaAtual = map[idColuna][index];
                  map[idColuna].splice(index, 1);
                  break;
                }
              }

              const tarefaAtualizada = {
                ...tarefaAtual,
                ...payload.data,
              };

              tarefaAtualizada.usuario = espacoUsuarios.find(
                usuario =>
                  Number(usuario.id) === Number(tarefaAtualizada.id_responsavel)
              );

              const idColunaNova = tarefaAtualizada.id_coluna;

              // Ignora tarefas de colunas que não estão sendo exibidas
              if (map[idColunaNova]) {
                map[idColunaNova].push(tarefaAtualizada);
              }

              break;
            }

            case 'INSERT': {
              const novaTarefa = {
                ...payload.data,
                usuario: espacoUsuarios.find(
                  usuario =>
                    Number(usuario.id) === Number(payload.data.id_responsavel)
                ),
              };

              const idColuna = novaTarefa.id_coluna;

              if (map[idColuna]) {
                map[idColuna].push(novaTarefa);
              }

              break;
            }

            default:
              return prev;
          }

          for (const idColuna in map) {
            map[idColuna].sort(
              (a, b) => Number(a.ordem) - Number(b.ordem)
            );
          }

          return map;
        });

        return;
      }

      console.error('Tipo de identidade desconhecido');
    });

    return () => {
      socket.emit('leave_tarefas');
      socket.off('tarefas');
      socket.disconnect();
    };
  }, [espacoUsuarios]);

  // Buscar tarefas, colunas e usuários
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tarefas, colunas, usuarios] = await Promise.all([
        await fetchTarefas(espaco.id),
        await fetchColunas(espaco.id),
        await fetchUsuarios(espaco.id),
      ]);

      // Atribuindo responsáveis aos cartões
      for (const tarefa of tarefas) {
        const usuario = usuarios.find(u => Number(u.id) === Number(tarefa.id_responsavel));

        if (usuario) {
          tarefa.usuario = usuario;
        }
      }


      const colunasAtivas = colunas.filter(coluna => coluna.ativo === true);

      const map = {};
      for (const coluna of colunasAtivas) {
        if (coluna.ativo) {
          map[coluna.id] = tarefas.filter(tarefa => Number(tarefa.id_coluna) === Number(coluna.id)) ?? [];
          map[coluna.id].sort((a, b) => a.ordem - b.ordem);
        }
      }

      setIdColunas(colunasAtivas.map(col => col.id));
      setColunas(colunasAtivas);
      setTarefasPorColuna(map);
      setEspacoUsuarios(usuarios);
    } catch (error) {
      catchAuthAxios(error, 'Erro ao listar dados do quadro');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [espaco]);

  useEffect(() => {
    if (arrastandoTarefa.current === true) {
      precisaAtualizarTarefas.current = true;
    }
  }, [tarefasPorColuna]);

  useEffect(() => {
    precisaAtualizarColunas.current = true;
  }, [idColunas]);

  const handleOpenMenu = useCallback((event, coluna) => {
    setMenu({ anchorEl: event.currentTarget, coluna });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenu({ anchorEl: null, coluna: null });
  }, []);

  const handleNovaTarefa = useCallback((id_coluna) => {
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
  }, [espaco]);

  const handleEditarTarefa = useCallback((tarefa) => {
    setTarefaModal({
      open: true,
      data: {
        mode: 'edit',
        initialValues: { ...tarefa }
      }
    });
  }, []);

  const handleFecharTarefaModal = useCallback(() => {
    setTarefaModal({
      open: false,
      data: {}
    });
  }, []);

  const handleNovaColuna = useCallback(() => {
    setColunaModal({
      open: true,
      data: {
        mode: 'create',
        initialValues: {
          id_espaco: espaco.id,
        }
      }
    });
  }, [espaco]);

  const handleEditarColuna = useCallback((coluna) => {
    setColunaModal({
      open: true,
      data: {
        mode: 'edit',
        initialValues: { ...coluna }
      }
    });
  }, []);

  const handleFecharColunaModal = useCallback(() => {
    setColunaModal({
      open: false,
      data: {}
    });
  }, []);

  const handleOptionClick = useCallback((option) => {
    const coluna = menu.coluna;

    handleCloseMenu();

    if (!coluna) return;

    option.handleClick(coluna);

  }, [menu, handleCloseMenu]);

  const atualizarTarefas = useCallback(async () => {
    try {
      const data = {
        id_espaco: espaco.id,
        tarefas: []
      };

      for (const idColuna in tarefasPorColuna) {
        const tarefas = tarefasPorColuna[idColuna];

        tarefas.forEach((tarefa, index) => {
          const mudouOrdem = Number(tarefa.ordem) !== Number(index);
          const mudouColuna = Number(tarefa.id_coluna) !== Number(idColuna);
          if (mudouOrdem || mudouColuna) {
            data.tarefas.push({ id: tarefa.id, ordem: index, id_coluna: idColuna });
          }
        });
      }

      if (data.tarefas.length === 0) {
        return;
      }

      const res = await authAxios('PATCH', '/api/tarefas/atualizarTarefasEmMassa', data);
    } catch (error) {
      catchAuthAxios(error, 'Erro ao atualizar tarefas');
    }
  }, [setIsLoading, tarefasPorColuna]);

  const atualizarColunas = useCallback(async () => {
    try {
      const data = {
        id_espaco: espaco.id,
        colunas: []
      };

      idColunas.forEach((idColuna, index) => {
        const coluna = colunas.find(col => Number(col.id) === idColuna);

        if (coluna && coluna.ordem !== index) {
          data.colunas.push({ id: coluna.id, ordem: index });
        }
      });

      const res = await authAxios('PATCH', '/api/colunas/atualizarColunasEmMassa', data);
    } catch (error) {
      catchAuthAxios();
    }
  }, [setIsLoading, idColunas]);

  const handleDragStart = () => {
    arrastandoTarefa.current = true;
  }

  const handleDragOver = (e) => {
    const { source, target } = e.operation;

    if (source?.id === target?.id && source?.type === target?.type) {
      return;
    }

    if (source?.type === 'tarefa') {
      setTarefasPorColuna(t => move(t, e));
    }

    if (source?.type === 'coluna') {
      setIdColunas(cols => move(cols, e));
    }

  };

  const handleDragEnd = async (e) => {
    if (precisaAtualizarTarefas.current === true) {
      console.log('Atualizando tarefas...');
      await atualizarTarefas();
      precisaAtualizarTarefas.current = false;
      arrastandoTarefa.current = false;
    }

    if (precisaAtualizarColunas.current === true) {
      await atualizarColunas();
      precisaAtualizarColunas.current = false;
    }

    const { source, target } = e.operation;

    if (e.canceled || source.type !== 'coluna') {
      return;
    }

  };

  const menuOptions = useMemo(() => [
    { label: 'Adicionar tarefa', icon: AddIcon, handleClick: (coluna) => handleNovaTarefa(coluna.id) },
    { label: 'Editar coluna', icon: EditIcon, handleClick: (coluna) => handleEditarColuna(coluna) },
  ], [handleNovaTarefa, handleNovaColuna]);

  return (
    <>
      <Head>
        <title>Tarefas</title>
        <meta name="description" content="Tela de tarefas" />
      </Head>

      {isLoading ? <Loading /> : null}

      <Dialog open={tarefaModal.open} onClose={handleFecharTarefaModal} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { p: 3, position: 'relative' } } }} >
        <ModalCloseButton onClick={handleFecharTarefaModal} />
        <TarefaFormulario
          mode={tarefaModal.data?.mode}
          initialValues={tarefaModal.data?.initialValues}
          onClose={handleFecharTarefaModal}
          colunas={colunas}
          writePermission={writePermission}
          usuarios={espacoUsuarios}
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
        {menuOptions.map(option => {
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

      <DragDropProvider onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} >
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', overflowY: 'hidden', justifyContent: 'flex-start', alignItems: 'flex-start', py: 1, }} >
          {idColunas.map((idColuna, index) => {
            const coluna = colunas.find(col => Number(col.id) == Number(idColuna));

            if (!coluna) return null;

            return (
              <Coluna
                id={idColuna}
                index={index}
                coluna={coluna}
                tarefas={tarefasPorColuna[idColuna]?.length ?? 0}
                key={idColuna}
                handleOpenMenu={handleOpenMenu}
                writePermission={writePermission}
              >
                {tarefasPorColuna[idColuna].map((tarefa, index) => (
                  <TarefaCard
                    id={tarefa.id}
                    espaco={espaco}
                    idColuna={idColuna}
                    tarefa={tarefa}
                    index={index}
                    key={tarefa.id}
                    handleEditarTarefa={handleEditarTarefa}
                    writePermission={writePermission}
                  />
                ))}
                <Card sx={{ textAlign: 'start' }} key='nova-tarefa' >
                  <Button
                    onClick={() => handleNovaTarefa(idColuna)}
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
              </Coluna>
            )
          })}
          {writePermission === false ? null : (
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
          )}
        </Stack>
      </DragDropProvider>

    </>
  );
}
