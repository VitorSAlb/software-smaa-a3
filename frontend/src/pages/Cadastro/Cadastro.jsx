import React, { useState } from "react";
import './Cadastro.css';
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/Footer/Footer";

const Cadastro = () => {
    const [nome, setNome] = useState('');
    const [idade, setIdade] = useState('');
    const [telefone, setTelefone] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [email, setEmail] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState(null); // Estado separado para cada tipo de usuário
    const navigate = useNavigate();

    const handleCheckboxChange = (tipo) => {
        setTipoUsuario(tipo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tipoUsuario) {
            alert('Selecione o tipo de usuário');
            return;
        }

        const usuario = {
            nome,
            data_nascimento: dataNascimento,
            telefone,
            email,
            username: email,
            senha: 'abc123',
            status: true,
            tipo_usuario: tipoUsuario
        };

        try {
            const response = await fetch('http://localhost:3000/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(usuario),
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                navigate('/');
            } else {
                const errorData = await response.json();
                alert(`Erro no cadastro: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Erro ao cadastrar. Tente novamente mais tarde.');
        }
    };

    return (
        <>
            <Header/>
            <div className="cadastro-bg no-selection">
                <div className="cadastro-container">
                    <div className="cadastro-titulo">
                        <h1>Cadastro</h1>
                    </div>

                    <div className="form-container">
                        <form onSubmit={handleSubmit} className="input-section">
                            <input 
                                type="text" 
                                placeholder="Insira o nome" 
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                            <input 
                                type="number" 
                                placeholder="Telefone" 
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                required
                            />
                            <input 
                                type="date" 
                                value={dataNascimento}
                                onChange={(e) => setDataNascimento(e.target.value)}
                                required
                            />
                            <input 
                                type="email" 
                                placeholder="Insira o email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <p>A senha padrão é 'abc123'</p> 
                            <div className="checkbox-section">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={tipoUsuario === 'mediador'}
                                        onChange={() => handleCheckboxChange('mediador')}
                                    />
                                    Mediador
                                </label>
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={tipoUsuario === 'estudante'}
                                        onChange={() => handleCheckboxChange('estudante')}
                                    />
                                    Estudante
                                </label>
                            </div>
                            <div className="button-section">
                                <button type="submit">Cadastrar</button>
                                <Link to={'/'}><a>Ir para login</a></Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
        
    );
}

export default Cadastro;
