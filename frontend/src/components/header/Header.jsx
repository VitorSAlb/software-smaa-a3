import React, { useContext, useEffect, useState } from "react";
import './Header.css';
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import api from "../../api/api"; // Importe a configuração do axios

const Header = (props) => {
    const { user, signout } = useContext(AuthContext);
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await api.get(`/user-details/${user.userId}`);
                setUserName(response.data.nome);
            } catch (error) {
                console.error('Erro ao obter detalhes do usuário:', error);
            }
        };

        if (user) {
            fetchUserDetails();
        }
    }, [user]);

    const handleLogout = () => {
        signout();
    };

    return(
        <header>
            <div className="user-info">
                <div className="user-img">
                    <img src={props.image}/>
                </div>
                <Link className="link-tag" to={'/'}><p>{userName}</p></Link>
            </div>
            
            <nav>
                <ul>
                    <Link to={'/'}><a href="#"><li>Home</li></a></Link>
                    <Link to={'/teste'}><a href="#"><li>Alunos</li></a></Link>
                    <Link to={'/teste'}><a href="#"><li>Relatório</li></a></Link>
                </ul>
            </nav>

            <div className="logout">
                <button onClick={handleLogout} className="btn-logout">Sair</button>
            </div>
        </header>
    )
}

export default Header;
