// React / JS
import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
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
import GroupIcon from '@mui/icons-material/Group';
import WorkspacesIcon from '@mui/icons-material/Workspaces';

// Componentes
import EspacoFormulario from './EspacoFormulario';
import Loading from '@/components/Loading';

// Paginas
import ConvitesPage from '@/pages/espacos/convites';
import TarefasPage from '@/pages/espacos/tarefas';
import UsuariosPage from '@/pages/espacos/usuarios';

// Contextos
import { useNavbar } from '@/contexts/NavbarContext';

// Uitls
import { getEspacoIcon } from '../../utils/EspacosIcones';
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';

const tabs = [
  { index: 0, label: 'Espaço', permission: 'ESPACO', icon: WorkspacesIcon },
  { index: 1, label: 'Quadro', permission: 'QUADRO', icon: DashboardIcon },
  { index: 2, label: 'Usuários', permission: 'USUARIOS', icon: GroupIcon },
];

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

  const { espacos, isNavbarLoading, profile } = useNavbar();

  const [activeTab, setActiveTab] = useState(0);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const space = useMemo(() => {
    if (!id || !espacos) return null;
    return espacos.find(espaco => espaco.id == id);
  },[id, espacos]);

  useEffect(() => {
    if (!id || !espacos) {
      setActiveTab(0);
      return;
    }

    loadPermissions();
  }, [id, espacos]);

  const loadPermissions = async () => {
    const localPermissions = await fetchPermissions(space);
    checkAccess(localPermissions);
  };

  const fetchPermissions = async (localSpace) => {
    try {
      const params = new URLSearchParams({ id_espaco: localSpace.id, id_usuario: profile.id });
      const res = await authAxios('GET', `/api/espacos/usuarios/listarPermissoes?${params.toString()}`);
      setPermissions(res.data.data);
      return res.data.data;
    } catch (error) {
      catchAuthAxios(error, 'Erro ao buscar permissões do usuário no espaço');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccess = (localPermissions) => {
    if(!localPermissions) return;
    const currentTab = tabs.find(tab => tab.index === activeTab);

    if (!hasTabPermission(currentTab.permission, localPermissions)) {
      const existingPermissions = localPermissions.filter(p => typeof p.escrita === 'boolean');
      
      if (existingPermissions.length > 0) {

        for (const existingPermission of existingPermissions) {
          const firstAcessibleTab = tabs.find(tab => existingPermission.nome === tab.permission);
          
          if (firstAcessibleTab) {
            setActiveTab(firstAcessibleTab.index);
            return;
          }
        }
      }

      router.push('/espacos');
      return;
    }
  }

  const SpaceIcon = getEspacoIcon(space?.icon) ?? WorkspacesIcon;

  const handleTabChange = (_, value) => {
    setActiveTab(value);
  };

  const hasTabPermission = (permissionName, permissionList = permissions) => {
    const permission = permissionList.find(p => p.nome === permissionName);

    if (typeof permission?.escrita !== 'boolean') return false;

    return true;

  }

  return (
    <>
      <Head>
        <title>Espaços</title>
        <meta name="description" content="Cadastro de espaços" />
      </Head>

      {isNavbarLoading || isLoading ? <Loading /> : <></>}

      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h3" sx={{
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }} >
            <SpaceIcon sx={{ fontSize: 'inherit' }} /> {space ? space.nome : 'Criar espaço'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie suas tarefas
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="Abas da tela de espaços">
            {tabs.map(tab => (
              <Tab
                key={tab.index}
                icon={<tab.icon />}
                iconPosition="start"
                label={tab.label}
                {...getTabProps(tab.index)}
                disabled={!id && tab.index == 0 ? false : !hasTabPermission(tab.permission) }
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <EspacoFormulario modo={space ? 'edit' : 'create'} initialValues={space} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {space
            ? <TarefasPage espaco={space} />
            : <Typography variant="body1" color="text.secondary"> Salve o espaço para continuar  </Typography>
          }
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {space
            ? (
              <Stack spacing={3} >
                <Box sx={{ flex: 1, width: '100%' }}>
                  <UsuariosPage espaco={space} />
                </Box>
                <Box sx={{ flex: 1, width: '100%' }}>
                  <ConvitesPage espaco={space} />
                </Box>
              </Stack>
            )
            : <Typography variant="body1" color="text.secondary"> Salve o espaço para continuar  </Typography>
          }
        </TabPanel>
      </Stack>
    </>
  );
}

export const getServerSideProps = async () => ({
  props: {},
});
