import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import authAxios from '@/utils/authAxios';
import catchAuthAxios from '@/utils/catchAxios';

const NavbarContext = createContext({
  espacos: [],
  profile: null,
  isNavbarLoading: false,
  isSpacesCollapsed: false,
  setIsSpacesCollapsed: () => { },
  refreshEspacos: async () => { },
  refreshProfile: async () => { },
  refreshNavbarData: async () => { },
});

export const NavbarProvider = ({ children }) => {

  const { isAuthenticated, isAuthLoading } = useAuth();

  const [espacos, setEspacos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingCount, setLoadingCount] = useState(0);
  const [isSpacesCollapsed, setIsSpacesCollapsed] = useState(false);
  const isNavbarLoading = loadingCount > 0;

  const runWithNavbarLoading = useCallback(async (callback) => {
    try {
      setLoadingCount((prev) => prev + 1);
      return await callback();
    } finally {
      setLoadingCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const refreshEspacos = useCallback(async () => {
    return runWithNavbarLoading(async () => {
      if (isAuthLoading || !isAuthenticated) {
        setEspacos([]);
        return [];
      }

      try {
        const res = await authAxios('get', '/api/espacos/listarEspacos');
        const responseData = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(responseData) ? responseData : responseData?.data;

        setEspacos(list);
        return list;
      } catch (error) {
        catchAuthAxios(error, 'Erro ao listar espaços');
        // console.log(error?.response || error);
        setEspacos([]);
        return [];
      }
    });
  }, [runWithNavbarLoading, isAuthLoading, isAuthenticated]);

  const refreshProfile = useCallback(async () => {
    return runWithNavbarLoading(async () => {
      if (isAuthLoading || !isAuthenticated) {
        setProfile(null);
        return null;
      }

      try {
        const res = await authAxios('get', '/api/usuarios/perfil');
        const nextProfile = res?.data?.data ?? null;

        setProfile(nextProfile);
        return nextProfile;
      } catch (error) {
        catchAuthAxios(error, 'Erro ao buscar perfil');
        // console.log(error?.response || error);
        setProfile(null);
        return null;
      }
    });
  }, [runWithNavbarLoading, isAuthLoading, isAuthenticated]);

  const refreshNavbarData = useCallback(async () => {
    await Promise.all([
      refreshEspacos(),
      refreshProfile(),
    ]);
  }, [refreshEspacos, refreshProfile]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      setProfile(null);
      setEspacos([]);
      return;
    }

    refreshNavbarData();
  }, [isAuthLoading, isAuthenticated, refreshNavbarData]);

  useEffect(() => {
    const handleProfileChange = () => {
      refreshProfile();
    };

    window.addEventListener('kanban-profile-change', handleProfileChange);

    return () => {
      window.removeEventListener('kanban-profile-change', handleProfileChange);
    };
  }, [refreshProfile]);

  const value = useMemo(() => ({
    espacos,
    profile,
    setProfile,
    isNavbarLoading,
    isSpacesCollapsed,
    setIsSpacesCollapsed,
    refreshEspacos,
    refreshProfile,
    refreshNavbarData,
  }), [
    espacos,
    profile,
    setProfile,
    isNavbarLoading,
    isSpacesCollapsed,
    refreshEspacos,
    refreshProfile,
    refreshNavbarData,
  ]);

  return (
    <NavbarContext.Provider value={value}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => useContext(NavbarContext);
