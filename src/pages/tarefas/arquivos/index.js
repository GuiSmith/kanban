// MUI
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// Personalized UI
import Loading from '@/components/Loading';
import TarefaArquivoFormulario from './TarefaArquivoFormulario';
import TarefaArquivosLista from './TarefaArquivosLista';

// React Next
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// Utils
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';

const TarefaArquivos = ({ tarefa }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [arquivos, setArquivos] = useState([]);

    useEffect(() => {
        const fetchArquivos = async () => {
            try {
                setIsLoading(true);

                const params = {
                    id_tarefa: tarefa?.id
                };
                const urlSearchParams = new URLSearchParams(params);
                const url = `/api/tarefa_arquivos/listarArquivos?${urlSearchParams.toString()}`;

                const resArquivos = await authAxios('get', url);

                setArquivos(resArquivos.data.data);

            } catch (error) {
                catchAuthAxios(error, 'Erro ao listar arquivos!');
            } finally {
                setIsLoading(false);
            }
        };

        if (tarefa?.id) fetchArquivos();
    }, [tarefa?.id]);

    const handleArquivoInserido = (novoArquivo) => {
        if (!novoArquivo) return;
        setArquivos((prev) => [...prev, { ...novoArquivo }]);
    };

    return (
        <Stack spacing={2.5}>
            {isLoading ? <Loading /> : <></>}
            {/* Título */}
            <Typography component="h1" variant="h4" align='center' sx={{ mb: 4 }}>
                Arquivos
            </Typography>

            <TarefaArquivoFormulario
                tarefaId={tarefa?.id}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onArquivoInserido={handleArquivoInserido}
            />

            {!isLoading && <TarefaArquivosLista arquivos={arquivos} setArquivos={setArquivos} />}
        </Stack>
    )
}

export default TarefaArquivos;

export const getServerSideProps = async () => ({
  notFound: true,
});
