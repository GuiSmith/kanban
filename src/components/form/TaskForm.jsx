"use client";

import { useState } from "react";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";


import dayjs from 'dayjs';

export default function TaskForm({
  formTitle,
  buttons = [ <Button key='submitButton' variant='contained' type='submit' >Enviar</Button> ],
  initialValues = { titulo: "", descricao: "" },
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);

  const dateFormat = 'DD/MM/YYYY HH:mm:ss';

  const handleChange = (field) => (event) => {
    setValues((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(values);
      return;
    }

    console.log("Dados do formulário:", values);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%", maxWidth: 520, mx: "auto", }}
    >
      <Stack spacing={2.5}>
        <Typography component="h1" variant="h4" align='center'>
          {formTitle}
        </Typography>

        <TextField
          label="Título"
          name="titulo"
          value={values.titulo}
          onChange={handleChange("titulo")}
          fullWidth
          required
        />

        <TextField
          label="Descrição"
          name="descricao"
          value={values.descricao}
          onChange={handleChange("descricao")}
          fullWidth
          required
          multiline
          minRows={4}
        />

        <TextField
          label="Cadastro"
          name="data_cadastro"
          value={values.data_cadastro ? dayjs(values.data_cadastro).format(dateFormat) : ''}
          fullWidth
          disabled
        />

        <TextField
          label="Atualização"
          name="data_atualizacao"
          value={values.data_atualizacao ? dayjs(values.data_atualizacao).format(dateFormat) : ''}
          fullWidth
          disabled
        />

        <Stack direction='row' spacing={2}>
          {buttons}
        </Stack>
      </Stack>
    </Box>
  );
}
