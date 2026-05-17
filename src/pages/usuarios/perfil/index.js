import Head from 'next/head';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

import Loading from '@/components/Loading';
import authAxios from '@/utils/authAxios';
import PerfilFormulario from './PerfilFormulario';

import EspacosInativos from './EspacosInativos';
import Convites from './Convites';

import { useNavbar } from '@/contexts/NavbarContext';

const TabPanel = ({ children, index, value }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`perfil-tabpanel-${index}`}
    aria-labelledby={`perfil-tab-${index}`}
    sx={{ pt: 3 }}
  >
    {value === index ? children : null}
  </Box>
);

const getTabProps = (index) => ({
  id: `perfil-tab-${index}`,
  'aria-controls': `perfil-tabpanel-${index}`,
});

export default function PerfilPage() {

  const { profile, setProfile, isNavbarLoading } = useNavbar();

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_, value) => {
    setActiveTab(value);
  };

  return (
    <>
      <Head>
        <title>Perfil</title>
        <meta name="description" content="Perfil do usuário" />
      </Head>

      {isNavbarLoading ? <Loading /> : <></>}

      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h3" sx={{ mb: 1 }}>
            Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize e edite seus dados básicos.
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="Abas da tela de perfil">
            <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Perfil" {...getTabProps(0)} />
            <Tab icon={<WorkspacesIcon />} iconPosition="start" label="Espaços inativos" {...getTabProps(1)} />
            <Tab icon={<WorkspacesIcon />} iconPosition="start" label="Convites" {...getTabProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <PerfilFormulario mode="edit" initialValues={profile} onPerfilAtualizado={setProfile} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <EspacosInativos />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Convites />
        </TabPanel>
      </Stack>
    </>
  );
}

export const getServerSideProps = async () => ({
  props: {},
});
