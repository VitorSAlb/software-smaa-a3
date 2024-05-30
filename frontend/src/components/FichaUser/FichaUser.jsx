import React from "react";

import './FichaUser.css';

const FichaUser = (props) => {

    return (
        <div className="ficha-container">
            <div className="ficha-section">
                <div className="ficha-img">
                    <img src={props.image ? props.image : null}/>
                </div>

                <div className="ficha-info">
                    <div className="ficha-nome-data">
                        <h1>{props.nome ? props.nome : 'undefined'}</h1>
                        <div className="idade-data">
                            <h3>{props.idade ? props.idade : 'undefined'}</h3>
                            <hr/>
                            <h4>{props.dataNascimento ? props.dataNascimento : 'undefined'}</h4>
                        </div>
                        <h4>{props.email ? props.email : 'undefined'}</h4>
                        <h4>{props.telefone ? props.telefone : 'undefined'}</h4>

                        
                    </div>
                    
                    <div className="ficha">
                        <div className="section-one">
                            <div className="titulo-ficha">
                                <h3>Ficha Rapida:</h3>
                            </div>
                            <div className="lista-rapida">
                                <ul>
                                    <li>aaaa</li>
                                    <li>aaaa</li>
                                    <li>aaaa</li>
                                    <li>aaaa</li>
                                </ul>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FichaUser;