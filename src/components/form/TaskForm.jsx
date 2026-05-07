"use client";

import { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

export default function TaskForm({
  formTitle,
  submitText,
  initialValues = { titulo: "", descricao: "" },
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);

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
      sx={{
        width: "100%",
        maxWidth: 520,
        mx: "auto",
      }}
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
          multiline
          minRows={4}
        />

        <Button type="submit" variant="contained">
          {submitText}
        </Button>
      </Stack>
    </Box>
  );
}
