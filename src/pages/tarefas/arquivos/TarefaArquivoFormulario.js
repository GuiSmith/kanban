// MUI
import Button from '@mui/material/Button';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';

const TarefaArquivoFormulario = ({ tarefaId, isLoading, setIsLoading, onArquivoInserido, writePermission }) => {
    const handleUpload = async (e) => {
        try {
            const arquivo = e.target.files[0];
            if (!arquivo) return;
            setIsLoading(true);

            const form = new FormData();
            form.append('arquivo', arquivo);
            form.append('id_tarefa', tarefaId);

            const res = await authAxios('post', '/api/tarefa_arquivos/inserirArquivo', form, {}, 'multipart/form-data');

            onArquivoInserido?.(res.data.data);

            e.target.value = '';
        } catch (error) {
            catchAuthAxios(error, 'Erro ao inserir arquivo na tarefa');
        } finally {
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

export const getServerSideProps = async () => ({
    notFound: true,
});
