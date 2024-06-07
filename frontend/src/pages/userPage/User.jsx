import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/auth';
import Header from '../../components/header/Header';
import FichaUser from '../../components/FichaUser/FichaUser';
import Loading from '../../components/Loading/Loading';
import Relatorio from '../../components/Relatorio/Relatorio';
import ModalEditarUsuario from '../../components/ModalEditUser/ModalEditarUsuario';
import ModalEditarFichaEstudante from '../../components/ModalEditFichaEstudante/ModalEditarFichaEstudante';
import './User.css'

const UserProfile = () => {
    const { user, getMe } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showEditFichaModal, setShowEditFichaModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userData && user) {
                const data = await getMe();
                setUserData(data);
            }
        };

        fetchUserData();
    }, [user, userData, getMe]);

    const handleEditUserClick = () => {
        setShowEditUserModal(true);
    };

    const handleEditFichaClick = () => {
        setShowEditFichaModal(true);
    };

    const handleCloseModals = () => {
        setShowEditUserModal(false);
        setShowEditFichaModal(false);
    };

    if (!userData) return <Loading />;

    return (
        <div>
            <Header />
            <div className='padrao'>
                <div className='UserProfile'>
                    <div className='info-up'>
                        <FichaUser 
                            userData={userData}
                            condEsp={userData.estudanteInfo?.condicao_especial || 'Não identificado'}
                            temperamento={userData.estudanteInfo?.temperamento || 'Não identificado'}
                            alergias={userData.estudanteInfo?.alergias || 'Não identificado'}
                            hiperfocos={userData.estudanteInfo?.hiperfocos || 'Não identificado'}
                            planoSaude={userData.estudanteInfo?.plano_saude || 'Não identificado'}
                            token={user.token}
                        />
                        
                    </div>
                

                    <div className='btn-up'>
                        {user.tipo_usuario === 'estudante' && (
                            <button onClick={handleEditFichaClick}>Editar Ficha</button>
                        )}
                        <button onClick={handleEditUserClick}>Editar Dados</button>
                    </div>
                
                </div>
                
                {user && (user.tipo_usuario === 'mediador' || user.tipo_usuario === 'estudante') && (
                    <>
                        <Relatorio userId={userData.id} />
                    </>
                )}
                

            </div>
            {showEditUserModal && (
                <ModalEditarUsuario
                    isOpen={showEditUserModal}
                    userData={userData}
                    handleClose={handleCloseModals}
                />
            )}
            {showEditFichaModal && (
                <ModalEditarFichaEstudante
                    isOpen={showEditFichaModal} 
                    userData={userData}
                    handleClose={handleCloseModals}
                />
            )}
        </div>
    );
};

export default UserProfile;
