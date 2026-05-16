import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// MUI
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import Divider from '@mui/material/Divider';

// MUI Dialog
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Componentes
import Loading from '@/components/Loading';
import UsuarioPermissoesFormulario from '@/pages/espacos/usuarios/UsuarioPermissoesFormulario';

// Utils
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import getNameInitials from '@/utils/getNameInitials';
import { formatDateTime } from '@/utils/formatDate';

const UsuariosPage = ({ espaco }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams({ id_espaco: espaco.id });
        const res = await authAxios('get', `/api/espacos/usuarios/listarUsuarios?${params.toString()}`);
        setUsuarios(res?.data?.data ?? []);
      } catch (error) {
        catchAuthAxios(error, 'Erro ao listar usuários');
      } finally {
        setIsLoading(false);
      }
    };

    if (espaco?.id) {
      fetchUsuarios();
    }
  }, [espaco]);

  const handleOpenUser = (user) => {
    setUsuario(user);
  };

  const handleCloseUser = () => {
    setUsuario(null);
  };

  const columns = [
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 1.2,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            src={params.row?.src || undefined}
            alt={params.value || 'Usuário'}
            sx={{ width: 32, height: 32 }}
          >
            {params.value ? getNameInitials(params.value) : '?'}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'username',
      headerName: 'Usuário',
      flex: 0.9,
      valueGetter: (_, row) => (row?.username ? `@${row.username}` : ''),
    },
    {
      field: 'email',
      headerName: 'E-mail',
      flex: 1.2,
    },
    {
      field: 'vinculo',
      headerName: 'Vínculo',
      flex: 0.8,
    },
  ];

  const rows = usuarios.map((usuario, index) => ({
    id: usuario?.id ?? usuario?.id_usuario ?? usuario?.email ?? usuario?.username ?? index,
    ...usuario,
  }));

  return (
    <Stack spacing={2.5}>
      {isLoading ? <Loading /> : null}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={usuarios}
          columns={columns}
          autoHeight
          hideFooter
          pageSizeOptions={[rows.length || 5]}
          onRowClick={(params) => { handleOpenUser(params.row) }}
          localeText={{
            noRowsLabel: 'Nenhum registro.',
          }}
          sx={{
            border: 0,
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
        />
      </Box>

      <Dialog open={Boolean(usuario)} onClose={handleCloseUser}>
        <DialogTitle>{usuario?.nome}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1, minWidth: 420 }}>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar
                src={usuario?.avatar_public_url || undefined}
                sx={{ width: 64, height: 64 }}
              >
                {getNameInitials(usuario?.nome)}
              </Avatar>

              <Box>
                <Typography variant='h6'>
                  {usuario?.nome}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  @{usuario?.username}
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  {usuario?.email}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <UsuarioPermissoesFormulario usuario={usuario} />

          </Stack>
        </DialogContent>
      </Dialog>

    </Stack>
  );
};

export default UsuariosPage;

export const getServerSideProps = async () => ({
  notFound: true,
});
