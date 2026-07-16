// MUI
import IconButton from '@mui/material/IconButton';
import ToolTip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// Personalized UI
import Table from '@/components/common/Table';
import Loading from '@/components/common/Loading';

// Utils
import truncateString from '@/utils/truncateString';
import { formatDateTime } from '@/utils/formatDate';
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';

// React
import { toast } from 'react-toastify';
import { useState } from 'react';


const TarefaArquivosLista = ({ arquivos, setArquivos, writePermission }) => {

    const [isLoading, setIsLoading] = useState(false);

    const tableMaxStringLength = 25;

    const handleCopy = async (text) => {
        if (!text) {
            toast.error('Nenhum link para copiar.');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success('Link copiado.');
        } catch (error) {
            console.error(error);
            toast.error('Não foi possível copiar.');
        }
    };

    const handleDelete = async (id) => {
        try {
            if(!confirm('Tem certeza de que deseja deletar este arquivo?')) {
                toast.info('Deleção cancelada');
                return;
            };
            setIsLoading(true);
            const urlParams = new URLSearchParams({ id });
            const res = await authAxios('delete',`/api/tarefa_arquivos/deletarArquivo?${urlParams.toString()}`);
            setArquivos(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            catchAuthAxios(error, 'Erro ao deletar arquivo');
        } finally {
            setIsLoading(false);
        }
    };

    const tableColumns = {
        nome: {
            display: 'Arquivo',
            format: (value) => <ToolTip title={value}>{truncateString(value, tableMaxStringLength)}</ToolTip>,
        },
        data_cadastro: {
            display: 'Cadastro',
            format: (value) => formatDateTime(value),
        },
    };

    const tableRowActions = {
        display: 'Ações',
        actions: {
            open: {
                key: 'src',
                action: (src) => (
                    <ToolTip title='Abrir em nova página'>
                        <IconButton
                            component='a'
                            href={src}
                            target='_blank'
                            rel="noopener noreferrer"
                            color='info'
                            disabled={isLoading}
                        >
                            <OpenInNewIcon />
                        </IconButton>
                    </ToolTip>
                )
            },
            copy: {
                key: 'src',
                action: (src) => (
                    <ToolTip title='Copiar link'>
                        <IconButton
                            color='secondary'
                            onClick={() => handleCopy(src)}
                            disabled={isLoading}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </ToolTip>
                )
            },
            delete: {
                key: 'id',
                action: (id) => (
                    <ToolTip title='Deletar arquivo'>
                        <IconButton
                            color='error'
                            onClick={() => handleDelete(id)}
                            disabled={isLoading || writePermission === false}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </ToolTip>
                )
            },
        }
    };

    return <>
        <Table tableColumns={tableColumns} tableRowActions={tableRowActions} rows={arquivos} />
        {isLoading ? <Loading /> : <></>}
    </>;
};

export default TarefaArquivosLista;
