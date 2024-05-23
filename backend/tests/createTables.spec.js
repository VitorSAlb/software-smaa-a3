import { createTables } from "../server" 
import { openDB } from '../configDB'; // Importe a função openDB para acessar o banco de dados de teste

describe('Testes de criação de tabelas', () => {
  // Função para limpar as tabelas após os testes
  afterAll(async () => {
    const db = await openDB(); // Abre o banco de dados de teste
    await db.exec(`
      DROP TABLE IF EXISTS estudantes;
      DROP TABLE IF EXISTS mediadores;
      DROP TABLE IF EXISTS instituicoes;
      DROP TABLE IF EXISTS usuarios;
    `); // Limpa as tabelas
  });

  test('Deve criar as tabelas corretamente', async () => {
    // Chama a função createTables
    await createTables();

    // Verifica se as tabelas foram criadas corretamente
    const db = await openDB(); // Abre o banco de dados de teste
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");

    // Lista de tabelas esperadas
    const expectedTables = ['estudantes', 'mediadores', 'instituicoes', 'usuarios'];

    // Verifica se todas as tabelas esperadas estão presentes no banco de dados
    expectedTables.forEach(table => {
      expect(tables.some(t => t.name === table)).toBe(true);
    });

  });
});