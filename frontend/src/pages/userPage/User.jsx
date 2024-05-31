import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/auth';
import Header from '../../components/header/Header';
import FichaUser from '../../components/FichaUser/FichaUser';
import Loading from '../../components/Loading/Loading';
import Relatorio from '../../components/Relatorio/Relatorio';
import Footer from '../../components/Footer/Footer';

const UserProfile = () => {
    const { user, getMe } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);


    useEffect(() => {
        const fetchUserData = async () => {
            if (!userData && user) {
                const data = await getMe();
                setUserData(data);
            }
        };

        fetchUserData();
    }, [user, userData, getMe]);




    if (!userData) return <Loading />;

    return (
        <div>
            <Header />

            <div className='padrao'>
                <FichaUser 
                    userData={userData}
                    condEsp={userData.estudanteInfo?.condicao_especial || 'Não identificado'}
                    temperamento={userData.estudanteInfo?.temperamento || 'Não identificado'}
                    alergias={userData.estudanteInfo?.alergias || 'Não identificado'}
                    hiperfocos={userData.estudanteInfo?.hiperfocos || 'Não identificado'}
                    planoSaude={userData.estudanteInfo?.plano_saude || 'Não identificado'}
                    onEditName={() => openEditModal('Nome')} // Adicione um prop para abrir o modal de edição do nome
                />

                <Relatorio userId={userData.id} />
                
            </div>
            
            <Footer />
        </div>
    );
};

export default UserProfile;
