import request from 'supertest';
import app from '../server.js'; 
import { openDB } from '../configDB.js'; 

describe('POST /usuarios', () => {
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
    await db.run(`DELETE FROM usuarios`);
  });

  it('Deve registrar um novo usuário com sucesso', async () => {
    const novoUsuario = {
      nome: 'Novo Usuário',
      data_nascimento: '2000-01-01',
      telefone: '1234567890',
      foto: 'url_da_foto',
      email: 'novo_usuario@example.com',
      username: 'novousuario',
      senha: 'SenhaSegura123!',
      status: 'ativo',
      tipo_usuario: 'estudante'
    };

    const response = await request(app)
      .post('/usuarios')
      .send(novoUsuario);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Usuário adicionado com sucesso!');
  });

  it('Deve falhar ao tentar registrar um usuário com e-mail já cadastrado', async () => {
    const usuarioExistente = {
      nome: 'Usuário Existente',
      data_nascimento: '2000-01-01',
      telefone: '1234567890',
      foto: 'url_da_foto',
      email: 'usuario_existente@example.com',
      username: 'usuarioexistente',
      senha: 'SenhaSegura123!',
      status: 'ativo',
      tipo_usuario: 'estudante'
    };

    const db = await openDB();
    await db.run(`
      INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, Object.values(usuarioExistente));

    const response = await request(app)
      .post('/usuarios')
      .send(usuarioExistente);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('E-mail já cadastrado.');
  });

  afterAll(async () => {
    const db = await openDB();
    await db.run(`DELETE FROM usuarios`);
  });
});