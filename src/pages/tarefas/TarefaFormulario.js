"use client";

// React/JS
import { useState } from "react";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import axios from 'axios';

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";

// Componentes
import Loading from '@/components/Loading';
import TarefaArquivos from "./TarefaArquivos";


const TarefaFormulario = ({
  mode = 'create',
  initialValues = { titulo: "", descricao: "" },
  onClose,
}) => {
  const [values, setValues] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);

  const dateFormat = 'DD/MM/YYYY HH:mm:ss';

  const handleChange = (field) => (event) => {
    setValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const criarTarefa = async (values) => {
    try {
      setIsLoading(true);
      const res = await axios.post('/api/tarefas/criarTarefa', values);
      toast.success('Tarefa criada');
      return true;
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.mensagem || 'Erro ao inserir tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const editarTarefa = async (values) => {
    try {
      setIsLoading(true);
      const res = await axios.put('/api/tarefas/editarTarefa', values);
      toast.success('Tarefa editada');
      return true;
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.mensagem || 'Erro ao editar tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeletarTarefa = async () => {
    try {
      if(!confirm("Deseja mesmo deletar a tarefa?")) return;
      setIsLoading(true);
      const res = await axios.delete(`/api/tarefas/deletarTarefa?id=${values.id}`);
      toast.success('Tarefa deletada');
      onClose();
      return true;
    } catch (error) {
      console.log(error.response || error);
      toast.error(error.response?.data?.mensagem || 'Erro ao deletar tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const buttons = {
    'create': [
      <Button key='criar tarefa' variant='contained' color='success' type='submit' >Criar</Button>
    ],
    'edit': [
      <Button key='editar tarefa' variant='contained' color='success' type='submit' >Salvar</Button>,
      <Button key='copiar tarefa' variant='contained' color='dark' type='button' onClick={() => toast.info('Ainda não implementado')} >Copiar</Button>,
      <Button key='deletar tarefa' variant='contained' color='error' type='button' onClick={handleDeletarTarefa} >Deletar</Button>
    ]
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Dados do formulário:", values);

    switch(mode) {
      case 'create':
        const createOk = await criarTarefa(values);
        if(createOk) onClose();
        break;
      case 'edit':
        const editOk = await editarTarefa(values);
        if(editOk) onClose();
        break;
      default:
        toast.error('Modo inválido de formulário!');  
    }
  };

  const renderizarFormulario = () => {
    return (
      <>
        <Typography component="h1" variant="h4" align='center'>
          {mode === 'edit' ? 'Editar tarefa' : 'Criar tarefa'}
        </Typography>

        <Stack direction='row' spacing={2} >
          {buttons[mode]}
        </Stack>

        <TextField
          label="Título"
          name="titulo"
          value={values.titulo}
          onChange={handleChange("titulo")}
          fullWidth
          required
        />

        <TextField
          label="Descrição"
          name="descricao"
          value={values.descricao}
          onChange={handleChange("descricao")}
          fullWidth
          required
          multiline
          minRows={4}
        />

        <TextField
          label="Cadastro"
          name="data_cadastro"
          value={values.data_cadastro ? dayjs(values.data_cadastro).format(dateFormat) : ''}
          fullWidth
          disabled
        />

        <TextField
          label="Atualização"
          name="data_atualizacao"
          value={values.data_atualizacao ? dayjs(values.data_atualizacao).format(dateFormat) : ''}
          fullWidth
          disabled
        />
      </>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%", maxWidth: 520, mx: "auto", }}
    >
      <Stack spacing={2.5}>
        {renderizarFormulario()}
        {mode !== 'create' ? <TarefaArquivos /> : <></>}
        {isLoading ? <Loading /> : <></>}
      </Stack>
    </Box>
  );
}

export default TarefaFormulario;