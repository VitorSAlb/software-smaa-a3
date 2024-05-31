import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RelatorioModal from '../RelatorioModal/RelatorioModal';
import { Link } from "react-router-dom";

import './Relatorio.css'

const Relatorio = (props) => {
    const [relatorios, setRelatorios] = useState([]);
    const [selectedRelatorio, setSelectedRelatorio] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        const fetchRelatorios = async () => {
            try {
                const response = await axios.get('http://localhost:3000/relatorios');
                setRelatorios(response.data);
            } catch (error) {
                console.error('Erro ao buscar relatórios:', error);
            }
        };
        fetchRelatorios();
    }, []);

    const openModal = (relatorio) => {
        setSelectedRelatorio(relatorio);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedRelatorio(null);
    };

    return(
        <div className="relatorios-container">
            <div className="title">
                <h1>Relatorios</h1>
                <Link to={'/'} id="newRel">+</Link>
            </div>
            <hr/>
            <div className="relatorios">
                <div className='cards-relatorios no-selection'>
                    {relatorios.map((relatorio) => (
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
                    />
                )}
                </div>
        </div>
    )
}

export default Relatorio;