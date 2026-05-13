import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import Loading from '@/components/Loading';
import authAxios from '@/utils/authAxios';
import { ESPACO_ICONES } from './EspacosIcones';

const defaultValues = {
  nome: '',
  descricao: '',
  sigla: '',
  icon: '',
};

const EspacoFormulario = ({ modo = 'create', initialValues = defaultValues }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { ...defaultValues, ...initialValues } });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const requestConfig = {
        create: {
          method: 'post',
          url: '/api/espacos/criarEspaco',
          successMessage: 'Espaço criado',
        },
        edit: {
          method: 'put',
          url: '/api/espacos/editarEspaco',
          successMessage: 'Espaço editado',
        },
      };

      const config = requestConfig[modo];
      if (!config) {
        toast.error('Modo inválido de formulário!');
        return;
      }

      await authAxios(config.method, config.url, data);
      toast.success(config.successMessage);
    } catch (error) {
      console.log(error?.response || error);
      toast.error(error?.response?.data?.mensagem || 'Erro ao salvar espaço');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" type="submit" disabled={isLoading}>
            Salvar
          </Button>
        </Stack>

        <Controller
          name="icon"
          control={control}
          rules={{ required: 'Selecione um ícone' }}
          render={({ field }) => (
            <FormControl fullWidth required disabled={isLoading} error={!!errors.icon}>
              <InputLabel id="espaco-icon-label">Ícone</InputLabel>
              <Select
                {...field}
                labelId="espaco-icon-label"
                label="Ícone"
                value={field.value || ''}
              >
                {ESPACO_ICONES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <option.Icon fontSize="small" />
                      <span>{option.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.icon?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <TextField
          label="Nome"
          fullWidth
          required
          disabled={isLoading}
          error={!!errors.nome}
          helperText={errors.nome?.message}
          inputProps={{ maxLength: 50 }}
          {...register('nome', {
            required: 'Nome é obrigatório.',
            maxLength: {
              value: 50,
              message: 'Nome deve ter no máximo 50 caracteres.',
            },
          })}
        />

        <TextField
          label="Sigla"
          fullWidth
          required
          disabled={isLoading}
          error={!!errors.sigla}
          helperText={errors.sigla?.message}
          inputProps={{ maxLength: 2 }}
          {...register('sigla', {
            required: 'Sigla é obrigatória.',
            validate: (value) => value.length === 2 || 'Sigla deve ter exatamente 2 caracteres.',
          })}
        />

        <TextField
          label="Descrição"
          fullWidth
          required
          multiline
          minRows={3}
          disabled={isLoading}
          error={!!errors.descricao}
          helperText={errors.descricao?.message}
          inputProps={{ maxLength: 255 }}
          {...register('descricao', {
            required: 'Descrição é obrigatória.',
            maxLength: {
              value: 255,
              message: 'Descrição deve ter no máximo 255 caracteres.',
            },
          })}
        />
      </Stack>

      {isLoading ? <Loading /> : <></>}
    </Box>
  );
};

export default EspacoFormulario;

export const getServerSideProps = async () => ({
  notFound: true,
});
