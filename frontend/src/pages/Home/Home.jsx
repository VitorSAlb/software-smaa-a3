import React, { useState, useContext } from "react";
import Header from "../../components/header/Header";
import Card from "../../components/Card/Card";

import userIcon from '../../assets/user-icon.svg';
import listIcon from '../../assets/list-user-icon.svg';
import relaIcon from '../../assets/relatorio-icon.svg';
import Footer from "../../components/Footer/Footer";
import NovoRelatorioModal from "../../components/NovoRelatorioModal/NovoRelatorioModal"; // Certifique-se de usar o caminho correto

import { AuthContext } from '../../context/auth';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleRelatorioCriado = () => {

    };

    return(
        <>
            <Header />

            <main>
                <Card titulo='Usuário' image={userIcon} link={'/'} />
                {user && (user.tipo_usuario === 'mediador' || user.tipo_usuario === 'instituicao') && (
                    <>
                        <Card titulo='Lista' image={listIcon} link={'/list-alunos'} />
                    </>
                )}
                {user && (user.tipo_usuario === 'mediador') && (
                    <>
                        <Card titulo='Relatório +' image={relaIcon} onClick={openModal} />
                    </>
                )}

            </main>

            {/* <Footer /> */}

            <NovoRelatorioModal 
                isOpen={isModalOpen} 
                onRequestClose={closeModal} 
                onRelatorioCriado={handleRelatorioCriado} 
            />
        </>
    )
}

export default Home;
