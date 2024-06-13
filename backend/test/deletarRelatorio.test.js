import request from 'supertest';
import app from '../server.js'; 
import { openDB } from '../configDB.js'; 

describe('DELETE /relatorios/:id', () => {
  beforeAll(async () => {
    const db = await openDB();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS relatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mediador_id INTEGER,
        estudante_id INTEGER,
        anotacoes TEXT NOT NULL,
        data_criacao DATETIME DEFAULT (datetime('now'))
      )
    `);
  });

  const insertRelatorio = async () => {
    const db = await openDB();
    const result = await db.run(`
      INSERT INTO relatorios (mediador_id, estudante_id, anotacoes)
      VALUES (?, ?, ?)
    `, [1, 2, 'Anotação de teste']); 
    return result.lastID;
  };

  it('Deve deletar um relatório com sucesso pelo mediador', async () => {
    const relatorioId = await insertRelatorio();
    const response = await request(app)
      .delete(`/relatorios/${relatorioId}`)
      .set('user-type', 'mediador');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Relatório deletado com sucesso!');
  });

  it('Deve deletar um relatório com sucesso pelo estudante', async () => {
    const relatorioId = await insertRelatorio();
    const response = await request(app)
      .delete(`/relatorios/${relatorioId}`)
      .set('user-type', 'estudante');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Relatório deletado com sucesso!');
  });

  it('Deve falhar ao tentar deletar um relatório inexistente', async () => {
    const response = await request(app)
      .delete(`/relatorios/9999`)
      .set('user-type', 'mediador');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Relatório não encontrado.');
  });

  it('Deve falhar ao tentar deletar um relatório com tipo de usuário inválido', async () => {
    const relatorioId = await insertRelatorio();
    const response = await request(app)
      .delete(`/relatorios/${relatorioId}`)
      .set('user-type', 'invalido');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Tipo de usuário inválido.');
  });

  afterAll(async () => {
    const db = await openDB();
    await db.run(`DELETE FROM relatorios`);
  });
});