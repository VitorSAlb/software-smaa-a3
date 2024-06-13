import { sendReports } from "../enviarRelatorio.js"

jest.mock('../configDB.js', () => ({
    openDB: jest.fn().mockReturnValue({
        all: jest.fn(async () => [
            { email: 'luluquinhas090@gmail.com', anotacoes: 'Teste de Envio 1' },
        ]),
        run: jest.fn(async () => {})
    })
}));

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn(async () => {})
    })
}));

describe('sendReports', () => {
    it('envia relatórios por e-mail e limpa as anotações', async () => {
        await sendReports();

        expect(require('../configDB.js').openDB).toHaveBeenCalled();

        expect(require('nodemailer').createTransport().sendMail).toHaveBeenCalledWith({
            from: 'sapasoftware.edu@gmail.com',
            to: 'luluquinhas090@gmail.com',
            subject: 'Relatório Diário',
            text: 'Teste de Envio 1'
        });

        expect(require('../configDB.js').openDB().run).toHaveBeenCalledWith(expect.any(String), ['luluquinhas090@gmail.com']);
    });
});
