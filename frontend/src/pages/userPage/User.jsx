import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/auth';
import Header from '../../components/header/Header';
import FichaUser from '../../components/FichaUser/FichaUser';
import Loading from '../../components/Loading/Loading';

const UserProfile = () => {
    const { user, getMe } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userData && user) { // Adiciona uma verificação para evitar chamadas repetitivas
                const data = await getMe();
                setUserData(data);
            }
        };

        fetchUserData();
    }, [user, userData, getMe]); // Adiciona userData como dependência para garantir que não entre em loop

    if (!userData) return <Loading/>;

    function DescobrindoIdade(dataNascimeto) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimeto);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        // Verifica se o aniversário já passou este ano; se não, subtrai 1 da idade.
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    }

    function converterData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <>
            <Header/>


            {/* <h1>Perfil do Usuário</h1>
            <p>Nome: {userData.nome}</p>
            <p>Email: {userData.email}</p> */}
            {/* Adicione outros campos conforme necessário */}

            <div className='padrao'>
                <FichaUser 
                    nome={userData.nome} 
                    idade={DescobrindoIdade(userData.data_nascimento) + ' anos'} 
                    dataNascimento={converterData(userData.data_nascimento)}
                    email={userData.email}
                    telefone={userData.telefone}
                />
            </div>

            
        </>
    );
};

export default UserProfile;
