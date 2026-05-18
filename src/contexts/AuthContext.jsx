import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import authAxios from "@/utils/authAxios";
import { setToken, removeToken } from "@/utils/token";

const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const checkSession = async () => {
        try {
            setIsAuthLoading(true);
            const res = await authAxios('GET', '/api/auth');
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
            if(error?.response?.status === 401) {
                toast.error('Sessão expirada. Por favor, faça login novamente.');
            } else {
                console.log('Erro ao checar autenticação:', error);
                toast.error('Erro ao checar autenticação. Contate o suporte.');
            }
        } finally {
            setIsAuthLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (token) => {
        try {
            setIsAuthLoading(true);

            await setToken(token);
            
            setIsAuthenticated(true);

            toast.success('Login realizado');
        } catch (error) {
            console.log('Erro ao realizar login:', error);
            toast.error('Erro ao realizar login. Contate o suporte.');
        } finally {
            setIsAuthLoading(false);
        }
    }

    const logout = async () => {
        try {
            setIsAuthLoading(true);

            await removeToken();

            setIsAuthenticated(false);
                        
            toast.success('Logout realizado');
        } catch (error) {
            console.log('Erro ao desconectar:', error);
            toast.error('Erro ao desconectar. Contate o suporte.');
        } finally {
            setIsAuthLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAuthLoading, checkSession, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, useAuth };