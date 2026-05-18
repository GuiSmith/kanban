import { useEffect } from 'react';
import Router from 'next/router';

import Loading from '@/components/Loading';
import { toast } from 'react-toastify';

import { useAuth } from '@/contexts/AuthContext';

const errorMessage = 'Erro ao sair. Contate o suporte';

const Logout = () => {

  const { logout } = useAuth();

  useEffect(() => {
    try {
      logout();
      Router.push('/usuarios/login');
    } catch (error) {
      console.error(error);
      toast.error(errorMessage);
    }
  }, []);

  return <Loading />;
};

export default Logout;

export const getServerSideProps = async () => ({
  props: {},
});
