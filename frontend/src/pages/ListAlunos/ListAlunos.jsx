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
    const [allUser, setAllUsers] = useState([]);
    const [mediators, setMediators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllUsers = async () => {
            if (user) {
                try {
                    const response = await api.get(`/usuarios/instituicao/${user.id}`);
                    setAllUsers(response.data);
                } catch (error) {
                    console.error('Erro ao buscar usuários:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
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
        const fetchMediators = async () => {
            if (user) {
                try {
                    const response = await api.get(`/mediadores/${user.id}`);
                    setMediators(response.data);
                } catch (error) {
                    console.error('Erro ao buscar mediadores:', error);
                }
            }
        };

        
        fetchAllUsers();
        fetchStudents();
        fetchMediators();
    }, [user]);

    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`/usuarios/${userId}`);
            setAllUsers(allUser.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
        }
    };

    const handleAssignMediator = async (studentId, mediatorId) => {
        try {
            await api.post(`/estudantes/${studentId}/mediador`, { mediatorId });
            // Atualize a lista de estudantes ou faça alguma ação de feedback
        } catch (error) {
            console.error('Erro ao definir mediador:', error);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="student-list-container">
            <Header/>
            <div className="student-list-content">
                {user && (user.tipo_usuario === 'instituicao') && (
                    <>
                        <div className='titulinho'>
                            <h1>Lista de Usuarios</h1>
                            <a><Link to={'/cadastro'}>Cadastrar novo usuário</Link></a>
                        </div>
                        
                        {allUser.length > 0 ? (
                            <ul className="student-list">
                                {allUser.map(student => (
                                    <li key={student.id}>
                                        <div className="student-card">
                                            <Link to={`/perfil/${student.id}`} className="student-link"> {/* Corrigido aqui */}
                                                <div>
                                                    <p><strong>Nome:</strong> {student.nome}</p>
                                                    <p><strong>Email:</strong> {student.email}</p>
                                                    {student.tipo_usuario === 'mediador' && (
                                                        <p><strong>MediadorID:</strong> {student.id}</p>
                                                    )}
                                                </div>
                                            </Link>
                                            <div className="action-buttons">
                                                {student.tipo_usuario === 'estudante' && (
                                                    <select
                                                        onChange={(e) => handleAssignMediator(student.id, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Selecione um mediador</option>
                                                        {mediators.map(mediator => (
                                                            <option key={mediator.id} value={mediator.id}>{mediator.nome}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                <button onClick={() => handleDeleteUser(student.id)}>Deletar</button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Não há usuários associados a esta instituição.</p>
                        )}
                    </>
                )}
                {user && (user.tipo_usuario === 'mediador') && (
                    <>
                        <h1>Lista de Estudantes</h1>
                        {students.length > 0 ? (
                            <ul className="student-list">
                                {students.map(student => (
                                    <li key={student.id}>
                                        <div className="student-card">
                                            <Link to={`/perfil/${student.id}`} className="student-link"> {/* Corrigido aqui */}
                                                <div>
                                                    <p><strong>Nome:</strong> {student.nome}</p>
                                                    <p><strong>Email:</strong> {student.email}</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Não há estudantes associados a este perfil.</p>
                        )}
                    </>
                )}
                
            </div>
            <Footer className="student-list-footer" />
        </div>
    );
};

export default StudentList;
