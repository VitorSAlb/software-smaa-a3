import React from "react";
import './Login.css';
import { Link } from "react-router-dom";

const Login = () => {

    return(
        <div className="login-bg">
            <div className="login-container">
                <div className="login-titulo">
                    <h1>Login</h1>
                </div>

                <div className="form-container">
                    <div className="input-section">
                        <input placeholder="Insira seu email" />
                        <input placeholder="Insira sua senha" />
                    </div>
        

                    <div className="button-section">
                        <button>Entrar</button>
                        <Link to={'/Cadastro'}><a>Ir para cadastro</a></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;