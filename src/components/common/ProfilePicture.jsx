import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import PersonIcon from '@mui/icons-material/Person';
import { use } from 'react';

const ProfilePicture = ({ size = 'small', user = null }) => {

    const sizes = { small: 32, medium: 64, large: 128 };
    if (!sizes[size]) throw new Error(`Tamanho inválido para foto de perfil, esperado: ${Object.keys(sizes).join(', ')}`);
    const avatarSx = {
        width: sizes[size],
        height: sizes[size],
        border: 'solid 2px lightgrey',
        "&:hover": {
            opacity: 0.7
        }
    };

    if (!user) {
        return (
            <Avatar sx={avatarSx} >
                <PersonIcon />
            </Avatar>
        );
    }

    return (
        <Tooltip title={`${user.nome} - ${user.username}`}>
            <Avatar alt={user.nome} src={user.src || ""} sx={avatarSx} >
                {user?.nome ? user.nome.charAt(0).toUpperCase() : <PersonIcon />}
            </Avatar>
        </Tooltip>
    );
};

export default ProfilePicture;