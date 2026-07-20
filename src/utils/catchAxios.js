import { removeToken } from '@/utils/token';

import { toast } from 'react-toastify';
import Router from 'next/router';

const catchAuthAxios = (error, genericMessage = 'Ocorreu um erro inesperado' ) => {
    const status = error?.response?.status;
    const data = error?.response?.data?.data;

    console.error('Erro na requisição:', error, data);

    const errorMessage = error?.response?.data?.mensagem ?? genericMessage;

    if (status === 401) {
        toast.warning(errorMessage);
        removeToken();
        Router.replace('/usuarios/logout');
        return null;
    }

    if(status === 403) {
        toast.warning(errorMessage);
        return null;
    }

    const toasty = error?.response?.data?.mensagem ? toast.warning : toast.error;

    toasty(errorMessage);

    return null;
};

export default catchAuthAxios;