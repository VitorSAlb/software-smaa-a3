import React from "react";
import './Card.css'

import puzzle4x4 from './assets/puzzle-4x4.svg'
import { Link } from "react-router-dom";

const Card = (props) => {

    return(
        <div className="card-container no-selection">
            <img className="pz4x4" src={puzzle4x4} />
            <Link to={props.link ? props.link : '/teste'} className="card-info">
                {/* <p>{props.titulo ? props.titulo : 'titulo'}</p> */}
                <img src={props.image} alt={props.titulo}/>
                <h4>{props.titulo}</h4>
            </Link>
        </div>
    )
}

export default Card;