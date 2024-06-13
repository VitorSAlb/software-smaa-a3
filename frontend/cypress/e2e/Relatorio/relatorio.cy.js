/// <reference types="Cypress"/>

describe('Teste Funcional de Login', () => {
  it('Criando Relatorio Valido', () => {
      cy.visit("http://localhost:5173/")
      cy.get('[placeholder="Insira seu email"]').type("roberto@example.com")
      cy.get('[type="password"]').type("abc1234")
      cy.get('button').click()
      cy.get('#newRel').click()
      cy.get('select').select('Jorge Alemão')
      cy.get('textarea').clear().type('Este é um novo relatório!')
      cy.get('form > button').click()

  });
  it('Apagando Relatorio', () => {
      cy.visit("http://localhost:5173/")
      cy.get('[placeholder="Insira seu email"]').type("roberto@example.com")
      cy.get('[type="password"]').type("abc1234")
      cy.get('button').click()
      cy.get('.cards-relatorios > :nth-child(1)').click()
      cy.get('.ReactModal__Content > :nth-child(3)').click()

  });

  it('Criando Relatorio sem anotação', () => {
    cy.visit("http://localhost:5173/")
    cy.get('[placeholder="Insira seu email"]').type("roberto@example.com")
    cy.get('[type="password"]').type("abc1234")
    cy.get('button').click()
    cy.get('#newRel').click()
    cy.get('select').select('Jorge Alemão')
    cy.get('textarea').clear()
    cy.get('form > button').click()
    cy.get('form > button')
    cy.get('.erro')
});
  it('Criando Relatorio sem escolher o estudante', () => {
    cy.visit("http://localhost:5173/")
    cy.get('[placeholder="Insira seu email"]').type("roberto@example.com")
    cy.get('[type="password"]').type("abc1234")
    cy.get('button').click()
    cy.get('#newRel').click()
    cy.get('select')
    cy.get('textarea').clear().type('Este é um novo relatório!')
    cy.get('form > button').click()
    cy.get('form > button')
    cy.get('.erro')
});

 
    

});