import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Loading from '@/components/Loading';
import Table from '@/components/Table';
import authAxios from '@/utils/authAxios';

const UsuariosPage = ({ espaco }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams({ id_espaco: espaco.id });
        const res = await authAxios('get', `/api/espacos/usuarios/listarUsuarios?${params.toString()}`);
        setUsuarios(res?.data?.data ?? []);
      } catch (error) {
        console.log(error?.response || error);
        toast.error(error?.response?.data?.mensagem || 'Erro ao listar usuários');
      } finally {
        setIsLoading(false);
      }
    };

    if (espaco?.id) {
      fetchUsuarios();
    }
  }, [espaco]);

  const tableColumns = {
    nome: {
      display: 'Nome',
      format: (value, row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={row?.src || undefined} alt={value || 'Usuário'} sx={{ width: 32, height: 32 }}>
            {value ? value.charAt(0).toUpperCase() : '?'}
          </Avatar>
          <span>{value}</span>
        </Stack>
      ),
    },
    username: {
      display: 'Usuário',
      format: (value) => value ? `@${value}` : '',
    },
    email: {
      display: 'E-mail',
    },
    vinculo: {
      display: 'Vínculo',
    },
  };

  return (
    <Stack spacing={2.5}>
      {isLoading ? <Loading /> : <></>}

      <Typography variant="body1" color="text.secondary">
        Usuários vinculados ao espaço.
      </Typography>

      <Table tableColumns={tableColumns} rows={usuarios} />
    </Stack>
  );
};

export default UsuariosPage;

export const getServerSideProps = async () => ({
  notFound: true,
});
