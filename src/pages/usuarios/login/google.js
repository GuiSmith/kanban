// Next React
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Router from 'next/router';

// Componentens
import Loading from '@/components/common/Loading';

// Contextos
import { useAuth } from '@/contexts/AuthContext';

const LoginGoogle = () => {

    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get('/api/usuarios/login/google');
                const token = res.data?.data;

                await login(token);

                Router.push('/documentacao');
            } catch (error) {
                if(error?.response?.status === 401){
                    toast.warning('Autenticação não realizada');
                    return;
                }

                console.error('Erro ao checar autenticação com google: ', error);
                toast.error('Erro inesperado. Contate o suporte');

                Router.push('/usuarios/login');
                return;
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    });

    return (
        <section>
            <h1>Autenticando...</h1>
            {isLoading ? <Loading /> : <></>}
        </section>
    );
};

export default LoginGoogle;