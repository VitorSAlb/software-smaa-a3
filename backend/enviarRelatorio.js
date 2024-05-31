import { openDB } from './configDB.js';
import nodemailer from 'nodemailer';

// Configuração do nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Função para enviar relatórios por e-mail e limpar anotações
export async function sendReports() {
    const db = await openDB();
    const estudantes = await db.all(`
        SELECT u.email, r.anotacoes
        FROM usuarios u
        JOIN relatorios r ON u.id = r.estudante_id
        WHERE u.tipo_usuario = 'estudante'
    `);

    for (const estudante of estudantes) {
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: estudante.email,
            subject: 'Relatório Diário',
            text: estudante.anotacoes
        };

        await transporter.sendMail(mailOptions);

        // Limpar anotações do relatório
        await db.run(`
            UPDATE relatorios
            SET anotacoes = ''
            WHERE estudante_id = (
                SELECT id FROM usuarios WHERE email = ?
            )
        `, [estudante.email]);
    }
}