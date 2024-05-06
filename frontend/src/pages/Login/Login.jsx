import React from "react";
import './Login.css';

const Login = () => {

    return(
        <div className="login-bg">
            <div className="login-container">
                <div className="login-titulo">
                    <h1>Login</h1>
                </div>

                <div className="form-container">
                    <input placeholder="Insira seu email" />
                    <input placeholder="Insira sua senha" />

                    <div className="button-section">
                        <button>Entrar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;