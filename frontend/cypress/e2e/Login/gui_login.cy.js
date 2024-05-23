/// <reference types="Cypress"/>

describe('Teste Funcional de Login', () => {
    it('Login com dados válidos', () => {
        cy.visit("http://localhost:5173/")
        cy.get('[placeholder="Insira seu email"]').type("estudante@example.com")
        cy.get('[type="password"]').type("senha123")
        cy.get('button').click()
        cy.get('[href="/"] > a > li').should('contain', 'Home')
    });

    it('Login com senha incorreta', () => {
        cy.intercept('POST', 'http://localhost:3000/login', (req) => {
          req.reply({
            statusCode: 402,
            body: {
              error: 'Senha Inválida'
            }
          });
        }).as('loginRequest');
        cy.visit("http://localhost:5173/");
        cy.get('[placeholder="Insira seu email"]').type("estudante@example.com");
        cy.get('[type="password"]').type("senhaErrada");
        cy.get('button').click();
        cy.wait('@loginRequest');
        cy.get('.error').should('contain', 'Senha Inválida');
      });

    it('Login com Email incorreto', () => {
        cy.intercept('POST', 'http://localhost:3000/login', (req) => {
          req.reply({
            statusCode: 402,
            body: {
              error: 'E-mail Inválido'
            }
          });
        }).as('loginRequest');
        cy.visit("http://localhost:5173/");
        cy.get('[placeholder="Insira seu email"]').type("invalido@example.com");
        cy.get('[type="password"]').type("senha123");
        cy.get('button').click();
        cy.wait('@loginRequest');
        cy.get('.error').should('contain', 'E-mail Inválido');
      });
      
    it('Login sem preencher campos obrigatórios ', () => {
        cy.visit("http://localhost:5173/");
        cy.get('button').click();
        cy.get('.error').should('contain', 'Por favor, preencha todos os campos.');
      });
      
      

});