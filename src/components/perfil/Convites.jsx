import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

// Utils
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import { formatDateTime } from '@/utils/formatDate';
import { getEspacoIcon } from '@/utils/EspacosIcones';
import statusMap from '@/utils/InviteStatusMap';

// Componentes
import Loading from '@/components/common/Loading';
import ModalCloseButton from '@/components/common/ModalCloseButton';

// Contextos
import { useNavbar } from '@/contexts/NavbarContext';

const Convites = () => {

    const { refreshEspacos } = useNavbar();

    const [isLoading, setIsLoading] = useState(false);
    const [invites, setInvites] = useState(null);
    const [invite, setInvite] = useState(null);

    const fetchInvites = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await authAxios('get', '/api/usuarios/listarConvites');
            setInvites(res?.data?.data || []);
        } catch (error) {
            catchAuthAxios(error, 'Erro ao buscar convites');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(fetchInvites, 0);
        return () => clearTimeout(timeoutId);
    }, [fetchInvites]);

    const handleInviteOpen = (inviteData) => {
        if (!isLoading) {
            const inviteObj = inviteData;
            inviteObj.icon = getEspacoIcon(inviteData.espaco_icon);
            setInvite(inviteObj);
        }
    }

    const handleInviteClose = () => {
        if (!isLoading) {
            setInvite(null);
        }
    }

    const handleAnswerInvite = async (answer) => {
        if (isLoading || !invite) return;

        try {
            setIsLoading(true);
            const data = { id_convite: invite.id, resposta: answer };
            const res = await authAxios('put', '/api/convites/responderConvite', data);
            toast.success(res?.data?.mensagem || 'Convite respondido com sucesso');
            handleInviteClose();
            fetchInvites();
            if(answer === true){
                refreshEspacos();
            }
        } catch (error) {
            catchAuthAxios(error, 'Erro ao responder convite');
        } finally {
            setIsLoading(false);
        }
    }

    const columns = [
        {
            field: 'espaco_nome',
            headerName: 'Espaço',
            flex: 1,
            renderCell: (params) => {
                const Icon = getEspacoIcon(params.row.espaco_icon);

                return (
                    <Stack
                        direction='row'
                        spacing={1}
                        alignItems='center'
                        sx={{ width: '100%', height: '100%' }}
                    >
                        {Icon && <Icon color='action' />}
                        <Typography>{params.value}</Typography>
                    </Stack>
                )
            },
        },
        {
            field: 'espaco_ativo',
            headerName: 'Ativo',
            flex: 0.3,
            valueGetter: (_, row) => (row.espaco_ativo ? 'Sim' : 'Não'),
        },
        {
            field: 'espaco_descricao',
            headerName: 'Descrição',
            flex: 2,
        },
        {
            field: 'status',
            flex: 0.6,
            headerName: 'Status',
            renderCell: (params) => {
                const status = params.value;

                return (
                    <Chip
                        label={status}
                        color={statusMap[status] || 'default'}
                        size='small'
                    />
                )

            }
        },
        {
            field: 'data_cadastro',
            headerName: 'Cadastro',
            flex: 0.6,
            valueGetter: (_, row) => (formatDateTime(row.data_cadastro))
        },
        {
            field: 'enviar_email',
            headerName: 'E-mail enviado',
            flex: 0.6,
            valueGetter: (_, row) => row.enviar_email ? 'Sim' : 'Não',
        }
    ];

    return (
        <>
            {isLoading && <Loading />}
            <Box sx={{ width: '100%' }}>
                <DataGrid
                    rows={invites}
                    columns={columns}
                    autoHeight
                    // hideFooter
                    pageSizeOptions={[invites?.length || 5]}
                    localeText={{ noRowsLabel: 'Nenhum registro' }}
                    onRowClick={(params) => { handleInviteOpen(params.row) }}
                    loading={isLoading}
                    initialState={{
                        filter: {
                            filterModel: {
                                items: [
                                    {
                                        field: 'status',
                                        operator: 'doesNotEqual',
                                        value: 'CANCELADO',
                                    },
                                    {
                                        field: 'ativo',
                                        operator: 'equals',
                                        value: true,
                                    }
                                ],
                            },
                        },
                    }}
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer',
                        },
                    }}
                />
            </Box>

            {/* Visualizar convite */}
            <Dialog
                open={Boolean(invite)}
                onClose={handleInviteClose}
                slotProps={{ paper: { sx: { position: 'relative' } } }}
            >
                <DialogTitle sx={{ pr: 6 }}>Detalhes do convite</DialogTitle>
                <ModalCloseButton onClick={handleInviteClose} disabled={isLoading} />
                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1, minWidth: 420 }}>
                        <Stack direction='row' spacing={2} alignItems='center'>
                            {invite?.icon && <invite.icon color='action' sx={{ fontSize: 64 }} />}

                            <Box>
                                <Typography variant='h6'>
                                    {invite?.espaco_nome}
                                </Typography>

                                <Typography variant='body2' color='text.secondary'>
                                    {invite?.espaco_sigla}
                                </Typography>

                                <Typography variant='body2' color='text.secondary'>
                                    {invite?.ativo === true ? 'Ativo' : 'Inativo'}
                                </Typography>
                            </Box>
                        </Stack>

                        <Divider />

                        <Stack spacing={2}>
                            <Stack direction='row' justifyContent='space-between'>
                                <Typography variant='body2' color='text.secondary'>
                                    Status
                                </Typography>

                                <Chip
                                    label={invite?.status}
                                    color={statusMap[invite?.status] || 'default'}
                                    size='small'
                                />
                            </Stack>

                            <Stack direction='row' justifyContent='space-between'>
                                <Typography variant='body2' color='text.secondary'>
                                    E-mail enviado
                                </Typography>

                                <Typography variant='body2'>
                                    {invite?.enviar_email ? 'Sim' : 'Não'}
                                </Typography>
                            </Stack>

                            <Stack direction='row' justifyContent='space-between'>
                                <Typography variant='body2' color='text.secondary'>
                                    Data do convite
                                </Typography>

                                <Typography variant='body2'>
                                    {formatDateTime(invite?.data_cadastro)}
                                </Typography>
                            </Stack>

                            <Stack direction='row' justifyContent='space-between'>
                                <Typography variant='body2' color='text.secondary'>
                                    Expira em
                                </Typography>

                                <Typography variant='body2'>
                                    {formatDateTime(invite?.data_expiracao)}
                                </Typography>
                            </Stack>

                            <Stack direction='row' justifyContent='space-between'>
                                <Typography variant='body2' color='text.secondary'>
                                    Aceito em
                                </Typography>

                                <Typography variant='body2'>
                                    {formatDateTime(invite?.data_aceite)}
                                </Typography>
                            </Stack>

                            <Stack direction='row' justifyContent='space-between'>
                                <Typography variant='body2' color='text.secondary'>
                                    Recusado em
                                </Typography>

                                <Typography variant='body2'>
                                    {formatDateTime(invite?.data_recusa)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button type='button' color='error' variant='contained' onClick={() => handleAnswerInvite(false)} disabled={isLoading || invite?.status !== 'PENDENTE'} >
                        Recusar
                    </Button>
                    <Button type='button' color='success' variant='contained' onClick={() => handleAnswerInvite(true)} disabled={isLoading || invite?.status !== 'PENDENTE'}>
                        Aceitar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Convites;
