import React, { useContext, useEffect, useState } from "react";
import './Header.css';
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/auth";
import api from "../../api/api"; 
import Loading from "../Loading/Loading";

const Header = (props) => {
    const { user, signout, getMe } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userData && user) { 
                const data = await getMe();
                setUserData(data);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, userData, getMe]); 

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300); 

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
            
            <nav className="nav-center">
                <ul>
                    <li><Link to={'/home'}>Home</Link></li>
                    {userData && ( userData.tipo_usuario === 'instituicao' || userData.tipo_usuario === 'mediador') && (
                        <li><Link to={'/list-alunos'}>Alunos</Link></li>
                    )}
                    

                </ul>
            </nav>


            <div className="logout">
                <button onClick={handleLogout} className="btn-logout">Sair</button>
            </div>
        </header>
    )
}

export default Header;
