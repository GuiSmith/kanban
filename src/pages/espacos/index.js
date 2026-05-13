// React / JS
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

// MUI
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

// Componentes
import EspacoFormulario from './EspacoFormulario';
import Loading from '@/components/Loading';

// Uitls
import authAxios from '@/utils/authAxios';

const TabPanel = ({ children, index, value }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`espacos-tabpanel-${index}`}
    aria-labelledby={`espacos-tab-${index}`}
    sx={{ pt: 3 }}
  >
    {value === index ? children : null}
  </Box>
);

const getTabProps = (index) => ({
  id: `espacos-tab-${index}`,
  'aria-controls': `espacos-tabpanel-${index}`,
});

export default function EspacosPage() {

  const router = useRouter();

  const { id } = router.query;

  const [activeTab, setActiveTab] = useState(0);
  const [space, setSpace] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        if (!id) return;
        setIsLoading(true);
        const params = new URLSearchParams({ id });
        const res = await authAxios('get', `/api/espacos/selecionarEspaco?${params.toString()}`);
        console.log(res.data);
        setSpace(res.data.data);
      } catch (error) {
        console.log(error?.response || error);
        toast.error(error?.response?.data?.mensagem || 'Erro ao buscar espaço');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSpaces();
  },[id]);

  const handleTabChange = (_, value) => {
    setActiveTab(value);
  };

  return (
    <>
      <Head>
        <title>Espaços</title>
        <meta name="description" content="Cadastro de espaços" />
      </Head>

      {isLoading ? <Loading /> : <></>}

      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h3" sx={{ mb: 1 }}>
            Espaços
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cadastre as informações iniciais de um espaço e acompanhe a futura configuração do quadro.
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="Abas da tela de espaços">
            <Tab icon={<WorkspacesIcon />} iconPosition="start" label="Espaço" {...getTabProps(0)} />
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Quadro" {...getTabProps(1)} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <EspacoFormulario modo="create" initialValues={space} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="body1" color="text.secondary">
            Configuração do quadro será implementada futuramente.
          </Typography>
        </TabPanel>
      </Stack>
    </>
  );
}

export const getServerSideProps = async () => ({
  props: {},
});
