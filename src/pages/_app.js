import "@/styles/globals.css";
import { Box, Toolbar } from "@mui/material";
import Navbar from "@/components/Navbar";
import { ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Component {...pageProps} />
        <ToastContainer position='bottom-right' />
      </Box>
    </Box>
  );
}
