// MUI

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const TarefaArquivos = () => {
    return (
        <Box>
            <Typography component="h1" variant="h4" align='center' sx={{ mb: 4 }}>
                Arquivos
            </Typography>

            <Stack direction='row' spacing={2}>
                <Button variant="contained" color="primary" type="button">
                    Novo
                </Button>
                <Button variant="contained" color="inherit" type="button">
                    Baixar
                </Button>
                <Button variant="contained" color="error" type="button">
                    Deletar
                </Button>
            </Stack>
        </Box>
    )
}

export default TarefaArquivos;