import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const ModalCloseButton = ({ onClick, disabled = false, title = 'Fechar' }) => (
  <Tooltip title={title}>
    <span>
      <IconButton
        aria-label={title}
        onClick={onClick}
        disabled={disabled}
        size="medium"
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export default ModalCloseButton;
