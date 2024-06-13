import { sendReports } from "../enviarRelatorio.js"

// Mock para a função openDB
jest.mock('../configDB.js', () => ({
    openDB: jest.fn().mockReturnValue({
        all: jest.fn(async () => [
            { email: 'luluquinhas090@gmail.com', anotacoes: 'Teste de Envio 1' },
        ]),
        run: jest.fn(async () => {})
    })
}));

// Mock para o nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn(async () => {})
    })
}));

describe('sendReports', () => {
    it('envia relatórios por e-mail e limpa as anotações', async () => {
        // Chama a função que deseja testar
        await sendReports();

        // Verifica se a função openDB foi chamada
        expect(require('../configDB.js').openDB).toHaveBeenCalled();

        // Verifica se o nodemailer foi chamado com os parâmetros corretos
        expect(require('nodemailer').createTransport().sendMail).toHaveBeenCalledWith({
            from: 'sapasoftware.edu@gmail.com',
            to: 'luluquinhas090@gmail.com',
            subject: 'Relatório Diário',
            text: 'Teste de Envio 1'
        });

        // Verifica se as anotações foram limpas corretamente
        expect(require('../configDB.js').openDB().run).toHaveBeenCalledWith(expect.any(String), ['luluquinhas090@gmail.com']);
    });
});
