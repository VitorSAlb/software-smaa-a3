import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../server';
import { describe, it } from 'mocha';

chai.use(chaiHttp);
const { expect } = chai;

describe('API Endpoints', () => {
    it('Deve realizar login com sucesso', (done) => {
        chai.request(app)
            .post('/login')
            .send({ email: 'instituicao@example.com', senha: 'senha123' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                done();
            });
    });

    it('Deve retornar erro com email inválido', (done) => {
        chai.request(app)
            .post('/login')
            .send({ email: 'invalid@example.com', senha: 'senha123' })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('error').eql('E-mail inválido.');
                done();
            });
    });

    it('Deve adicionar um novo usuário', (done) => {
        chai.request(app)
            .post('/usuarios')
            .send({
                nome: 'Novo Usuário',
                data_nascimento: '1990-01-01',
                telefone: '123456789',
                foto: null,
                email: 'novo_usuario@example.com',
                username: 'novousuario',
                senha: 'senha123',
                status: true,
                tipo_usuario: 'estudante'
            })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('message').eql('Usuário adicionado com sucesso!');
                done();
            });
    });

    it('Deve retornar um estudante específico', (done) => {
        chai.request(app)
            .get('/estudantes/1')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('nome');
                done();
            });
    });

    // Adicione mais testes conforme necessário
});
