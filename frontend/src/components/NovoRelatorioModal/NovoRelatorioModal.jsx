import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './NovoRelatorioModal.css';
import { AuthContext } from '../../context/auth';

Modal.setAppElement('#root');

const NovoRelatorioModal = ({ isOpen, onRequestClose, onRelatorioCriado }) => {
    const { user } = useContext(AuthContext);
    const [estudantes, setEstudantes] = useState([]);
    const [selectedEstudante, setSelectedEstudante] = useState('');
    const [anotacoes, setAnotacoes] = useState('');

    useEffect(() => {
        const fetchEstudantes = async () => {
            try {
                const response = await axios.get('http://localhost:3000/estudantes');
                setEstudantes(response.data);
            } catch (error) {
                console.error('Erro ao buscar estudantes:', error);
            }
        };

        if (isOpen) {
            fetchEstudantes();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!selectedEstudante || !anotacoes) {
            alert('Todos os campos são obrigatórios');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:3000/relatorios', {
                estudante_id: selectedEstudante,
                mediador_id: user.id,
                anotacoes: anotacoes
            });
    
            console.log('Relatório criado com sucesso:', response.data);
    
            onRequestClose();
            onRelatorioCriado();
        } catch (error) {
            console.error('Erro ao criar relatório:', error);
            alert('Erro ao criar relatório');
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
                    <button type="submit">Criar Relatório</button>
                </form>
                <button className='modal-btn' onClick={onRequestClose}>Fechar</button>
            </div>
        </Modal>
    );
};

export default NovoRelatorioModal;
