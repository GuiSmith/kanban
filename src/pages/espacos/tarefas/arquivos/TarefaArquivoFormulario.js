// MUI
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { useForm } from 'react-hook-form';
import authAxios from '@/utils/authAxios';
import { toast } from 'react-toastify';

const TarefaArquivoFormulario = ({ tarefaId, isLoading, setIsLoading, onArquivoInserido }) => {
    const defaultValues = { descricao: '' };
    const { register, handleSubmit, reset, watch } = useForm({ defaultValues });

    const handleNew = () => reset(defaultValues);

    const onSubmit = async (data) => {
        try {
            const arquivo = watch('arquivo')?.[0];
            if (!arquivo) {
                toast.warning('Insira 1 arquivo');
                return;
            }

            setIsLoading(true);

            const form = new FormData();
            form.append('descricao', data.descricao);
            form.append('arquivo', arquivo);
            form.append('id_tarefa', tarefaId);

            const res = await authAxios('post','/api/espacos/tarefas/arquivos/inserirArquivo', form, {}, 'multipart/form-data');

            toast.success('Arquivo inserido');
            onArquivoInserido?.(res.data.data);
            handleNew();
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.mensagem || 'Erro ao inserir arquivo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Stack spacing={2} component='form' onSubmit={handleSubmit(onSubmit)}>
            <Stack direction='row' spacing={2}>
                <Button variant="contained" color="primary" type="button" onClick={handleNew} disabled={isLoading}>
                    Novo
                </Button>
                <Button variant='contained' color='success' type='submit' disabled={isLoading}>
                    Enviar
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} align="flex-start">
                <TextField
                    label="Descrição"
                    {...register('descricao')}
                    required
                    fullWidth
                />

                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    sx={{
                        minWidth: 56,
                        width: 56,
                        height: 56,
                    }}
                    disabled={isLoading}
                >
                    <FileUploadIcon />
                    <input hidden type="file" {...register('arquivo')} />
                </Button>

                {watch('arquivo')?.[0]?.name && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Arquivo: {watch('arquivo')?.[0]?.name}
                    </Typography>
                )}
            </Stack>
        </Stack>
    );
};

export default TarefaArquivoFormulario;

export const getServerSideProps = async () => ({
  notFound: true,
});
