// React/JS
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";

// Componentes
import Loading from '@/components/Loading';

// Utils
import authAxios from "@/utils/authAxios";
import catchAuthAxios from '@/utils/catchAxios';

const defaultValues = {
    id: null,
    ativo: true,
    nome: null,
    tipo: 'A FAZER',
    id_espaco: null,
    ordem: null,
};

const ColunaFormulario = ({ mode = 'create', initialValues = null, onClose }) => {
    const { control, reset, register, handleSubmit, getValues } = useForm({ defaultValues: initialValues });

    const [isLoading, setIsLoading] = useState(false);

    const dateFormat = 'DD/MM/YYYY HH:mm:ss';

    useEffect(() => {
        reset(initialValues ? initialValues : defaultValues);
    }, [initialValues]);

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
            const res = await authAxios('put', '/api/coluna/editarColuna', data);
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
                break;
            case 'edit':
                const editOk = await editarColuna(data);
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

                    <Button color='success' variant='contained' type='submit'>
                        Salvar
                    </Button>

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

                </Stack>
            </form>
            {isLoading ? <Loading /> : <></>}
        </Box>
    );
};

export default ColunaFormulario;