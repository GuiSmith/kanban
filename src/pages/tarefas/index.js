"use client";
//Next
import Head from "next/head";
import axios from 'axios';
import dayjs from 'dayjs';

// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';

// React
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// UI Personalizado
import Loading from '@/components/Loading';
import TaskForm from "@/components/form/TaskForm";
import { toast } from 'react-toastify';


export default function TarefasPage() {
  const [tarefas, setTarefas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({});

  const dateFormat = 'DD/MM/YYYY HH:mm:ss';

  useEffect(() => {

    const socket = io({ path: '/api/socketio' });

    socket.emit('join_tarefas');

    socket.on('tarefas', payload => {

      console.debug(payload);

      switch(payload.op) {
        case 'DELETE':
          setTarefas(prev => prev.filter(tarefa => tarefa.id !== payload.data.id));
          break;
        case 'UPDATE':
          setTarefas(tarefas => tarefas.map(tarefa => {
            if (tarefa.id == payload.data.id) {
              return {
                ...tarefa,
                ...payload.data,
              };
            }
            return tarefa;
          }));
          break;
        case 'INSERT':
          setTarefas(tarefas => [ ...tarefas, { ...payload.data } ]);
          break;
      }
    });

    const fetchTarefas = async () => {
      try {
        setIsLoading(true);
        const res = await axios.post('/api/tarefas/listarTarefas');
        setTarefas(res.data.data);
      } catch (error) {
        console.log(error.response);
        toast.error(error.response?.data?.mensagem || 'Erro ao listar tarefas');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTarefas();

    return () => {
      socket.emit('leave_tarefas');
      socket.disconnect();
    }
  }, []);

  const handleNovaTarefa = () => {
    console.log('Nova tarefa selecionada');

    setTaskFormData({
      formTitle: 'Criar tarefa',
      buttons: [
        <Button key='criar tarefa' variant='contained' color='success' type='submit' >Criar</Button>
      ],
      initialValues: {},
      onSubmit: (values) => submitNovaTarefa(values)
    });

    setIsModalOpen(true);

  };

  const handleEditarTarefa = (tarefa) => {

    setTaskFormData({
      formTitle: 'Editar tarefa',
      buttons: [
        <Button key='editar tarefa' variant='contained' color='success' type='submit' >Editar</Button>,
        <Button key='deletar tarefa' variant='contained' color='error' onClick={() => handleDeletarTarefa(tarefa.id)} >Deletar</Button>
      ],
      initialValues: { ...tarefa },
      onSubmit: (values) => submitEditarTarefa(values)
    });

    setIsModalOpen(true);
  }

  const handleDeletarTarefa = async (id) => {
    try {
      const res = await axios.delete(`/api/tarefas/deletarTarefa?id=${id}`);
      toast.success('Tarefa deletada');
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.mensagem || 'Erro ao deletar tarefa');
    } finally {
      setIsModalOpen(false);
    }
  }

  const handleFecharModal = () => {
    setTaskFormData({});
    setIsModalOpen(false);
  }

  const submitNovaTarefa = async (values) => {
    try {
      const res = await axios.post('/api/tarefas/criarTarefa', values);
      toast.success('Tarefa criada');
      setIsModalOpen(false);
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.mensagem || 'Erro ao inserir tarefa');
    }
  }

  const submitEditarTarefa = async (values) => {
    try {
      const res = await axios.put('/api/tarefas/editarTarefa', values);
      toast.success('Tarefa editada');
      setIsModalOpen(false);
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.mensagem || 'Erro ao editar tarefa');
    }
  }

  const buttons = [
    <Button key='criar' onClick={handleNovaTarefa}> Criar tarefa</Button>
  ];

  return (
    <section>
      <Head>
        <title>Tarefas</title>
        <meta name="description" content="Tela de tarefas" />
      </Head>

      <Container maxWidth="lg" component="main" sx={{ py: 4 }}>

        <Dialog
          open={isModalOpen}
          onClose={handleFecharModal}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                p: 3,
              },
            },
          }}
        >
          <TaskForm
            formTitle={taskFormData?.formTitle}
            buttons={taskFormData?.buttons}
            initialValues={taskFormData?.initialValues}
            onSubmit={taskFormData?.onSubmit}
          />
        </Dialog>
        <Typography component="h1" variant="h3" align="center" sx={{ mb: 4 }}>
          Tarefas
        </Typography>

        <ButtonGroup orientation="horizontal" sx={{ mb: 3 }}>
          {buttons}
        </ButtonGroup>

        {tarefas.length === 0 ? (
          isLoading ? <Loading /> : <Typography variant="body1" align="center"> Nenhuma tarefa encontrada. </Typography>
        ) : (
          <Grid container spacing={3}>
            {tarefas.map((tarefa) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tarefa.id}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent onClick={() => handleEditarTarefa(tarefa)}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {tarefa.titulo || "Sem titulo"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tarefa.descricao || "Sem descricao"}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Cadastro: {dayjs(tarefa.data_cadastro).format(dateFormat)}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Atualizado em: {dayjs(tarefa.data_atualizacao).format(dateFormat)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </section>
  );
}
