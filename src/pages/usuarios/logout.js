import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Logout = () => {

  const { logout } = useAuth();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Erro ao realizar logout', error);
      }
    }
    doLogout();
  }, []);

  return <p>Carregando...</p>;
};

export default Logout;

export const getServerSideProps = async () => ({
  props: {},
});
