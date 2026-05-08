// Next
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

// Mui material
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";

// MUI Icons
import HouseIcon from '@mui/icons-material/House';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuIcon from "@mui/icons-material/Menu";

export const drawerWidth = 240;
const collapsedDrawerWidth = 72;

const menuItems = [
  { label: 'Início', href: '/', icon: <HouseIcon /> },
  { label: "Tarefas", href: "/tarefas", icon: <AssignmentTurnedInOutlinedIcon /> },
  { label: "Sobre", href: "/sobre", icon: <InfoOutlinedIcon /> },
];

const Navbar = () => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const currentWidth = collapsed ? collapsedDrawerWidth : drawerWidth;

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
      <List>
        {menuItems.map((item) => (
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
        ))}
      </List>
    </Drawer>
  );
};

export default Navbar;
