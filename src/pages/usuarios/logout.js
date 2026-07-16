import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Router from 'next/router';

const Logout = () => {

  const { logout } = useAuth();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logout();
        Router.push('/usuarios/login');
      } catch (error) {
        console.error('Erro ao realizar logout', error);
      }
    }
    doLogout();
  }, []);

  return <p>Carregando...</p>;
};

export default Logout;
