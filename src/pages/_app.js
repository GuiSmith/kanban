// Estilos
import "@/styles/globals.css";

// MUI
import Box from '@mui/material/Box';
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

export default function App({ Component, pageProps }) {

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const auth = () => {
      if(!hasRouteAccess(router.pathname)){
        router.replace('/');
      }
    };

    auth();
  },[router.pathname]);

  const renderPage = () => {
    if (isLoading) return <Loading />;

    return (<>
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Component {...pageProps} />
        <ToastContainer position='bottom-right' />
      </Box>
    </>);
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {renderPage()}
    </Box>
  );
}
