// MUI
import IconButton from '@mui/material/IconButton';
import ToolTip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import truncateString from '@/utils/truncateString';
import { formatDateTime } from '@/utils/formatDate';
import Table from '@/components/Table';

import { toast } from 'react-toastify';

const TarefaArquivosLista = ({ arquivos }) => {
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

    const handleDelete = () => toast.info('Ainda não implementado');

    const handleDownload = (src) => toast.info('Ainda não implementado');

    const tableColumns = {
        descricao: {
            display: 'Descrição',
            format: (value) => <ToolTip title={value}>{truncateString(value, tableMaxStringLength)}</ToolTip>,
        },
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
                        <IconButton color='secondary' onClick={() => handleCopy(src)}>
                            <ContentCopyIcon />
                        </IconButton>
                    </ToolTip>
                )
            },
            download: {
                key: 'src',
                action: (src) => (
                    <ToolTip title='Baixar arquivo'>
                        <IconButton color='success' onClick={() => handleDownload(src)}>
                            <DownloadIcon />
                        </IconButton>
                    </ToolTip>
                )
            },
            delete: {
                key: 'id',
                action: (id) => (
                    <ToolTip title='Deletar arquivo'>
                        <IconButton color='error' onClick={() => handleDelete(id)}>
                            <DeleteIcon />
                        </IconButton>
                    </ToolTip>
                )
            },
        }
    };

    return <Table tableColumns={tableColumns} tableRowActions={tableRowActions} rows={arquivos} />;
};

export default TarefaArquivosLista;
