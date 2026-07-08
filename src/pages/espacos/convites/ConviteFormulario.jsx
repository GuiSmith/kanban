import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';

import getNameInitials from '@/utils/getNameInitials';

const defaultValues = {
  id_espaco: null,
  usuario: null,
  enviar_email: false,
};

const getOptionLabel = (option) => {
  if (!option) return '';

  const username = option.username ? `@${option.username}` : '';
  return [option.nome, username, option.email].filter(Boolean).join(' - ');
};

const ConviteFormulario = ({ mode = 'create', initialValues = defaultValues, onConviteCriado, writePermission }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  useEffect(() => {
    reset(initialValues ? { ...defaultValues, ...initialValues } : defaultValues);
  }, [initialValues, reset]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const termo = searchTerm.trim();

      if (termo.length < 2 || !initialValues?.id_espaco) {
        setUsuarios([]);
        return;
      }

      try {
        setIsSearching(true);

        const params = new URLSearchParams({
          termo,
          id_espaco: initialValues.id_espaco,
        });
        const res = await authAxios('get', `/api/usuarios/buscarUsuarios?${params.toString()}`);
        setUsuarios(res?.data?.data ?? []);
      } catch (error) {
        catchAuthAxios(error, 'Erro ao buscar usuários');
      } finally {
        setIsSearching(false);
      }
    };

    const timeout = setTimeout(fetchUsuarios, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm, initialValues]);

  const onSubmit = async (data) => {
    if (mode !== 'create') {
      toast.error('Modo inválido de formulário!');
      return;
    }

    try {
      setIsLoading(true);

      await authAxios('post', '/api/convites/criarConvite', {
        id_espaco: data.id_espaco,
        id_usuario: data.usuario?.id,
        enviar_email: Boolean(data.enviar_email),
      });

      toast.success('Convite criado');
      reset(initialValues ? { ...defaultValues, ...initialValues } : defaultValues);
      setSearchTerm('');
      setUsuarios([]);

      if (onConviteCriado) {
        await onConviteCriado();
      }
    } catch (error) {
      catchAuthAxios(error, 'Erro ao criar convite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack
      component="form"
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', md: 'center' }}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ minWidth: 0 }}
    >
      <Controller
        name="usuario"
        control={control}
        rules={{ required: 'Selecione um usuário.' }}
        render={({ field }) => (
          <Autocomplete
            {...field}
            loading={isSearching}
            options={usuarios}
            sx={{ flex: '1 1 460px', minWidth: { xs: 0, md: 420 } }}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Nenhum usuário encontrado"
            onChange={(_, value) => field.onChange(value)}
            disabled={isLoading || writePermission === false}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') {
                setSearchTerm(value);
              }
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ProfilePicture user={option} />
                  <span>{getOptionLabel(option)}</span>
                </Stack>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usuário"
                required
                error={!!errors.usuario}
                helperText={errors.usuario?.message}
              />
            )}
          />
        )}
      />

      <Controller
        name="enviar_email"
        control={control}
        render={({ field }) => (
          <FormControl sx={{ flex: { xs: '1 1 auto', md: '0 0 170px' }, minWidth: 170 }} disabled={isLoading || writePermission === false}>
            <InputLabel id="convite-enviar-email-label">Enviar e-mail</InputLabel>
            <Select
              labelId="convite-enviar-email-label"
              label="Enviar e-mail"
              value={field.value === true ? 'true' : 'false'}
              onChange={(event) => field.onChange(event.target.value === 'true')}
            >
              <MenuItem value="false">Não</MenuItem>
              <MenuItem value="true">Sim</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<PersonAddAltIcon />}
        disabled={isLoading || writePermission === false}
        sx={{ flex: { xs: '1 1 auto', md: '0 0 auto' }, minWidth: 130, height: 56 }}
      >
        Convidar
      </Button>
    </Stack>
  );
};

export default ConviteFormulario;

export const getServerSideProps = async () => ({
  notFound: true,
});
