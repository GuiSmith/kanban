import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

import Table from '@/components/Table';
import { formatDateTime } from '@/utils/formatDate';

const Convites = ({ convites = [] }) => {
  const tableColumns = {
    nome: {
      display: 'Usuário',
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
  };

  return <Table tableColumns={tableColumns} rows={convites} />;
};

export default Convites;

export const getServerSideProps = async () => ({
  notFound: true,
});
