// MUI
import Button from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import { toast } from 'react-toastify';
import { TAREFA_ARQUIVO_MAX_BYTES, TAREFA_ARQUIVO_TAMANHO_MENSAGEM } from '@/utils/tarefaArquivoLimites';

const TarefaArquivoFormulario = ({ tarefaId, isLoading, setIsLoading, onArquivoInserido, writePermission }) => {
    const handleUpload = async (e) => {
        try {
            const arquivo = e.target.files[0];
            if (!arquivo) return;
            if (arquivo.size > TAREFA_ARQUIVO_MAX_BYTES) {
                toast.warning(TAREFA_ARQUIVO_TAMANHO_MENSAGEM);
                return;
            }
            setIsLoading(true);

            const form = new FormData();
            form.append('arquivo', arquivo);
            form.append('id_tarefa', tarefaId);

            const res = await authAxios('post', '/api/tarefa_arquivos/inserirArquivo', form, {}, 'multipart/form-data');

            onArquivoInserido?.(res.data.data);

        } catch (error) {
            catchAuthAxios(error, error?.response?.status === 413
                ? 'O servidor recusou o tamanho do arquivo. Tente um arquivo menor ou contate o suporte.'
                : 'Erro ao inserir arquivo na tarefa');
        } finally {
            e.target.value = '';
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="contained"
            component="label"
            color="success"
            disabled={isLoading || writePermission === false}
            sx={{ alignSelf: 'flex-start' }}
        >
            <FileUploadIcon />
            <input
                hidden
                type="file"
                accept=".pdf, .jpg, .png, .jpeg"
                onChange={handleUpload}
            />
        </Button>
    );
};

export default TarefaArquivoFormulario;
