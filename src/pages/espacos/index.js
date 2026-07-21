// React / JS
import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

// MUI
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';


// Componentes
import EspacoFormulario from '../../components/espacos/EspacoFormulario';
import Loading from '@/components/common/Loading';

// Paginas
import ConvitesPage from '@/pages/espacos/convites';
import TarefasPage from '@/pages/tarefas';
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

  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') ?? 0);
  const [permissoes, setPermissoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const space = useMemo(() => {
    if (!id || !espacos) return null;
    return espacos.find(espaco => espaco.id == id);
  }, [id, espacos]);

  // Buscando permissões
  useEffect(() => {
    if (!id || !space || !profile || isNavbarLoading) {
      setActiveTab(0);
      return;
    }

    const buscarPermissoes = async () => {
      try {
        const params = new URLSearchParams({ id_espaco: space.id, id_usuario: profile.id });
        const res = await authAxios('GET', `/api/espacos/listarPermissoes?${params.toString()}`);
        setPermissoes(res.data.data);
      } catch (error) {
        catchAuthAxios(error, 'Erro ao buscar permissões do usuário no espaço');
      } finally {
        setIsLoading(false);
      }
    };

    buscarPermissoes();
  }, [space, id, isNavbarLoading, profile?.id, router.isReady]);
  
  const SpaceIcon = getEspacoIcon(space?.icon) ?? WorkspacesIcon;
  
  const handleTabChange = (_, value) => {
    setActiveTab(value);
    localStorage.setItem('activeTab', value);
  };
  
  const hasTabPermission = (permissionName) => {
    if (permissoes.length === 0) {
      return false;
    }
    
    const permissao = permissoes.find(p => p.nome == permissionName);
    
    return typeof permissao?.escrita == 'boolean';
  }
  
  const getWritePermission = (permissionName) => {
    if (permissoes.length === 0) {
      return false;
    }
    
    const permissao = permissoes.find(p => p.nome == permissionName);
    
    return permissao?.escrita === true;
  }

  const currentTabPermission = useMemo(() => {
    return getWritePermission(tabs[activeTab].permission) ?? false;
  },[activeTab, permissoes, space, isLoading]);
  
  return (
    <>
      <Head>
        <title>Espaços</title>
        <meta name="description" content="Cadastro de espaços" />
      </Head>

      {isNavbarLoading || isLoading ? <Loading /> : <></>}

      <Stack spacing={3}>
        <Box sx={{ position: 'relative' }}>
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
          <Tooltip
            title={currentTabPermission ? `Você pode fazer alterações em '${tabs[activeTab].label}'` : `Você não pode fazer alterações em '${tabs[activeTab].label}'`}
            sx={{ position: 'absolute', top: 0, right: 0, cursor: 'help' }}
          >
            {currentTabPermission
              ? <Chip label={`${tabs[activeTab].label}: Modo escrita`} color='primary' icon={<DriveFileRenameOutlineIcon />} />
              : <Chip label={`${tabs[activeTab].label}: Modo leitura`} color='warning' icon={<VisibilityIcon />} />
            }
          </Tooltip>
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
                disabled={tab.index === 0 ? false : !hasTabPermission(tab.permission)}
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <EspacoFormulario
            modo={space ? 'edit' : 'create'}
            initialValues={space}
            writePermission={getWritePermission('ESPACO')}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {space
            ? <TarefasPage espaco={space} writePermission={getWritePermission('QUADRO')} />
            : <Typography variant="body1" color="text.secondary"> Salve o espaço para continuar  </Typography>
          }
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {space
            ? (
              <Stack spacing={3} sx={{ minWidth: 0 }}>
                <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
                  <UsuariosPage espaco={space} writePermission={getWritePermission('USUARIOS')} />
                </Box>
                <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
                  <ConvitesPage espaco={space} writePermission={getWritePermission('USUARIOS')} />
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
