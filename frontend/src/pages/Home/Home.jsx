import React from "react";
import Header from "../../components/header/Header";
import Card from "../../components/Card/Card";

import userIcon from '../../assets/user-icon.svg';
import listIcon from '../../assets/list-user-icon.svg';
import relaIcon from '../../assets/relatorio-icon.svg';

const Home = () => {

    return(
        <>
            <Header/>

            <main>
                <Card titulo='Usuário' image={userIcon}/>
                <Card titulo='Lista de Alunos' image={listIcon}/>
                <Card titulo='Relatório +' image={relaIcon}/>
            </main>
        </>
    )
}

export default Home;