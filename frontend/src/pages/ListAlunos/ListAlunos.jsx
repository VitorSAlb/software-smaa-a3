import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom'; // Importe o Link
import api from '../../api/api';
import { AuthContext } from '../../context/auth';

import Footer from '../../components/Footer/Footer';
import Loading from '../../components/Loading/Loading';
import './ListAlunos.css';
import Header from '../../components/header/Header';

const StudentList = () => {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            if (user) {
                try {
                    const response = await api.get(`/estudantes/mediador/${user.id}`);
                    setStudents(response.data);
                } catch (error) {
                    console.error('Erro ao buscar estudantes:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStudents();
    }, [user]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="student-list-container">
            <Header/>
            <div className="student-list-content">
                <h1>Lista de Estudantes</h1>
                {students.length > 0 ? (
                    <ul className="student-list">
                        {students.map(student => (
                            <li key={student.id}>
                                <Link to={`/perfil/${student.id}`} className="student-link"> {/* Adicione o Link aqui */}
                                    <div className="student-card">
                                        <p><strong>Nome:</strong> {student.nome}</p>
                                        <p><strong>Email:</strong> {student.email}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Não há estudantes associados a este mediador.</p>
                )}
            </div>
            <Footer className="student-list-footer" />
        </div>
    );
};

export default StudentList;
