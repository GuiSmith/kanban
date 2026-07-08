import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';

const ProfilePicture = ({ size = 'small', user = null }) => {
    
    const sizes = { small: 32, medium: 64, large: 128 };
    if (!sizes[size]) throw new Error(`Tamanho inválido para foto de perfil, esperado: ${Object.keys(sizes).join(', ')}`);
    const avatarSx = { width: sizes[size], height: sizes[size] };

    if (!user) {
        return (
            <Avatar sx={avatarSx} >
                <PersonIcon />
            </Avatar>
        );
    }

    return (
        <Avatar alt={user.nome} src={user.src || ""} sx={avatarSx} >
            {user?.nome ? user.nome.charAt(0).toUpperCase() : <PersonIcon />}
        </Avatar>
    );
};

export default ProfilePicture;