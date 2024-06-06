import { createContext, useEffect, useState } from "react";
import api from '../api/api'; 

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();

    useEffect(() => {
        const userToken = localStorage.getItem('user_token');
        if (userToken) {
            console.log('Token encontrado no localStorage:', userToken);  // Adicionando log
            api.defaults.headers.Authorization = `Bearer ${userToken}`;
            setUser({ token: userToken }); 
        }
    }, []);

    const signin = async (email, password) => {
        try {
            const response = await api.post('/login', { email, senha: password });
            const { data } = response;
    
            console.log('Token recebido após login:', data.token);  // Adicionando log
            localStorage.setItem('user_token', data.token);
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
            setUser({ email, token: data.token });
            return null;
        } catch (error) {
            return error.response ? error.response.data.error : "Erro ao fazer login";
        }
    };
    
    const signout = async () => {
        localStorage.removeItem('user_token');
        setUser(null);
        window.location.href = '/';
    };

    const signup = async (userData) => {
        try {
            await api.post('/usuarios', userData);
            return null;
        } catch (error) {
            return error.response ? error.response.data.error : "Erro ao fazer cadastro";
        }
    };

    const getMe = async () => {
        try {
            const response = await api.get('/me');
            setUser(response.data);
            return response.data;
        } catch (error) {
            return error.response ? error.response.data.error : "Erro ao obter dados do usuário";
        }
    };

    return (
        <AuthContext.Provider value={{ user, signin, signup, signout, getMe }}>
            {children}
        </AuthContext.Provider>
    );
};
