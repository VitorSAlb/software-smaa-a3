import React from "react";
import './Header.css';
import { Link } from "react-router-dom";

const Header = (props) => {

    return(
        <header>
            <div className="user-info">
                <div className="user-img">
                    <img src={props.image}/>
                </div>
                <Link className="link-tag" to={'/'}><p>{props.nome ? props.nome : 'Nome do usuário'}</p></Link>
            </div>
            
            <nav>
                <ul>
                    <Link to={'/'}><a href="#"><li>Home</li></a></Link>
                    <Link to={'/'}><a href="#"><li>Home</li></a></Link>
                    <Link to={'/'}><a href="#"><li>Home</li></a></Link>
                </ul>
            </nav>

            <div className="logout">
                <button onClick={''}>Sair</button>
            </div>
        </header>
    )
}

export default Header;