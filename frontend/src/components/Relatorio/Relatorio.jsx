import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import RelatorioModal from '../RelatorioModal/RelatorioModal';
import NovoRelatorioModal from '../NovoRelatorioModal/NovoRelatorioModal';
import { Link } from "react-router-dom";
import './Relatorio.css';
import { AuthContext } from '../../context/auth';
import api from '../../api/api';

const Relatorio = ({ userId }) => {
    const { user } = useContext(AuthContext);

    const [relatorios, setRelatorios] = useState([]);
    const [selectedRelatorio, setSelectedRelatorio] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [novoRelatorioModalIsOpen, setNovoRelatorioModalIsOpen] = useState(false);

    useEffect(() => {
        const fetchRelatorios = async () => {
            try {
                const response = await axios.get('http://localhost:3000/relatorios');
                setRelatorios(response.data);
            } catch (error) {
                
            }
        };
        fetchRelatorios();
    }, []);

    const filteredRelatorios = relatorios.filter(
        relatorio => relatorio.estudante_id === userId || (user && relatorio.mediador_id === user.id)
    );

    const openModal = (relatorio) => {
        setSelectedRelatorio(relatorio);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedRelatorio(null);
        window.location.reload()
    };

    const openNovoRelatorioModal = () => {
        setNovoRelatorioModalIsOpen(true);
    };

    const closeNovoRelatorioModal = () => {
        setNovoRelatorioModalIsOpen(false);
        window.location.reload()
    };

    const handleRelatorioCriado = () => {
        fetchRelatorios();
    };

    const handleRelatorioExcluido = async (id) => {
        try {
            await api.delete(`/relatorios/${id}`);
            closeModal(); // Fechar o modal após a exclusão
            window.location.reload()
        } catch (error) {
            console.error('Erro ao excluir relatório:', error);
        }
    };

    return (
        <div className="relatorios-container">
            <div className="title">
                <h1>Relatórios</h1>
                {user && user.tipo_usuario === 'mediador' && (
                    <button onClick={openNovoRelatorioModal} id="newRel">+</button>
                )}
            </div>
            <hr/>
            <div className="relatorios">
                <div className='cards-relatorios no-selection'>
                    {filteredRelatorios.map((relatorio) => (
                        <div className='card-rel' key={relatorio.id} onClick={() => openModal(relatorio)}>
                            <p>ID: {relatorio.id}</p>
                            <p>Data: {new Date(relatorio.data_criacao).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
                {selectedRelatorio && (
                    <RelatorioModal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        relatorio={selectedRelatorio}
                        onDelete={handleRelatorioExcluido} 
                    />
                )}
                <NovoRelatorioModal
                    isOpen={novoRelatorioModalIsOpen}
                    onRequestClose={closeNovoRelatorioModal}
                    onRelatorioCriado={handleRelatorioCriado}
                />
            </div>
        </div>
    );
};

export default Relatorio;
