import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

// Mui material
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import HouseIcon from '@mui/icons-material/House';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Utils
import authAxios from '@/utils/authAxios';
import hasRouteAcess from '@/utils/hasRouteAccess';
import { useAppTheme } from "@/contexts/ThemeContext";
import { getEspacoIcon } from "@/pages/espacos/EspacosIcones";

export const drawerWidth = 240;
const collapsedDrawerWidth = 72;

const menuItems = [
  { label: 'Início', href: '/', icon: <HouseIcon /> },
  { label: "Sobre", href: "/sobre", icon: <InfoOutlinedIcon /> },
  { label: "Tarefas", href: "/tarefas", icon: <AssignmentTurnedInOutlinedIcon /> },
  { label: "Espaços", href: "/espacos", icon: <WorkspacesIcon /> },
  { label: "Documentação", href: "/documentacao", icon: <MenuBookIcon /> },
  { label: "Criar conta", href: '/usuarios/novo', icon: <PersonAddIcon /> },
  { label: "Entrar", href: '/usuarios/login', icon: <LoginIcon /> },
  { label: 'Sair', href: '/usuarios/logout', icon: <LogoutIcon /> },
];

const getInitialCollapsed = () => {
  if (typeof window === 'undefined') return false;

  const storedCollapsed = localStorage.getItem('kanban-toolbar-collapsed');
  return storedCollapsed !== null ? JSON.parse(storedCollapsed) : false;
};

const Navbar = () => {
  const router = useRouter();
  const { mode, toggleTheme } = useAppTheme();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [spacesOpen, setSpacesOpen] = useState(true);
  const [espacos, setEspacos] = useState([]);
  const [isEspacosLoading, setIsEspacosLoading] = useState(false);
  const [espacosError, setEspacosError] = useState(false);
  const currentWidth = collapsed ? collapsedDrawerWidth : drawerWidth;
  const isDarkMode = mode === 'dark';
  const themeButtonLabel = isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro';

  useEffect(() => {
    localStorage.setItem('kanban-toolbar-collapsed', JSON.stringify(collapsed));
  },[collapsed]);

  useEffect(() => {
    const fetchEspacos = async () => {
      if (!hasRouteAcess('/espacos')) {
        setEspacos([]);
        return;
      }

      try {
        setIsEspacosLoading(true);
        setEspacosError(false);

        const res = await authAxios('get', '/api/espacos/listarEspacos');
        const responseData = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(responseData) ? responseData : responseData?.data;

        setEspacos(Array.isArray(list) ? list : []);
      } catch (error) {
        console.log(error?.response || error);
        setEspacos([]);
        setEspacosError(true);
      } finally {
        setIsEspacosLoading(false);
      }
    };

    fetchEspacos();
  }, [router.pathname]);

  const renderSpaceSubItems = () => {
    if (collapsed) return null;

    if (isEspacosLoading) {
      return (
        <ListItemButton sx={{ pl: 5, minHeight: 40 }} disabled>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CircularProgress size={18} />
          </ListItemIcon>
          <ListItemText primary="Carregando espaços..." />
        </ListItemButton>
      );
    }

    if (espacosError) {
      return (
        <ListItemButton sx={{ pl: 5, minHeight: 40 }} disabled>
          <ListItemText primary="Erro ao carregar espaços" />
        </ListItemButton>
      );
    }

    if (espacos.length === 0) {
      return (
        <ListItemButton sx={{ pl: 5, minHeight: 40 }} disabled>
          <ListItemText primary="Nenhum espaço encontrado" />
        </ListItemButton>
      );
    }

    return espacos.map((espaco) => {
      const EspacoIcon = getEspacoIcon(espaco.icon);
      const label = espaco.nome || espaco.sigla || 'Espaço sem nome';

      return (
        <ListItemButton
          key={espaco.id}
          component={Link}
          href={`/espacos?id=${espaco.id}`}
          sx={{ pl: 5, minHeight: 40 }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <EspacoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={label} />
        </ListItemButton>
      );
    });
  };

  const renderSpacesItem = (item) => (
    <Box key={item.href}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemButton
          component={Link}
          href={item.href}
          selected={router.pathname === item.href}
          sx={{
            minHeight: 48,
            justifyContent: collapsed ? "center" : "initial",
            px: 2,
            flexGrow: 1,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: "center",
            }}
          >
            {item.icon}
          </ListItemIcon>
          <Box sx={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto", transition: "opacity 0.2s ease" }}>
            <ListItemText primary={item.label} />
          </Box>
        </ListItemButton>

        {!collapsed ? (
          <Tooltip title={spacesOpen ? 'Recolher espaços' : 'Expandir espaços'} placement="right">
            <IconButton
              aria-label={spacesOpen ? 'Recolher espaços' : 'Expandir espaços'}
              onClick={() => setSpacesOpen((prev) => !prev)}
              sx={{ mr: 1 }}
            >
              {spacesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>

      {!collapsed ? (
        <Collapse in={spacesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {renderSpaceSubItems()}
          </List>
        </Collapse>
      ) : null}
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: currentWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.2s ease",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Toolbar
        sx={{
          justifyContent: collapsed ? "center" : "flex-end",
          px: 1,
        }}
      >
        <IconButton onClick={() => setCollapsed((prev) => !prev)} aria-label="alternar menu lateral">
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {menuItems.filter(item => hasRouteAcess(item.href) === true).map((item) => (
          item.href === '/espacos' ? renderSpacesItem(item) : (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={router.pathname === item.href}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? "center" : "initial",
                px: 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <Box sx={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto", transition: "opacity 0.2s ease" }}>
                <ListItemText primary={item.label} />
              </Box>
            </ListItemButton>
          )
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}>
        <Tooltip title={themeButtonLabel} placement="right">
          <ListItemButton
            onClick={toggleTheme}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? "center" : "initial",
              px: 2,
              borderRadius: 1,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
              }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <Box sx={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto", transition: "opacity 0.2s ease" }}>
              <ListItemText primary={themeButtonLabel} />
            </Box>
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Navbar;
