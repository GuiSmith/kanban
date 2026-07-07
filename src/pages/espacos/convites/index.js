import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Loading from '@/components/Loading';
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';
import ConviteFormulario from './ConviteFormulario';
import Convites from './Convites';

const ConvitesPage = ({ espaco, writePermission }) => {
  const [convites, setConvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConvites = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({ id_espaco: espaco.id });
      const res = await authAxios('get', `/api/convites/listarConvites?${params.toString()}`);
      setConvites(res?.data?.data ?? []);
    } catch (error) {
      catchAuthAxios(error, 'Erro ao listar convites');
    } finally {
      setIsLoading(false);
    }
  }, [espaco]);

  useEffect(() => {
    if (espaco?.id) {
      const timeout = setTimeout(fetchConvites, 0);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [espaco, fetchConvites]);

  return (
    <Stack spacing={2.5}>
      {isLoading ? <Loading /> : <></>}

      <Typography component="h2" variant="h5">
        Convites
      </Typography>

      <ConviteFormulario
        mode="create"
        initialValues={{ id_espaco: espaco?.id }}
        onConviteCriado={fetchConvites}
        writePermission={writePermission}
      />
      
      <Convites
        convites={convites}
        onConviteCancelado={fetchConvites}
        writePermission={writePermission}
      />
    </Stack>
  );
};

export default ConvitesPage;

export const getServerSideProps = async () => ({
  notFound: true,
});
