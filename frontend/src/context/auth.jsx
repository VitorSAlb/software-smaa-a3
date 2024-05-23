import { createContext, useEffect, useState } from "react";
import api from '../api/api'; // Importe a configuração do axios

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();

    useEffect(() => {
        const userToken = localStorage.getItem('user_token');
        if (userToken) {
            setUser(JSON.parse(userToken));
        }
    }, []);

    const signin = async (email, password) => {
        try {
            const response = await api.post('/login', { email, senha: password });
            const { data } = response;
    
            localStorage.setItem('token', data.token); // Armazena o token no localStorage
            console.log('Token definido no localStorage:', data.token); // Mensagem de console para verificar se o token está sendo definido corretamente
            setUser({ email, token: data.token });
            return null;
        } catch (error) {
            return error.response ? error.response.data.error : "Erro ao fazer login";
        }
    };
    
    
    const signout = async () => {
        localStorage.removeItem('token');
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

    return (
        <AuthContext.Provider value={{ user, signin, signup, signout }}>
            {children}
        </AuthContext.Provider>
    );
};
