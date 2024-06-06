import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import api from '../../api/api';
import './styles.css';

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
            window.location.reload();
        } catch (error) {
            console.error('Erro ao atualizar ficha do estudante:', error);
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
            <div className='no-selection'>
                <h2 className='no-selection'>Editar Ficha do Estudante</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Turma:
                        <br/> 
                        <input className='input-max' type="text" name="turma" value={formData.turma} onChange={handleChange} />
                    </label>
                    <label>
                        Temperamento:
                        <br/>
                        <input className='input-max' type="text" name="temperamento" value={formData.temperamento} onChange={handleChange} />
                    </label>
                    <label>
                        Condição Especial:
                        <br/>
                        <input className='input-max' type="text" name="condicao_especial" value={formData.condicao_especial} onChange={handleChange} />
                    </label>
                    <label>
                        Hiperfoco:
                        <br/>
                        <input className='input-max' type="text" name="metodos_tecnicas" value={formData.metodos_tecnicas} onChange={handleChange} />
                    </label>
                    <label>
                        Alergias:
                        <br/>
                        <input className='input-max' type="text" name="alergias" value={formData.alergias} onChange={handleChange} />
                    </label>
                    <label>
                        Plano de Saúde:
                        <br/>
                        <input className='input-max' type="text" name="plano_saude" value={formData.plano_saude} onChange={handleChange} />
                    </label>
                    <br/>
                    <button type="submit">Salvar</button>
                    <br/>
                    <button className='red' type="button" onClick={handleClose}>Cancelar</button>
                </form>
            </div>
        </Modal>
    );
};

export default ModalEditarFichaEstudante;
