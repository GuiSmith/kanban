import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import Loading from '@/components/common/Loading';
import ModalCloseButton from '@/components/common/ModalCloseButton';
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import { ESPACO_ICONES } from '../../utils/EspacosIcones';
import { useNavbar } from '@/contexts/NavbarContext';

const defaultValues = {
  nome: '',
  descricao: '',
  sigla: '',
  icon: '',
  ativo: true,
};

const EspacoFormulario = ({ modo = 'create', initialValues = defaultValues, writePermission }) => {

  const router = useRouter();
  const { refreshEspacos } = useNavbar();

  const [isLoading, setIsLoading] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues });

  useEffect(() => {
    reset(initialValues ? { ...defaultValues, ...initialValues } : defaultValues);
  }, [initialValues, reset]);

  const salvarEspaco = async (data) => {
    try {
      setIsLoading(true);

      const requestConfig = {
        create: {
          method: 'post',
          url: '/api/espacos/criarEspaco',
          successMessage: 'Espaço criado',
          onSuccess: async (id) => {
            await refreshEspacos();
            router.replace(`/espacos?id=${id}`);
          },
        },
        edit: {
          method: 'put',
          url: '/api/espacos/editarEspaco',
          successMessage: 'Espaço editado',
          onSuccess: async () => {
            await refreshEspacos();
          },
        },
      };

      const config = requestConfig[modo];
      if (!config) {
        toast.error('Modo inválido de formulário!');
        return;
      }

      const payload = modo === 'create' ? {
        nome: data.nome,
        descricao: data.descricao,
        sigla: data.sigla,
        icon: data.icon,
      } : {
        ...data,
        ativo: Boolean(data.ativo),
      };

      const res = await authAxios(config.method, config.url, payload);
      const espaco = res?.data?.data;
      toast.success(config.successMessage);

      const successFunction = config?.onSuccess;
      if(successFunction && espaco){
        if(espaco?.id){
          await successFunction(espaco.id);
        }
        // Outras checagens
      }
    } catch (error) {
      catchAuthAxios(error, 'Erro ao salvar espaço');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (modo === 'edit' && data.ativo === false) {
      setPendingSubmitData(data);
      return;
    }

    await salvarEspaco(data);
  };

  const handleCancelarInativacao = () => {
    setPendingSubmitData(null);
  };

  const handleConfirmarInativacao = async () => {
    const data = pendingSubmitData;
    setPendingSubmitData(null);
    await salvarEspaco(data);
  };

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" color="success" type="submit" disabled={isLoading || writePermission === false}>
            Salvar
          </Button>
        </Stack>

        {modo === 'edit' ? (
          <Controller
            name="ativo"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value !== false}
                    onChange={(event) => field.onChange(event.target.checked)}
                    disabled={isLoading || writePermission === false}
                  />
                }
                label="Ativo"
              />
            )}
          />
        ) : null}

        <Controller
          name="icon"
          control={control}
          rules={{ required: 'Selecione um ícone' }}
          render={({ field }) => (
            <FormControl fullWidth required disabled={isLoading || writePermission === false} error={!!errors.icon}>
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
          disabled={isLoading || writePermission === false}
          error={!!errors.nome}
          helperText={errors.nome?.message}
          slotProps={{ inputLabel: { shrink: true } }}
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
          disabled={isLoading || writePermission === false}
          error={!!errors.sigla}
          helperText={errors.sigla?.message}
          slotProps={{ inputLabel: { shrink: true } }}
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
          disabled={isLoading || writePermission === false}
          error={!!errors.descricao}
          helperText={errors.descricao?.message}
          slotProps={{ inputLabel: { shrink: true } }}
          {...register('descricao', {
            required: 'Descrição é obrigatória.',
            maxLength: {
              value: 255,
              message: 'Descrição deve ter no máximo 255 caracteres.',
            },
          })}
        />
      </Stack>

      <Dialog
        open={Boolean(pendingSubmitData)}
        onClose={handleCancelarInativacao}
        slotProps={{ paper: { sx: { position: 'relative' } } }}
      >
        <DialogTitle sx={{ pr: 6 }}>Inativar espaço?</DialogTitle>
        <ModalCloseButton onClick={handleCancelarInativacao} disabled={isLoading || writePermission === false} />
        <DialogContent>
          <DialogContentText>
            Ao salvar este espaço como inativo, ele deixará de aparecer na Navbar. Você poderá encontrá-lo na aba de
            espaços inativos do Perfil.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            color="warning"
            variant="contained"
            onClick={handleConfirmarInativacao}
            disabled={isLoading}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading ? <Loading /> : <></>}
    </Box>
  );
};

export default EspacoFormulario;
