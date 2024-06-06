import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import api from '../../api/api';

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
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={handleClose}>
            <div>
                <h2>Editar Dados do Usuário</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} />
                    <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} />
                    <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    <input type="text" name="username" value={formData.username} onChange={handleChange} />
                    <input type="password" name="senha" placeholder="Nova senha" onChange={handleChange} />
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </select>
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={handleClose}>Cancelar</button>
                </form>
            </div>
        </Modal>
    );
};

export default ModalEditarUsuario;
