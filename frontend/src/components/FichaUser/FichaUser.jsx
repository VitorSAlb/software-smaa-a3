import React from "react";
import './FichaUser.css';

const FichaUser = ({ userData, condEsp, temperamento, alergias, hiperfocos, planoSaude }) => {

    function DescobrindoIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        // Verifica se o aniversário já passou este ano; se não, subtrai 1 da idade.
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    }

    function converterData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <div className="ficha-container">
            <div className="ficha-section">
                <div className="ficha-img">
                    <img src={userData.image ? userData.image : null}/>
                </div>

                <div className="ficha-info">
                    <div className="ficha-nome-data">
                        <h1>{userData.nome ? userData.nome : 'undefined'}</h1>
                        <div className="idade-data">
                            <h3>{DescobrindoIdade(userData.data_nascimento) ? DescobrindoIdade(userData.data_nascimento) + ' anos' : 'undefined'}</h3>
                            <hr/>
                            <h4>{converterData(userData.data_nascimento) ? converterData(userData.data_nascimento) : 'undefined'}</h4>
                        </div>
                        <h4>{userData.email ? userData.email : 'undefined'}</h4>
                        <h4>{userData.telefone ? userData.telefone : 'undefined'}</h4>
                    </div>
                    
                    <div className="ficha">
                        <div className="section-one">
                            <div className="titulo-ficha">
                                <h3>Ficha Rápida:</h3>
                                <br/>   
                            </div>
                            <div className="lista-rapida">
                                <div className="list">
                                    <h3><strong>Condição Especial:</strong> {condEsp}</h3>
                                    <h3><strong>Temperamento:</strong> {temperamento}</h3>
                                    <h3><strong>Alergias:</strong> {alergias}</h3>
                                    <h3><strong>Hiperfocos:</strong> {hiperfocos}</h3>
                                    <h3><strong>Plano de Saúde:</strong> {planoSaude}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FichaUser;
