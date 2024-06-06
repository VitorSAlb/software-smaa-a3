import React, { useState } from 'react';
import Modal from 'react-modal';
import api from '../../api/api';
import './styles.css'

Modal.setAppElement('#root');

const ModalEditarUsuario = ({ isOpen, userData, handleClose }) => {
    const [formData, setFormData] = useState({
        nome: userData.nome,
        data_nascimento: userData.data_nascimento,
        telefone: userData.telefone,
        email: userData.email,
        username: userData.username,
        senha: '',
        status: userData.status
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/usuarios/${userData.id}`, formData);
            handleClose();
            window.location.reload();
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
        }
    };

    const customStyles = {
        content: {
            width: 'fit-content',
            minHeight: '400px',
            height: 'fit-content',
            background: '#fff',
            padding: '20px',
            borderRadius: '10px',
            margin: 'auto',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={handleClose} style={customStyles}>
            <div className='.no-selection'>
                <h2 className='no-selection'>Editar Dados do Usuário</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Nome:
                        <br/>
                        <input type="text" name="nome" placeholder={formData.nome} onChange={handleChange} size={50} />
                    </label>
                    <label>
                        Email:
                        <br/>
                        <input type="email" name="email" value={formData.email} placeholder='example@sapa.com' onChange={handleChange} size={50} />
                    </label>
                    <label>
                        Nova Senha:
                        <br/>
                        <input className='input-max' type="text" name="senha" value={formData.senha} placeholder="Nova senha" onChange={handleChange} />
                    </label>
                    <div className='row-label'>
                        <label>
                            Data de Nascimento:
                            <br/>
                            <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
                        </label>
                        <label>
                            Telefone:
                            <br/>
                            <input type="tel" name="telefone" value={formData.telefone} placeholder='(xx) xxxxx-xxxx' onChange={handleChange} />
                        </label>
                    </div>
                    

                    <button className='btn-modal' type="submit">Salvar</button>
                    <button className='btn-modal red' type="button" onClick={handleClose}>Cancelar</button>
                </form>
            </div>
        </Modal>
    );
};

export default ModalEditarUsuario;
