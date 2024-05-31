import React, { useContext, useEffect, useState } from "react";
import './Header.css';
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import api from "../../api/api"; // Importe a configuração do axios
import Loading from "../Loading/Loading";

const Header = (props) => {
    const { user, signout, getMe } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userData && user) { // Adiciona uma verificação para evitar chamadas repetitivas
                const data = await getMe();
                setUserData(data);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, userData, getMe]); // Adiciona userData como dependência para garantir que não entre em loop

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300); // Pequeno atraso para transição suave

        return () => clearTimeout(timer);
    }, [userData]);

    if (loading) return <Loading />;

    const handleLogout = () => {
        signout();
    };

    return(
        <header className="no-selection">
            <div className="user-info">
                <div className="user-img">
                    <img src={props.image}/>
                </div>
                <Link className="link-tag" to={'/'}><p>{userData.nome}</p></Link>
            </div>
            
            <nav>
                <ul>
                    <li><Link to={'/home'}>Home</Link></li>
                    <li><Link to={'/list-alunos'}>Alunos</Link></li>
                    {/* <li><Link to={'/teste'}>Relatório</Link></li> */}
                </ul>
            </nav>

            <div className="logout">
                <button onClick={handleLogout} className="btn-logout">Sair</button>
            </div>
        </header>
    )
}

export default Header;
