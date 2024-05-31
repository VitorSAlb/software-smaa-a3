import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';

import FichaUser from '../../components/FichaUser/FichaUser';
import Loading from '../../components/Loading/Loading';
import Relatorio from '../../components/Relatorio/Relatorio';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/header/Header';

const StudentProfile = () => {
    const { id } = useParams();
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await api.get(`/estudantes/${id}`);
                setStudentData(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados do estudante:', error);
            }
        };

        fetchStudentData();
    }, [id]);

    if (!studentData) return <Loading />;

    return (
        <div>
            <Header/>
            <div className='padrao'>
                <FichaUser
                    userData={studentData}
                    condEsp={studentData.estudanteInfo?.condicao_especial || 'Não identificado'}
                    temperamento={studentData.estudanteInfo?.temperamento || 'Não identificado'}
                    alergias={studentData.estudanteInfo?.alergias || 'Não identificado'}
                    hiperfocos={studentData.estudanteInfo?.hiperfocos || 'Não identificado'}
                    planoSaude={studentData.estudanteInfo?.plano_saude || 'Não identificado'}
                />
                <Relatorio userId={studentData.id} />
            </div>
            <Footer />
        </div>
    );
};

export default StudentProfile;
