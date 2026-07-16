// Next / React
import Head from 'next/head';
import { useState } from 'react';

// MUI
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

// Componentes
import Loading from '@/components/common/Loading';
import PerfilFormulario from '../../../components/perfil/PerfilFormulario';
import EspacosInativos from '../../../components/perfil/EspacosInativos';
import Convites from '../../../components/perfil/Convites';
import PerfilImagemFormulario from '../../../components/perfil/PerfilImagemFormulario';

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
  const [isLoading, setIsLoading] = useState(false);

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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <PerfilImagemFormulario
            src={profile?.src}
            nome={profile?.nome}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onImagemAtualizada={setProfile}
          />

          <Box>
            <Typography component="h2" variant="h5">
              {profile?.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{profile?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile?.email}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="Abas da tela de perfil">
            <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Perfil" {...getTabProps(0)} />
            <Tab icon={<WorkspacesIcon />} iconPosition="start" label="Espaços inativos" {...getTabProps(1)} />
            <Tab icon={<WorkspacesIcon />} iconPosition="start" label="Convites" {...getTabProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <PerfilFormulario mode="edit" initialValues={profile} onPerfilAtualizado={setProfile} isLoading={isLoading} setIsLoading={setIsLoading} />
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
