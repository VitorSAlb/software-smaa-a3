import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './NovoRelatorioModal.css';
import { AuthContext } from '../../context/auth';
import api from '../../api/api';

Modal.setAppElement('#root');

const NovoRelatorioModal = ({ isOpen, onRequestClose, onRelatorioCriado }) => {
    const { user } = useContext(AuthContext);
    const [estudantes, setEstudantes] = useState([]);
    const [selectedEstudante, setSelectedEstudante] = useState('');
    const [anotacoes, setAnotacoes] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            if (user) {
                try {
                    const response = await api.get(`/estudantes/mediador/${user.id}`);
                    setEstudantes(response.data);
                } catch (error) {
                    console.error('Erro ao buscar estudantes:', error);
                } 
            }
        };

        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!selectedEstudante || !anotacoes) {
            setErro('Todos os campos são obrigatórios');
            return;
        }

    
        try {
            const response = await api.post('/relatorios', {
                anotacoes: anotacoes,
                estudante_id: selectedEstudante,
                mediador_id: user.id
                
            });
    
            console.log('Relatório criado com sucesso:', response.data);
    
            onRequestClose();
            onRelatorioCriado();
            window.location.reload();
        } catch (error) {
            console.error('Erro ao criar relatório:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <div className='modal-div'>
                <h2>Criar Novo Relatório</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Selecionar Estudante:
                        <select value={selectedEstudante} onChange={(e) => setSelectedEstudante(e.target.value)}>
                            <option value="">Selecione um estudante</option>
                            {estudantes.map((estudante) => (
                                <option key={estudante.id} value={estudante.id}>
                                    {estudante.nome}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Anotações:
                        <textarea value={anotacoes} onChange={(e) => setAnotacoes(e.target.value)} />
                    </label>
                    {erro && <p className="erro">{erro}</p>}
                    <button type="submit">Criar Relatório</button>
                </form>
                <button className='modal-btn' onClick={onRequestClose}>Fechar</button>
            </div>
        </Modal>
    );
};

export default NovoRelatorioModal;
