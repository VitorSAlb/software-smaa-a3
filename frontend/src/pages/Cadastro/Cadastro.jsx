import React from "react";
import './Cadastro.css';
import { Link } from "react-router-dom";

const Login = () => {

    return(
        <div className="cadastro-bg">
            <div className="cadastro-container">
                <div className="cadastro-titulo">
                    <h1>Cadastro</h1>
                </div>

                <div className="form-container">
                    <div className="input-section">
                        <input placeholder="Insira o nome" />
                        <input type="number" placeholder="Insira a idade" />
                        <input type="number" placeholder="Telefone" />
                        <input type="date" />
                        <input placeholder="Insira o email" />
                        {/* <input type="password" value='abc123' />*/}
                        <p>A senha padrão é 'abc123'</p> 
                        <div className="checkbox-section">
                            <label className="checkbox-label">
                                <input type='checkbox' id='mediador' name="mediador"/>
                                Mediador
                            </label>
                            <label className="checkbox-label">
                                <input type='checkbox' id='mediador' name="mediador"/>
                                Estudante
                            </label>
                        </div>
                        
                    </div>
        

                    <div className="button-section">
                        <button>Cadastrar</button>
                        <Link to={'/'}><a>Ir para login</a></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;