import { useState } from 'react';
import { toast } from 'react-toastify';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import { formatDateTime } from '@/utils/formatDate';
import getNameInitials from '@/utils/getNameInitials';
import statusMap from '@/utils/InviteStatusMap';

const Convites = ({ convites = [], onConviteCancelado }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invite, setInvite] = useState(null);
  const [pendingCancelInvite, setPendingCancelInvite] = useState(null);

  const handleOpenCancelDialog = (convite) => {
    setPendingCancelInvite(convite);
  };

  const handleCloseCancelDialog = () => {
    if (!isLoading) {
      setPendingCancelInvite(null);
    }
  };

  const handleCancelInvite = async () => {
    if (!pendingCancelInvite) {
      return;
    }

    try {
      setIsLoading(true);

      const params = new URLSearchParams({ id_convite: pendingCancelInvite.id });
      await authAxios('delete', `/api/espacos/convites/cancelarConvite?${params.toString()}`);
      toast.success('Convite cancelado');
      setPendingCancelInvite(null);

      if (onConviteCancelado) {
        await onConviteCancelado();
        handleInviteClose();
      }
    } catch (error) {
      catchAuthAxios(error, 'Erro ao cancelar convite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteOpen = (inviteData) => {
    if (!isLoading) {
      setInvite(inviteData);
    }
  }

  const handleInviteClose = () => {
    if (!isLoading) {
      setInvite(null);
    }
  }

  const handleSendAgain = (inviteData) => {
    toast.info('Ainda não implementado');
  };

  const columns = [
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 1,
      renderCell: (params) => (
        <Stack
          direction='row'
          spacing={1.5}
          alignItems='center'
          sx={{ width: '100%', height: '100%' }}
        >
          <Avatar
            src={params.row?.src || undefined}
            alt={params.value || 'Usuário'}
            sx={{ width: 32, height: 32 }}
          >
            {params.value ? getNameInitials(params.value) : '?'}
          </Avatar>
          <Typography variant='body2'>{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'username',
      headerName: 'Usuário',
      flex: 1,
      valueGetter: (_, row) => (row?.username ? `@${row.username}` : ''),
    },
    {
      field: 'email',
      headerName: 'E-mail',
      flex: 1,
    },
    {
      field: 'status',
      flex: 0.8,
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
      flex: 1,
      valueGetter: (_, row) => (formatDateTime(row.data_cadastro))
    },
    {
      field: 'enviar_email',
      headerName: 'E-mail enviado',
      flex: 1,
      valueGetter: (_, row) => row.enviar_email ? 'Sim' : 'Não',
    }
  ];

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={convites}
          columns={columns}
          autoHeight
          loading={isLoading}
          pageSizeOptions={[convites.length || 5]}
          localeText={{ noRowsLabel: 'Nenhum registro' }}
          onRowClick={(params) => { handleInviteOpen(params.row) }}
          initialState={{
            filter: {
              filterModel: {
                items: [
                  {
                    field: 'status',
                    operator: 'doesNotEqual',
                    value: 'CANCELADO',
                  },
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
      <Dialog open={Boolean(invite)} onClose={handleInviteClose}>
        <DialogTitle>Detalhes do convite</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1, minWidth: 420 }}>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar
                src={invite?.avatar_public_url || undefined}
                sx={{ width: 64, height: 64 }}
              >
                {getNameInitials(invite?.nome)}
              </Avatar>

              <Box>
                <Typography variant='h6'>
                  {invite?.nome}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  @{invite?.username}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  {invite?.email}
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
          <Button type='button' onClick={handleInviteClose} disabled={isLoading}>
            Voltar
          </Button>
          <Button type='button' color='error' variant='contained' onClick={() => handleOpenCancelDialog(invite)} disabled={isLoading || invite?.status !== 'PENDENTE'} >
            Cancelar convite
          </Button>
          <Button type='button' color='success' variant='contained' onClick={() => handleSendAgain(invite)} disabled={isLoading || invite?.status !== 'PENDENTE'}>
            Reenviar e-mail
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancelar convite */}
      <Dialog open={Boolean(pendingCancelInvite)} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancelar convite?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar o convite de {pendingCancelInvite?.nome}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={handleCloseCancelDialog} disabled={isLoading}>
            Voltar
          </Button>
          <Button type="button" color="error" variant="contained" onClick={handleCancelInvite} disabled={isLoading}>
            Cancelar convite
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Convites;

export const getServerSideProps = async () => ({
  notFound: true,
});
