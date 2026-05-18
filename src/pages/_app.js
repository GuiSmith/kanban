// Estilos
import "@/styles/globals.css";

// MUI
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Toolbar from '@mui/material/Toolbar';

// React / Next
import { ToastContainer } from 'react-toastify';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

// Utils
import hasRouteAccess from "@/utils/hasRouteAccess";

// Componentes
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
import Loading from '@/components/Loading';

// Contextos
import { AppThemeProvider } from '@/contexts/ThemeContext';
import { NavbarProvider } from '@/contexts/NavbarContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const AppContent = ({ Component, pageProps }) => {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!hasRouteAccess(isAuthenticated, router.pathname)) {
      router.replace('/');
    }
  }, [router.pathname, isAuthLoading, isAuthenticated]);

  if (isAuthLoading) return <Loading />;

  const pageContent = <Component {...pageProps} />;
  const shouldUseMainCard = Component.disableMainCard !== true;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {shouldUseMainCard ? (
          <Card sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              {pageContent}
            </CardContent>
          </Card>
        ) : pageContent}

        <ToastContainer
          position='bottom-center'
          toastStyle={{
            width: 'fit-content',
            whiteSpace: 'nowrap',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
          }}
        />
      </Box>
    </Box>);
}

export default function App(props) {

  return (
    <AppThemeProvider>
      <AuthProvider >
        <NavbarProvider>
          <AppContent {...props} />
        </NavbarProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
};