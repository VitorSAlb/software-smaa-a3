/// <reference types="Cypress"/>

describe('Teste Funcional de Login', () => {
    it('Verificando se tem estudantes cadastrado na instituição', () => {
        cy.visit("http://localhost:5173/")
        cy.get('[placeholder="Insira seu email"]').type("instituicao@example.com")
        cy.get('[type="password"]').type("senha123")
        cy.get('button').click()
        cy.get('ul > :nth-child(2) > a').click()
        cy.get(':nth-child(1) > .student-card > .action-buttons > select')
    });
    
    it('Verificando se tem mediador cadastrado na instituição', () => {
        cy.visit("http://localhost:5173/")
        cy.get('[placeholder="Insira seu email"]').type("instituicao@example.com")
        cy.get('[type="password"]').type("senha123")
        cy.get('button').click()
        cy.get('ul > :nth-child(2) > a').click()
        cy.get(':nth-child(3) > .student-card > .student-link > div > :nth-child(3) > strong')
    });

   
      
  
  });