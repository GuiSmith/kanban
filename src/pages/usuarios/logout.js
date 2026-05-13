import Router from 'next/router';
import { toast } from 'react-toastify';

const logout = () => {

    if(typeof window !== 'undefined'){
        localStorage.removeItem('kanban-token');
    }

    toast.success('Logout realizado');
    Router.replace('/usuarios/login');
}

export default logout;