import React, { useState } from "react";
import axios from 'axios';
import './FichaUser.css';

const FichaUser = ({ userData, condEsp, temperamento, alergias, hiperfocos, planoSaude, token }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nome: userData.nome || '',
        email: userData.email || '',
        telefone: userData.telefone || '',
        condEsp: condEsp || '',
        temperamento: temperamento || '',
        alergias: alergias || '',
        hiperfocos: hiperfocos || '',
        planoSaude: planoSaude || '',
    });

    function DescobrindoIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    }

    function converterData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    const handleEditClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const userId = userData.id;  // Obtém o ID do usuário das props
            const response = await axios.put(`http://localhost:3000/usuarios/${userId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}` // Adicione o token de autorização se necessário
                }
            });
            console.log('Dados atualizados com sucesso:', response.data);
            
            // Após a atualização, você pode fechar o modal
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erro ao atualizar os dados:', error);
        }
    };
    
    return (
        <div className="ficha-container">
            <div className="ficha-section">
                <div className="ficha-img">
                    <img src={userData.image ? userData.image : null} />
                </div>

                <div className="ficha-info">
                    <div className="ficha-nome-data">
                        <h1>{userData.nome ? userData.nome : 'undefined'}</h1>
                        <div className="idade-data">
                            <h3>{DescobrindoIdade(userData.data_nascimento) ? DescobrindoIdade(userData.data_nascimento) + ' anos' : 'undefined'}</h3>
                            <hr/>
                            <h4>{converterData(userData.data_nascimento) ? converterData(userData.data_nascimento) : 'undefined'}</h4>
                        </div>
                        <h4>{userData.email ? userData.email : 'undefined'}</h4>
                        <h4>{userData.telefone ? userData.telefone : 'undefined'}</h4>
                        <button onClick={handleEditClick}>Editar</button>
                    </div>
                    
                    <div className="ficha">
                        <div className="section-one">
                            <div className="titulo-ficha">
                                <h3>Ficha Rápida:</h3>
                                <br/>   
                            </div>
                            <div className="lista-rapida">
                                <div className="list">
                                    <h3><strong>Condição Especial:</strong> {condEsp}</h3>
                                    <h3><strong>Temperamento:</strong> {temperamento}</h3>
                                    <h3><strong>Alergias:</strong> {alergias}</h3>
                                    <h3><strong>Hiperfocos:</strong> {hiperfocos}</h3>
                                    <h3><strong>Plano de Saúde:</strong> {planoSaude}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2>Editar Informações</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Nome:
                                <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
                            </label>
                            <label>
                                Email:
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </label>
                            <label>
                                Telefone:
                                <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} />
                            </label>
                            <label>
                                Condição Especial:
                                <input type="text" name="condEsp" value={formData.condEsp} onChange={handleChange} />
                            </label>
                            <label>
                                Temperamento:
                                <input type="text" name="temperamento" value={formData.temperamento} onChange={handleChange} />
                            </label>
                            <label>
                                Alergias:
                                <input type="text" name="alergias" value={formData.alergias} onChange={handleChange} />
                            </label>
                            <label>
                                Hiperfocos:
                                <input type="text" name="hiperfocos" value={formData.hiperfocos} onChange={handleChange} />
                            </label>
                            <label>
                                Plano de Saúde:
                                <input type="text" name="planoSaude" value={formData.planoSaude} onChange={handleChange} />
                            </label>
                            <button type="submit">Salvar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FichaUser;
