import React from 'react';
import Modal from 'react-modal';
import './RelatorioModal.css'

Modal.setAppElement('#root');


const RelatorioModal = ({ isOpen, onRequestClose, relatorio, onDelete, user }) => {

    const handleDelete = () => {
        onDelete(relatorio.id);
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
            <div className='modal-div'>
                <h2>Relatório ID: {relatorio.id}</h2>
                <p>Data: {new Date(relatorio.data_criacao).toLocaleDateString()}</p>
                <h3>Anotações:</h3>
                <p>{relatorio.anotacoes}</p>
                <p><strong>Estudante:</strong> {relatorio.estudante_nome}</p>
                <p><strong>Mediador:</strong> {relatorio.mediador_nome}</p>
            </div>
                
            
            <button className='modal-btn' onClick={onRequestClose}>Fechar</button>
            <button className='modal-btn' onClick={handleDelete}>Deletar</button>
        </Modal>
    );
};


export default RelatorioModal;
