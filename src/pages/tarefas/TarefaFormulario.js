// React/JS
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import { Controller, useForm } from 'react-hook-form';

// MUI
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Componentes
import Loading from '@/components/Loading';
import TarefaArquivos from "./arquivos";

// Utils
import authAxios from "@/utils/authAxios";
import catchAuthAxios from '@/utils/catchAxios';
import columnType from "@/utils/columnType";
import { formatDateTime } from "@/utils/formatDate";

// const defaultValues = { titulo: '', descricao: '' };

const defaultValues = {
  create: ['titulo','descricao','id_coluna','id_espaco'],
  edit: ['id','titulo', 'descricao','id_coluna','ordem']

};

const TarefaFormulario = ({ mode = 'create', initialValues = null, onClose, colunas }) => {

  const { control, reset, register, handleSubmit, getValues } = useForm({ defaultValues: initialValues });

  const [isLoading, setIsLoading] = useState(false);
  const valoresSalvos = useRef({});

  useEffect(() => {
    const obj = {};

    for(const key of defaultValues[mode]){
      obj[key] = initialValues?.[key] ?? null;
    }

    reset(obj);
    valoresSalvos.current = obj;

  }, [initialValues, mode, reset]);

  const criarTarefa = async (data) => {
    try {
      setIsLoading(true);
      const res = await authAxios('post', '/api/tarefas/criarTarefa', data);
      return true;
    } catch (error) {
      catchAuthAxios(error, 'Erro ao inserir tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const salvarCampo = async (campo, valor) => {
    if (mode !== 'edit') return;

    const id = getValues('id');
    if (!id) return;

    if (valoresSalvos.current[campo] === valor) return;

    try {
      setIsLoading(true);
      await authAxios('put', '/api/tarefas/editarTarefa', {
        id,
        [campo]: valor
      });
      valoresSalvos.current[campo] = valor;
      return true;
    } catch (error) {
      catchAuthAxios(error, 'Erro ao editar tarefa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletarTarefa = async () => {
    try {
      if (!confirm("Deseja mesmo deletar a tarefa?")) return;

      const id = getValues('id');
      if (!id) return;

      setIsLoading(true);
      const res = await authAxios('delete', `/api/tarefas/deletarTarefa?id=${id}`);
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
      <Button key='deletar tarefa' variant='contained' color='error' type='button' onClick={handleDeletarTarefa} >Deletar</Button>
    ]
  };

  const onSubmit = async (data) => {
    switch (mode) {
      case 'create':
        const createOk = await criarTarefa(data);
        if (createOk) onClose();
        break;
      case 'edit':
        break;
      default:
        toast.error('Modo inválido de formulário!');
    }
  };

  const renderizarFormulario = () => {
    const tituloRegister = register("titulo");
    const descricaoRegister = register('descricao');

    return (
      <Stack spacing={2.5}>
        {/* Botões */}
        <Stack direction='row' spacing={2} >
          {buttons[mode]}
        </Stack>
        {/* Campos */}
        <Grid container spacing={2.5}>
          {/* Campos de texto */}
          <Grid size={{ sx: 12, md: 9 }}>
            <Stack spacing={2.5}>
              {/* Título e coluna */}
              <TextField
                label="Título"
                name="titulo"
                {...tituloRegister}
                onBlur={(e) => {
                  tituloRegister.onBlur(e);
                  salvarCampo('titulo', e.target.value);
                }}
                fullWidth
                required
              />
              {/* Descrição */}
              <TextField
                label="Descrição"
                name="descricao"
                {...descricaoRegister}
                onBlur={(e) => {
                  descricaoRegister.onBlur(e);
                  salvarCampo('descricao', e.target.value);
                }}
                fullWidth
                required
                multiline
                minRows={4}
              />
              <Stack direction='row' alignItems='center' spacing={2.5}>
                <TextField
                  label="Cadastro"
                  name="data_cadastro"
                  value={formatDateTime(getValues('data_cadastro'))}
                  fullWidth
                  disabled
                />

                <TextField
                  label="Atualização"
                  name="data_atualizacao"
                  value={formatDateTime(getValues('data_atualizacao'))}
                  fullWidth
                  disabled
                />
              </Stack>
            </Stack>
          </Grid>
          {/* Campos personalizados */}
          <Grid size={{ sx: 12, md: 3 }}>
            <Controller
              name='id_coluna'
              control={control}
              rules={{ required: 'Selecione uma coluna ' }}
              render={({ field }) => (
                <FormControl fullWidth required disabled={isLoading}>
                  <InputLabel id='tarefa-id-coluna'>Coluna</InputLabel>
                  <Select
                    {...field}
                    labelId='tarefa-id-coluna'
                    label='Coluna'
                    value={field.value || ''}
                    onChange={(e) => {
                      field.onChange(e);
                      salvarCampo('id_coluna', e.target.value);
                    }}
                  >
                    {colunas?.filter(coluna => coluna.ativo === true)?.map(coluna => (
                      <MenuItem key={`coluna-${coluna.id}`} value={coluna.id}>
                        <Button color={columnType[coluna.tipo]} type='button' variant='contained'>{coluna.nome}</Button>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: "100%", mx: "auto", }} >
      <Stack spacing={2.5}>
        <form onSubmit={handleSubmit(onSubmit)} >
          <Typography component="h1" variant="h4" align='center'>
            {mode === 'edit' ? 'Editar tarefa' : 'Criar tarefa'}
          </Typography>
          {renderizarFormulario()}
        </form>
        {mode !== 'create' ? <TarefaArquivos tarefa={getValues()} /> : <></>}
        {isLoading ? <Loading /> : <></>}
      </Stack>
    </Box>
  );
}

export default TarefaFormulario;

export const getServerSideProps = async () => ({
  notFound: true,
});
