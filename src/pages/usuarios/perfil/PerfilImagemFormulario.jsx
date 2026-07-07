import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import ModalCloseButton from '@/components/ModalCloseButton';
import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';

const maxSizeMb = 5;
const maxSizeByte = maxSizeMb * 1024 * 1024;
const acceptedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const PerfilImagemFormulario = ({ src, nome, isLoading, setIsLoading, onImagemAtualizada }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    return () => {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setImagem(null);

    if (previewSrc) {
      URL.revokeObjectURL(previewSrc);
      setPreviewSrc(null);
    }
  };

  const handleImagemChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImagem(null);
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
        setPreviewSrc(null);
      }
      return;
    }

    if (!acceptedMimeTypes.includes(file.type)) {
      toast.warning('Selecione uma imagem válida');
      event.target.value = '';
      setImagem(null);
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
        setPreviewSrc(null);
      }
      return;
    }

    if (file.size > maxSizeByte) {
      toast.warning('A imagem deve ter no máximo 5 MB');
      event.target.value = '';
      setImagem(null);
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
        setPreviewSrc(null);
      }
      return;
    }

    if (previewSrc) {
      URL.revokeObjectURL(previewSrc);
    }

    setImagem(file);
    setPreviewSrc(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!imagem) {
      toast.warning('Selecione uma imagem válida');
      return;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append('imagem', imagem);

      const res = await authAxios('post', '/api/usuarios/alterarImagemPerfil', form, {}, 'multipart/form-data');
      const perfil = res?.data?.data;

      toast.success('Imagem atualizada com sucesso');
      setImagem(null);
      setIsDialogOpen(false);
      onImagemAtualizada?.(perfil);

      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
        setPreviewSrc(null);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kanban-profile-change', { detail: perfil }));
      }
    } catch (error) {
      catchAuthAxios(error, 'Erro ao salvar imagem de perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const visibleSrc = previewSrc || src;

  return (
    <>
      <ButtonBase
        onClick={handleOpenDialog}
        disabled={isLoading}
        sx={{
          borderRadius: '50%',
          alignSelf: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Avatar src={src || undefined} alt={nome || 'Perfil'} sx={{ width: 72, height: 72 }}>
          {!src ? <AccountCircleIcon sx={{ fontSize: 56 }} /> : null}
        </Avatar>
      </ButtonBase>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { position: 'relative' } } }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ pr: 6 }}>Imagem de perfil</DialogTitle>
          <ModalCloseButton onClick={handleCloseDialog} disabled={isLoading} />
          <DialogContent>
            <Stack spacing={2.5} alignItems="center" sx={{ pt: 1 }}>
              <Avatar src={visibleSrc || undefined} alt={nome || 'Perfil'} sx={{ width: 160, height: 160 }}>
                {!visibleSrc ? <AccountCircleIcon sx={{ fontSize: 120 }} /> : null}
              </Avatar>

              <Button
                variant="contained"
                component="label"
                color="primary"
                startIcon={<FileUploadIcon />}
                disabled={isLoading}
              >
                Trocar imagem
                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImagemChange}
                />
              </Button>

              {imagem?.name ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  Arquivo: {imagem.name}
                </Typography>
              ) : null}

              <Typography variant="caption" color="text.secondary" align="center">
                PNG, JPG, JPEG ou WEBP ate 5 MB.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="success" type="submit" disabled={isLoading || !imagem}>
              Salvar imagem
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default PerfilImagemFormulario;

export const getServerSideProps = async () => ({
  notFound: true,
});
