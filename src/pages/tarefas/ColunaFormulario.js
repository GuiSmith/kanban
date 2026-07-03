// React/JS
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';

// MUI
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';

// Componentes
import Loading from '@/components/Loading';

// Utils
import authAxios from "@/utils/authAxios";
import catchAuthAxios from '@/utils/catchAxios';
import columnType from "@/utils/columnType";

const defaultValues = {
    create: ['nome','tipo','id_espaco'],
    edit: ['id','ativo','nome','tipo','ordem'],
};

const ColunaFormulario = ({ mode = 'create', initialValues = null, onClose }) => {
    const { control, reset, register, handleSubmit, getValues } = useForm({ defaultValues: initialValues });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const obj = {};

        for(const key of defaultValues[mode]) {
            obj[key] = initialValues?.[key] ?? null;
        }
        reset(obj);
    }, [initialValues, mode, reset]);

    const criarColuna = async (data) => {
        try {
            setIsLoading(true);
            const res = await authAxios('post', '/api/colunas/criarColuna', data);
            toast.success('Coluna criada');
            return true;
        } catch (error) {
            catchAuthAxios(error, 'Erro ao criar coluna');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const editarColuna = async (data) => {
        try {
            setIsLoading(true);
            const res = await authAxios('put', '/api/colunas/editarColuna', data);
            toast.success('Coluna editada');
            return true;
        } catch (error) {
            catchAuthAxios(error, 'Erro ao editar coluna');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        switch (mode) {
            case 'create':
                const createOk = await criarColuna(data);
                if (createOk) onClose();
                break;
            case 'edit':
                const editOk = await editarColuna(data);
                if (editOk) onClose();
                break;
            default:
                toast.error('Modo inválido de formulário!');
        }
    };

    return (
        <Box sx={{ width: '100%', mx: 'auto' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.5}>

                    <Typography component='h1' variant='h4' align='center'>
                        {mode === 'edit' ? 'Editar coluna' : 'Criar coluna'}
                    </Typography>
                    {/* Ativo */}
                    {mode === 'edit' ? (
                        <Controller
                            name="ativo"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={field.value !== false}
                                            onChange={(event) => field.onChange(event.target.checked)}
                                            disabled={isLoading}
                                        />
                                    }
                                    label="Ativo"
                                />
                            )}
                        />
                    ) : null}

                    {/* Nome */}
                    <TextField
                        label="Nome"
                        fullWidth
                        required
                        disabled={isLoading}
                        slotProps={{ inputLabel: { shrink: true } }}
                        {...register('nome', {
                            required: 'Nome é obrigatório.',
                            maxLength: {
                                value: 50,
                                message: 'Nome deve ter no máximo 50 caracteres.',
                            },
                        })}
                    />

                    {/* Tipo */}
                    <Controller
                        name='tipo'
                        control={control}
                        rules={{ required: 'Selecione um tipo' }}
                        render={({ field }) => (
                            <FormControl fullWidth required disabled={isLoading} >
                                <InputLabel id='coluna-tipo-label'>Tipo</InputLabel>
                                <Select
                                    {...field}
                                    labelId='coluna-tipo-label'
                                    label="Tipo"
                                    value={field.value || ''}
                                >
                                    {Object.keys(columnType).map(tipo => (
                                        <MenuItem key={tipo} value={tipo}>
                                            <Button color={columnType[tipo]} type='button' variant='contained'>{tipo}</Button>
                                        </MenuItem>
                                    ))}
                                </Select>

                            </FormControl>
                        )}
                    />

                    <Button color='success' variant='contained' type='submit'>
                        Salvar
                    </Button>

                </Stack>
            </form>
            {isLoading ? <Loading /> : <></>}
        </Box>
    );
};

export default ColunaFormulario;