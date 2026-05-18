import Head from "next/head";
import Router from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import axios from "axios";
import { setToken } from '@/utils/token';

import { useAuth } from '@/contexts/AuthContext';

const defaultValues = {
  login: "",
  senha: "",
};

export default function LoginUsuarioPage() {

  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await axios.post("/api/usuarios/login", data);
      const token = res.data?.data;

      if (!token) {
        toast.error("Não foi possível autenticar. Tente novamente.");
        return;
      }

      await login(token);

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirectUrl") || "/documentacao";
      Router.push(redirectUrl);
    } catch (error) {
      console.log(error.response || error);
      toast.error(error.response?.data?.mensagem || "Não foi possível realizar login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login de usuário" />
      </Head>

      <Container maxWidth="sm" component="main" sx={{ py: 4 }}>
        <Typography component="h1" variant="h3" align="center" sx={{ mb: 4 }}>
          Login
        </Typography>

        <Card>
          <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <TextField
                  label="Usuário ou E-mail"
                  fullWidth
                  required
                  disabled={isLoading}
                  error={!!errors.login}
                  helperText={errors.login?.message}
                  {...register("login", {
                    required: "Usuário ou e-mail é obrigatório.",
                  })}
                />

                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  required
                  disabled={isLoading}
                  error={!!errors.senha}
                  helperText={errors.senha?.message}
                  {...register("senha", {
                    required: "Senha é obrigatória.",
                  })}
                />

                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="success" type="submit" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
                  </Button>
                  <Button variant="outlined" type="button" disabled={isLoading} onClick={() => Router.back()}>
                    Voltar
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

LoginUsuarioPage.disableMainCard = true;

export const getServerSideProps = async () => ({
  props: {},
});
