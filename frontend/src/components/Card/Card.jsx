import React from "react";
import './Card.css';

import puzzle4x4 from './assets/puzzle-4x4.svg';
import { Link } from "react-router-dom";

const Card = ({ titulo, image, link, onClick }) => {
    return (
        <div className="card-container no-selection">
            <img className="pz4x4" src={puzzle4x4} />
            {onClick ? (
                <div className="card-info" onClick={onClick}>
                    <img src={image} alt={titulo} />
                    <h4>{titulo}</h4>
                </div>
            ) : (
                <Link to={link} className="card-info">
                    <img src={image} alt={titulo} />
                    <h4>{titulo}</h4>
                </Link>
            )}
        </div>
    );
}

export default Card;
