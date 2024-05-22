import { openDB } from "./configDB.js"
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

async function createTables() {
    const db = await openDB();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            data_nascimento DATE NOT NULL,
            telefone VARCHAR(20),
            foto BYTEA,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            status BOOLEAN NOT NULL,
            tipo_usuario VARCHAR(20) NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS estudantes (
            usuario_id INT PRIMARY KEY,
            instituicao_id INT REFERENCES instituicoes(id),
            mediador_id INT REFERENCES mediadores(usuario_id),
            turma VARCHAR(255),
            temperamento VARCHAR(255),
            condicao_especial TEXT,
            metodos_tecnicas TEXT,
            alergias TEXT,
            plano_saude VARCHAR(255),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS mediadores (
            usuario_id INT PRIMARY KEY,
            instituicao_id INT REFERENCES instituicoes(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS instituicoes (
            usuario_id INT PRIMARY KEY,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
        `);
    console.log("Tabelas criadas com sucesso!");
}

app.listen(PORT, async () => {
    await createTables();
    console.log(`Servidor rodando na porta ${PORT}`);
  });