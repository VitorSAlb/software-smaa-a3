/// <reference types="Cypress"/>

describe('Teste Funcional de Login', () => {
    it('Criando Cadastro Valido', () => {
        cy.visit("http://localhost:5173/")
        cy.get('[placeholder="Insira seu email"]').type("instituicao@example.com")
        cy.get('[type="password"]').type("senha123")
        cy.get('button').click()
        cy.get('ul > :nth-child(2) > a').click()
        cy.get('.titulinho > :nth-child(2) > a').click()
        cy.get('[type="text"]').type('Aluno Teste')
        cy.get('[type="number"]').type('719999999')
        cy.get('[type="date"]').type('2000-01-01')
        cy.get('[type="email"]').type('testecy@example.com')
        cy.get('.checkbox-section > :nth-child(1) > input').check()
        cy.get('.button-section > button').click()
        cy.get(':nth-child(2) > a').click()
        cy.get(':nth-child(5) > .student-card')
    });

    it('Deletando Usuario', () => {
        cy.visit("http://localhost:5173/")
        cy.get('[placeholder="Insira seu email"]').type("instituicao@example.com")
        cy.get('[type="password"]').type("senha123")
        cy.get('button').click()
        cy.get(':nth-child(2) > a').click()
        cy.get(':nth-child(5) > .student-card > .action-buttons > button').click()
    })

    it('Criando Cadastro sem preencher campos obrigatórios', () => {
        cy.visit("http://localhost:5173/")
        cy.get('[placeholder="Insira seu email"]').type("instituicao@example.com")
        cy.get('[type="password"]').type("senha123")
        cy.get('button').click()
        cy.get('ul > :nth-child(2) > a').click()
        cy.get('.titulinho > :nth-child(2) > a').click()
        cy.get('.button-section > button').click()
        cy.get('.cadastro-titulo > h1')
    });
    
    it('Criando Cadastro com email invalido', () => {
        cy.visit("http://localhost:5173/")
        cy.get('[placeholder="Insira seu email"]').type("instituicao@example.com")
        cy.get('[type="password"]').type("senha123")
        cy.get('button').click()
        cy.get('ul > :nth-child(2) > a').click()
        cy.get('.titulinho > :nth-child(2) > a').click()
        cy.get('[type="text"]').type('Repetido Teste')
        cy.get('[type="number"]').type('719999999')
        cy.get('[type="date"]').type('2000-01-01')
        cy.get('[type="email"]').type('luquinhas@example.com')
        cy.get('.checkbox-section > :nth-child(1) > input').check()
        cy.get('.button-section > button').click()
        cy.get('.error-message')
    });
   
      
  
  });