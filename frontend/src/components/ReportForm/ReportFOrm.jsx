// ReportForm.js
import React, { useState } from 'react';
import axios from 'axios';

const ReportForm = () => {
    const [anotacoes, setAnotacoes] = useState('');
    const [estudanteId, setEstudanteId] = useState('');
    const [mediadorId, setMediadorId] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/relatorios', {
                anotacoes,
                estudante_id: estudanteId,
                mediador_id: mediadorId
            });
            setMessage('Relatório criado com sucesso!');
        } catch (error) {
            setMessage('Erro ao criar relatório: ' + error.response.data.error);
        }
    };

    return (
        <div>
            <h1>Criar Relatório</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Anotações:</label>
                    <textarea value={anotacoes} onChange={(e) => setAnotacoes(e.target.value)} required />
                </div>
                <div>
                    <label>ID do Estudante:</label>
                    <input type="text" value={estudanteId} onChange={(e) => setEstudanteId(e.target.value)} required />
                </div>
                <div>
                    <label>ID do Mediador:</label>
                    <input type="text" value={mediadorId} onChange={(e) => setMediadorId(e.target.value)} required />
                </div>
                <button type="submit">Enviar Relatório</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ReportForm;
