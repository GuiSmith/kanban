// React/JS
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";

// Componentes
import Loading from '@/components/Loading';
import TarefaArquivos from "./arquivos";

// Utils
import authAxios from "@/utils/authAxios";
import catchAuthAxios from '@/utils/catchAxios';

const defaultValues = { titulo: '', descricao: '' }

const TarefaFormulario = ({ mode = 'create', initialValues = null, onClose }) => {

  const { reset, register, handleSubmit, getValues } = useForm({ defaultValues: initialValues });

  const [isLoading, setIsLoading] = useState(false);

  const dateFormat = 'DD/MM/YYYY HH:mm:ss';

  useEffect(() => {
    reset(initialValues ? initialValues : defaultValues);
  },[initialValues]);

  const criarTarefa = async (data) => {
    try {
      setIsLoading(true);
      const res = await authAxios('post','/api/tarefas/criarTarefa', data);
      toast.success('Tarefa criada');
      return true;
    } catch (error) {
      catchAuthAxios(error, 'Erro ao inserir tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const editarTarefa = async (data) => {
    try {
      setIsLoading(true);
      const res = await authAxios('put','/api/tarefas/editarTarefa', data);
      toast.success('Tarefa editada');
      return true;
    } catch (error) {
      catchAuthAxios(error, 'Erro ao editar tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeletarTarefa = async () => {
    try {
      if(!confirm("Deseja mesmo deletar a tarefa?")) return;

      const id = getValues('id');
      if(!id) return;
      
      setIsLoading(true);
      const res = await authAxios('delete',`/api/tarefas/deletarTarefa?id=${id}`);
      toast.success('Tarefa deletada');
      onClose();
      return true;
    } catch (error) {
      catchAuthAxios(error, 'Erro ao deletar tarefa');
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
      <Button key='deletar tarefa' variant='contained' color='error' type='button' onClick={handleDeletarTarefa} >Deletar</Button>
    ]
  };

  const onSubmit = async (data) => {
    switch(mode) {
      case 'create':
        const createOk = await criarTarefa(data);
        if(createOk) onClose();
        break;
      case 'edit':
        const editOk = await editarTarefa(data);
        if(editOk) onClose();
        break;
      default:
        toast.error('Modo inválido de formulário!');  
    }
  };

  const renderizarFormulario = () => {
    return (
      <Stack spacing={2.5}>

        <Typography component="h1" variant="h4" align='center'>
          {mode === 'edit' ? 'Editar tarefa' : 'Criar tarefa'}
        </Typography>

        <Stack direction='row' spacing={2} >
          {buttons[mode]}
        </Stack>

        <TextField
          label="Título"
          name="titulo"
          { ...register("titulo") }
          fullWidth
          required
        />

        <TextField
          label="Descrição"
          name="descricao"
          { ...register('descricao') }
          fullWidth
          required
          multiline
          minRows={4}
        />

        <TextField
          label="Cadastro"
          name="data_cadastro"
          value={getValues('data_cadastro') ? dayjs(getValues('data_cadastro')).format(dateFormat) : ''}
          fullWidth
          disabled
        />

        <TextField
          label="Atualização"
          name="data_atualizacao"
          value={getValues('data_atualizacao') ? dayjs(getValues('data_atualizacao')).format(dateFormat) : ''}
          fullWidth
          disabled
        />
      </Stack>
    );
  }

  return (
    <Box sx={{ width: "100%", mx: "auto", }} >
      <Stack spacing={2.5}>
        <form onSubmit={handleSubmit(onSubmit)} >
          {renderizarFormulario()}
        </form>
        {mode !== 'create' ? <TarefaArquivos tarefa={ getValues() } /> : <></>}
        {isLoading ? <Loading /> : <></>}
      </Stack>
    </Box>
  );
}

export default TarefaFormulario;

export const getServerSideProps = async () => ({
  notFound: true,
});
