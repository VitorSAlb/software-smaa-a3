import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import api from '../../api/api';

Modal.setAppElement('#root');

const ModalEditarFichaEstudante = ({ isOpen, userData, handleClose }) => {
    const [formData, setFormData] = useState({
        turma: userData.estudanteInfo.turma,
        temperamento: userData.estudanteInfo.temperamento,
        condicao_especial: userData.estudanteInfo.condicao_especial,
        metodos_tecnicas: userData.estudanteInfo.metodos_tecnicas,
        alergias: userData.estudanteInfo.alergias,
        plano_saude: userData.estudanteInfo.plano_saude
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
            await api.put(`/estudantes/${userData.id}`, formData);
            handleClose();
        } catch (error) {
            console.error('Erro ao atualizar ficha do estudante:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={handleClose}>
            <div>
                <h2>Editar Ficha do Estudante</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="turma" value={formData.turma} onChange={handleChange} />
                    <input type="text" name="temperamento" value={formData.temperamento} onChange={handleChange} />
                    <input type="text" name="condicao_especial" value={formData.condicao_especial} onChange={handleChange} />
                    <input type="text" name="metodos_tecnicas" value={formData.metodos_tecnicas} onChange={handleChange} />
                    <input type="text" name="alergias" value={formData.alergias} onChange={handleChange} />
                    <input type="text" name="plano_saude" value={formData.plano_saude} onChange={handleChange} />
                    <button type="submit">Salvar</button>
                    <button type="button" onClick={handleClose}>Cancelar</button>
                </form>
            </div>
        </Modal>
    );
};

export default ModalEditarFichaEstudante;
