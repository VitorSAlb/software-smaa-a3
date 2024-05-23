import React, { useState, useContext } from "react";
import './Login.css';
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth"; // Ajuste o caminho conforme necessário

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.'); 
            return;
        }

        const errorMessage = await signin(email, password);
        if (errorMessage) {
            setError(errorMessage);
        } else {
            navigate('/');
        }
    };

    return(
        <div className="login-bg">
            <div className="login-container">
                <div className="login-titulo">
                    <h1>Login</h1>
                </div>

                <div className="form-container">
                    <div className="input-section">
                        <input 
                            placeholder="Insira seu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input 
                            type="password"
                            placeholder="Insira sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <div className="button-section">
                        <button onClick={handleLogin}>Entrar</button>
                        <Link to={'/cadastro'}>Ir para cadastro</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;
