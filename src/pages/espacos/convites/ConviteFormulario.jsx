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

const ConviteFormulario = ({ mode = 'create', initialValues = defaultValues, onConviteCriado }) => {
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
        const res = await authAxios('get', `/api/usuarios/listarUsuarios?${params.toString()}`);
        setUsuarios(res?.data?.data ?? []);
      } catch (error) {
        console.log(error?.response || error);
        toast.error(error?.response?.data?.mensagem || 'Erro ao buscar usuários');
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

      await authAxios('post', '/api/espacos/convites/criarConvite', {
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
      console.log(error?.response || error);
      toast.error(error?.response?.data?.mensagem || 'Erro ao criar convite');
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
            sx={{ width: { xs: '100%', md: 360 } }}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="Nenhum usuário encontrado"
            onChange={(_, value) => field.onChange(value)}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') {
                setSearchTerm(value);
              }
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={option.src || undefined} alt={option.nome} sx={{ width: 28, height: 28 }}>
                    {option.nome ? option.nome.charAt(0).toUpperCase() : '?'}
                  </Avatar>
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
          <FormControl sx={{ minWidth: 145 }} disabled={isLoading}>
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
        disabled={isLoading}
        sx={{ minWidth: 130, height: 40 }}
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
