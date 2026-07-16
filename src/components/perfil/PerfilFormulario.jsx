import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Loading from '@/components/common/Loading';
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import PerfilImagemFormulario from './PerfilImagemFormulario';

const defaultValues = {
  nome: '',
  email: '',
  username: '',
  src: null,
};

const PerfilFormulario = ({
  mode = 'edit',
  initialValues = defaultValues,
  onPerfilAtualizado,
  isLoading,
  setIsLoading,
}) => {

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

  useEffect(() => {
    reset(initialValues ? initialValues : defaultValues);
  }, [initialValues, reset]);

  const onSubmit = async (data) => {
    if (mode !== 'edit') {
      toast.error('Modo inválido de formulário!');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        nome: data.nome,
        email: data.email,
        username: data.username,
      };

      const res = await authAxios('put', '/api/usuarios/editarPerfil', payload);
      const perfil = res?.data?.data;

      toast.success('Perfil editado');
      onPerfilAtualizado?.(perfil);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kanban-profile-change', { detail: perfil }));
      }
    } catch (error) {
      catchAuthAxios(error, 'Erro ao salvar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Stack spacing={2.5}>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success" type="submit" disabled={isLoading}>
                Salvar
              </Button>
            </Stack>

            <TextField
              label="Nome"
              fullWidth
              required
              disabled={isLoading}
              error={!!errors.nome}
              helperText={errors.nome?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              {...register('nome', {
                required: 'Nome é obrigatório.',
                maxLength: {
                  value: 255,
                  message: 'Nome deve ter no máximo 255 caracteres.',
                },
              })}
            />

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              disabled={isLoading}
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              {...register('email', {
                required: 'E-mail é obrigatório.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Informe um e-mail válido.',
                },
                maxLength: {
                  value: 100,
                  message: 'E-mail deve ter no máximo 100 caracteres.',
                },
              })}
            />

            <TextField
              label="Username"
              fullWidth
              required
              disabled={isLoading}
              error={!!errors.username}
              helperText={errors.username?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              {...register('username', {
                required: 'Username é obrigatório.',
                pattern: {
                  value: /^[A-Za-z0-9_]+$/,
                  message: 'Usuário deve ter apenas letras e números.',
                },
                maxLength: {
                  value: 15,
                  message: 'Username deve ter no máximo 15 caracteres.',
                },
              })}
            />
          </Stack>
        </Box>
      </Stack>

      {isLoading ? <Loading /> : <></>}
    </Box>
  );
};

export default PerfilFormulario;
