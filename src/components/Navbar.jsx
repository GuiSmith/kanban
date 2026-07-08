import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

// Mui material
import Avatar from "@mui/material/Avatar";
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Utils
import hasRouteAccess from '@/utils/hasRouteAccess';
import { useAppTheme } from "@/contexts/ThemeContext";
import { useNavbar } from "@/contexts/NavbarContext";
import { getEspacoIcon } from "@/utils/EspacosIcones";

// Contexts
import { useAuth } from "@/contexts/AuthContext";
import ProfilePicture from "./ProfilePicture";

export const drawerWidth = 240;
const collapsedDrawerWidth = 72;

const menuItems = [
  { label: "Perfil", href: "/usuarios/perfil", icon: "profile" },
  { label: "Entrar", href: '/usuarios/login', icon: <LoginIcon /> },
  { label: 'Início', href: '/', icon: <HouseIcon /> },
  { label: "Sobre", href: "/sobre", icon: <InfoOutlinedIcon /> },
  { label: "Espaços", href: "/espacos", icon: <WorkspacesIcon /> },
  { label: "Documentação", href: "/documentacao", icon: <MenuBookIcon /> },
  { label: "Criar conta", href: '/usuarios/novo', icon: <PersonAddIcon /> },
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
  const {
    espacos,
    profile,
    isNavbarLoading,
    isSpacesCollapsed,
    setIsSpacesCollapsed,
  } = useNavbar();
  const { isAuthLoading, isAuthenticated } = useAuth();

  const [espacosAtivos, setEspacosAtivos] = useState([]);
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [meusEspacosOpen, setMeusEspacosOpen] = useState(true);
  const [compartilhadosOpen, setCompartilhadosOpen] = useState(true);

  const meusEspacos = espacosAtivos.filter((espaco) => Number(espaco.id_usuario) === Number(profile?.id));
  const espacosCompartilhados = espacosAtivos.filter((espaco) => Number(espaco.id_usuario) !== Number(profile?.id));
  const currentWidth = collapsed ? collapsedDrawerWidth : drawerWidth;
  const isDarkMode = mode === 'dark';
  const themeButtonLabel = isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro';
  const spacesOpen = !isSpacesCollapsed;

  const selectedSpaceId = router.query?.id ? Number(router.query.id) : null;
  const isOnEspacosPage = router.pathname === '/espacos';

  useEffect(() => {
    localStorage.setItem('kanban-toolbar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setEspacosAtivos(espacos.filter(e => e.ativo !== false));
  }, [espacos]);

  const renderMenuIcon = (item) => item.icon === 'profile' ? <ProfilePicture user={profile} /> : item.icon;

  const renderSpaceSubItems = () => {
    if (collapsed) return null;

    if (isNavbarLoading || isAuthLoading) {
      return (
        <ListItemButton sx={{ pl: 5, minHeight: 40 }} disabled>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CircularProgress size={18} />
          </ListItemIcon>
          <ListItemText primary="Carregando espaços..." />
        </ListItemButton>
      );
    }

    if (espacosAtivos.length === 0) {
      return (
        <ListItemButton sx={{ pl: 5, minHeight: 40 }} disabled>
          <ListItemText primary="Nenhum espaço encontrado" />
        </ListItemButton>
      );
    }

    return (
      <>
        {meusEspacos.length > 0 &&
          renderSpaceGroup('Meus', meusEspacosOpen, setMeusEspacosOpen, meusEspacos)}

        {espacosCompartilhados.length > 0 &&
          renderSpaceGroup('Compartilhados', compartilhadosOpen, setCompartilhadosOpen, espacosCompartilhados)}
      </>
    );
  };

  const renderSpacesItem = (item) => {

    return (
      <Box key={item.href}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ListItemButton
            component={Link}
            href={item.href}
            selected={isOnEspacosPage && !selectedSpaceId}
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
              {renderMenuIcon(item)}
            </ListItemIcon>
            <Box sx={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto", transition: "opacity 0.2s ease" }}>
              <ListItemText primary={item.label} />
            </Box>
          </ListItemButton>

          {!collapsed ? (
            <Tooltip title={spacesOpen ? 'Recolher espaços' : 'Expandir espaços'} placement="right">
              <IconButton
                aria-label={spacesOpen ? 'Recolher espaços' : 'Expandir espaços'}
                onClick={() => setIsSpacesCollapsed((prev) => !prev)}
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
    )
  };

  const renderSpaceGroup = (label, open, setOpen, items) => (
    <>
      <ListItemButton
        onClick={() => setOpen((prev) => !prev)}
        sx={{ pl: 4, minHeight: 36 }}
      >
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            variant: 'caption',
            color: 'text.secondary',
            fontWeight: 700,
          }}
        />

        {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map((espaco) => {
            const EspacoIcon = getEspacoIcon(espaco.icon);
            const label = espaco.nome || espaco.sigla || 'Espaço sem nome';

            return (
              <ListItemButton
                key={espaco.id}
                component={Link}
                selected={isOnEspacosPage && selectedSpaceId === Number(espaco.id)}
                href={`/espacos?id=${espaco.id}`}
                sx={{ pl: 5, minHeight: 40 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <EspacoIcon fontSize="small" />
                </ListItemIcon>

                <ListItemText primary={label} />
              </ListItemButton>
            );
          })}
        </List>
      </Collapse>
    </>
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
        {menuItems.filter(item => hasRouteAccess(isAuthenticated, item.href) === true).map((item) => (
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
                {renderMenuIcon(item)}
              </ListItemIcon>
              <Box sx={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto", transition: "opacity 0.2s ease" }}>
                <ListItemText primary={profile && item.label == 'Perfil' ? `@${profile.username}` : item.label} />
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
