import React, { useContext } from "react";
import Header from "../../components/header/Header";
import Card from "../../components/Card/Card";

import userIcon from '../../assets/user-icon.svg';
import listIcon from '../../assets/list-user-icon.svg';
import relaIcon from '../../assets/relatorio-icon.svg';
import Footer from "../../components/Footer/Footer";


import { AuthContext } from '../../context/auth';

const Home = () => {
    const { user } = useContext(AuthContext);

    return(
        <>
            <Header />

            <main>
                <Card titulo='Usuário' image={userIcon} link={'/'} />
                {user && (user.tipo_usuario === 'mediador' || user.tipo_usuario === 'instituição') && (
                    <>
                        <Card titulo='Lista de Alunos' image={listIcon} link={'/lista-de-alunos'} />
                        <Card titulo='Relatório +' image={relaIcon} link={'/relatorio'} />
                    </>
                )}
            </main>

            <Footer />
        </>
    )
}

export default Home;