import Head from "next/head";

// MUI
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function SobrePage() {

  return (
    <>
      <Head>
        <title>Sobre</title>
        <meta name="description" content="Tela sobre" />
      </Head>

      <Container component="main" >
        <Typography component="h1" variant="h2" align='center' sx={{ mb: 4 }}>
          Sobre
        </Typography>
        
      </Container>
    </>
  );
}
