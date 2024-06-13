import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { openDB } from '../configDB.js'; 
import app from '../server.js'; 
import jwt from 'jsonwebtoken';

app.use(bodyParser.json());

describe('PUT /estudantes/:id', () => {
  let token;
  let estudanteId;

  beforeAll(async () => {
    const db = await openDB();
    await db.exec(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      data_nascimento TEXT,
      telefone TEXT,
      foto TEXT,
      email TEXT UNIQUE,
      username TEXT UNIQUE,
      senha TEXT,
      status TEXT,
      tipo_usuario TEXT
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS estudantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      turma TEXT,
      temperamento TEXT,
      condicao_especial TEXT,
      metodos_tecnicas TEXT,
      alergias TEXT,
      plano_saude TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    await db.run(`DELETE FROM estudantes`);
    await db.run(`DELETE FROM usuarios`);

    const result = await db.run(`
      INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
      VALUES ('Estudante Teste', '2000-01-01', '1234567890', 'url_da_foto', 'estudante@example.com', 'estudanteteste', 'SenhaSegura123!', 'ativo', 'estudante')
    `);

    estudanteId = result.lastID;

    await db.run(`
      INSERT INTO estudantes (usuario_id, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude)
      VALUES (?, 'Turma 1', 'Calmo', 'Nenhuma', 'Método 1', 'Nenhuma', 'Plano 1')
    `, [estudanteId]);

    // Gerar um token de teste
    token = jwt.sign({ id: estudanteId, tipo_usuario: 'estudante' }, 'chave_secreta');
  });

  it('Deve atualizar os dados do estudante com sucesso', async () => {
    const novosDados = {
      turma: 'Turma 2',
      temperamento: 'Alegre',
      condicao_especial: 'Condicao 1',
      metodos_tecnicas: 'Método 2',
      alergias: 'Alergia 1',
      plano_saude: 'Plano 2'
    };
  
    const response = await request(app)
      .put(`/estudantes/${estudanteId}`)
      .set('Authorization', `Bearer ${token}`) 
      .set('user-type', 'estudante') 
      .send(novosDados);
  
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Dados do estudante atualizados com sucesso!');
  });

  it('Deve retornar 404 se o estudante não for encontrado', async () => {
    const novosDados = {
      turma: 'Turma 2',
      temperamento: 'Alegre',
      condicao_especial: 'Condicao 1',
      metodos_tecnicas: 'Método 2',
      alergias: 'Alergia 1',
      plano_saude: 'Plano 2'
    };
  
    const response = await request(app)
      .put('/estudantes/9999') 
      .set('Authorization', `Bearer ${token}`)
      .set('user-type', 'estudante') 
      .send(novosDados);
  
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Estudante não encontrado.');
  });
});