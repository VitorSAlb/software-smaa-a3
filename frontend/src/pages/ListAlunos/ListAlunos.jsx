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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllUsers = async () => {
            if (user) {
                try {
                    const response = await api.get(`/usuarios/instituicao/${user.id}`);
                    setAllUsers(response.data);
                } catch (error) {
                    console.error('Erro ao buscar estudantes:', error);
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
        fetchAllUsers();
        fetchStudents();
    }, [user]);

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
                                    <Link to={`/perfil/${allUser.id}`} className="student-link"> {/* Adicione o Link aqui */}
                                        <div className="student-card">
                                            <p><strong>Nome:</strong> {student.nome}</p>
                                            <p><strong>Email:</strong> {student.email}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        ) : (
                            <p>Não há estudantes associados a este perfil.</p>
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
                                    <Link to={`/perfil/${students.id}`} className="student-link"> {/* Adicione o Link aqui */}
                                        <div className="student-card">
                                            <p><strong>Nome:</strong> {student.nome}</p>
                                            <p><strong>Email:</strong> {student.email}</p>
                                        </div>
                                    </Link>
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
