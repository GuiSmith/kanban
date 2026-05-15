import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import ToolTip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import { toast } from 'react-toastify';

import Table from '@/components/Table';
import authAxios from '@/utils/authAxios';
import { formatDateTime } from '@/utils/formatDate';
import getNameInitials from '@/utils/getNameInitials';

const Convites = ({ convites = [], onConviteCancelado }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      }
    } catch (error) {
      console.log(error?.response || error);
      toast.error(error?.response?.data?.mensagem || 'Erro ao cancelar convite');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendAgain = (id) => {
    toast.info('Ainda não implementado');
  };

  const tableColumns = {
    nome: {
      display: 'Usuário',
      format: (value, row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row?.src || undefined} alt={value || 'Usuário'} sx={{ width: 32, height: 32 }}>
            {value ? getNameInitials(value) : '?'}
          </Avatar>
          <span>{value}</span>
        </Stack>
      ),
    },
    username: {
      display: 'Username',
      format: (value) => value ? `@${value}` : '',
    },
    email: {
      display: 'E-mail',
    },
    status: {
      display: 'Status',
    },
    data_cadastro: {
      display: 'Cadastro',
      format: formatDateTime,
    },
    enviar_email: {
      display: 'E-mail enviado',
      format: (value) => value ? 'Sim' : 'Não',
    }
  };

  const tableRowActions = {
    display: 'Ações',
    actions: {
      cancel: {
        key: 'id',
        action: (id, row) => (
          <ToolTip title='Cancelar convite'>
            <IconButton
              color='error'
              disabled={row?.status !== 'PENDENTE' || isLoading}
              onClick={() => handleOpenCancelDialog(row)}
            >
              <CancelOutlinedIcon />
            </IconButton>
          </ToolTip>
        )
      },
      sendAgain: {
        key: 'id',
        action: (id, row) => (
          <ToolTip title='Reenviar e-mail'>
            <IconButton
              color='primary'
              disabled={row?.status !== 'PENDENTE' || isLoading}
              onClick={() => handleSendAgain(id)}>
              <ReplayOutlinedIcon />
            </IconButton>
          </ToolTip>
        )
      }
    }
  };

  return (
    <>
      <Table tableColumns={tableColumns} tableRowActions={tableRowActions} rows={convites} />

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
