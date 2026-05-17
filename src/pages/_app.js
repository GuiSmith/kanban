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
import Router from 'next/router';
import { useState, useEffect } from 'react';

// Utils
import hasRouteAccess from "@/utils/hasRouteAccess";

// Componentes
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
import Loading from '@/components/Loading';
import { AppThemeProvider } from '@/contexts/ThemeContext';
import { NavbarProvider } from '@/contexts/NavbarContext';

export default function App({ Component, pageProps }) {

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const auth = (url = window.location.pathname) => {
      const pathname = url.split('?')[0];

      if (!hasRouteAccess(pathname)) {
        Router.replace('/');
      }
    };

    auth();
    Router.events.on('routeChangeComplete', auth);

    return () => {
      Router.events.off('routeChangeComplete', auth);
    };
  }, []);

  const renderPage = () => {
    if (isLoading) return <Loading />;

    const pageContent = <Component {...pageProps} />;
    const shouldUseMainCard = Component.disableMainCard !== true;

    return (<>
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
        {/* <ToastContainer position='bottom-right' /> */}
        <ToastContainer
          position='bottom-center'
          toastStyle={{
            width: 'fit-content',
            // minWidth: '420px',
            // maxWidth: '900px',
            whiteSpace: 'nowrap',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
          }}
        />
      </Box>
    </>);
  }

  return (
    <AppThemeProvider>
      <NavbarProvider>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          {renderPage()}
        </Box>
      </NavbarProvider>
    </AppThemeProvider>
  );
}
