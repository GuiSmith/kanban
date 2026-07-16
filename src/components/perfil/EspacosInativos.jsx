import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import Table from '@/components/common/Table';
import Loading from '@/components/common/Loading';
import authAxios from '@/utils/authAxios';
import { getEspacoIcon } from '@/utils/EspacosIcones';

// Contextos
import { useNavbar } from '@/contexts/NavbarContext';

const EspacosInativosLista = () => {

  const { espacos, isNavbarLoading } = useNavbar();

  const [espacosInativos, setEspacosInativos] = useState([]);

  useEffect(() => {
    setEspacosInativos(espacos.filter(espaco => espaco.ativo === false));
  }, [espacos]);

  const tableColumns = {
    nome: {
      display: 'Nome',
      format: (value, row) => {
        const EspacoIcon = getEspacoIcon(row?.icon);

        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <EspacoIcon fontSize="small" />
            <span>{value}</span>
          </Stack>
        );
      },
    },
    sigla: {
      display: 'Sigla',
    },
    descricao: {
      display: 'Descrição',
    },
  };

  const tableRowActions = {
    display: 'Ações',
    actions: {
      open: {
        key: 'id',
        action: (id) => (
          <IconButton component={Link} href={`/espacos?id=${id}`} color="primary">
            <OpenInNewIcon />
          </IconButton>
        ),
      },
    },
  };

  return (
    <Stack spacing={2.5}>
      {isNavbarLoading ? <Loading /> : <></>}

      <Typography variant="body1" color="text.secondary">
        Espaços inativos não aparecem na Navbar.
      </Typography>

      <Table tableColumns={tableColumns} tableRowActions={tableRowActions} rows={espacosInativos} />
    </Stack>
  );
};

export default EspacosInativosLista;
