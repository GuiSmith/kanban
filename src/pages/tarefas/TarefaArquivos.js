// MUI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TarefaArquivos = ({ tarefa }) => {
    const [values, setValues] = useState({ nome: "" });
    const [arquivo, setArquivo] = useState(null);

    const handleChange = (field) => (event) => {
        setValues((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleArquivo = (e) => {
        setArquivo(e.target.files?.[0] || null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            if (!arquivo) {
                toast.warning('Insira 1 arquivo');
                return;
            }

            const form = new FormData();
            form.append('nome', values.nome);
            form.append('arquivo', arquivo);
            form.append('id_tarefa', tarefa.id);

            const res = await axios.post('/api/tarefas/arquivos/inserirArquivo', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Arquivo inserido');
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.mensagem || 'Erro ao inserir arquivo');
        }
    }

    return (
        <Box component='form' onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
                <Typography component="h1" variant="h4" align='center' sx={{ mb: 4 }}>
                    Arquivos
                </Typography>

                <Stack direction='row' spacing={2}>
                    <Button variant="contained" color="primary" type="button">
                        Novo
                    </Button>
                    <Button variant='contained' color='success' type='submit' >
                        Enviar
                    </Button>
                    <Button variant="contained" color="inherit" type="button">
                        Baixar
                    </Button>
                    <Button variant="contained" color="error" type="button">
                        Deletar
                    </Button>
                </Stack>

                <Stack spacing={2}>
                    <TextField
                        label='Nome'
                        name='Nome'
                        value={values.nome}
                        onChange={handleChange('nome')}
                        required
                    />

                    <Button variant='contained' component='label' startIcon={<FileUploadIcon />}>
                        Selecionar arquivo
                        <input
                            hidden
                            type="file"
                            onChange={handleArquivo}
                        />
                    </Button>
                    {arquivo && (
                        <Typography variant="body2">
                            1 arquivo selecionado: {arquivo.name}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Box>
    )
}

export default TarefaArquivos;
