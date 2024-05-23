## Comandos

git commit
> para realizar o commit utilizando o commitizen e o husky

npm run dev:
> Na pasta frontend, você consiguira executar este codigo para abrir a versão de desenvolvedor do vite

## Comandos Antigos

npm install commitizen -D -g
> para instalar o comitizen na sua maquina global

git cz:
> Faz os commits de acordo com o Conventional Commits

### Documentação do projeto

## Sistema de monitoramento de alunos atípicos - SMAA
> Especificação de requisitos

Equipe: 
- Lucas Pedroza
- Vitor Albuquerque
- Lucas Lima
- Wadson Daniel
- Henrique Taruffe

## 1. Introdução

> 1.1. Objetivo 
O atual documento da especificação de requisitos tem como objetivo garantir uma compreensão clara e completa do que o sistema deve realizar, fornecendo uma base sólida para o desenvolvimento, teste e implementação.

> 1.2. Escopo 
Nome do projeto: Sistema de monitoramento de alunos atípicos - SMAA 
O projeto consiste em desenvolver um sistema para o monitoramento de alunos atípicos. O monitoramento é feito através de um mediador, que tem como função observar o comportamento da criança e registrar ocorrências e casos diários no sistema. Após o fim do dia, relatórios são gerados automaticamente e enviados para os responsáveis do aluno

> 1.3. Definições, acrônimos e abreviações

Vite: É uma ferramenta de construção de projetos em frontend que se destina a oferecer uma experiência de desenvolvimento mais rápida e leve para projetos webs mais modernos.
Python: É uma linguagem de programação de alto nível, interpretada de script, imperativa, orientada a objetos,funcional, de tipagem dinâmica e forte.
FastAPI: É uma estrutura web moderna lançada para construir APIs RESTful em Python.

> 1.4. Visão geral
Durante o restante da especificação, haverá a descrição completa do projeto, onde todos os requisitos serão listados e detalhados. A divisão dos requisitos foi feita da seguinte maneira: requisitos funcionais, requisitos de usabilidade, atributos de qualidade, características dos usuários, restrições e suposições e dependências.

## 2. Descrição Geral 

> 2.1. Requisitos Funcionais
- O registro de conta é feito a partir de um email e senha, ao acessar o sistema o próprio usuário deve preencher suas informações pessoais, essas informações variam para cada tipo de conta.

- Devem haver 3 tipos de conta:
1. Aluno - acessada pelos responsáveis pela criança.

2. Mediador - acessada por quem está responsável pelos cuidados da criança.

3. Instituição - acessada por superiores da instituição na qual o sistema foi implementado. É responsável por criar o registro do aluno e do mediador.

- Interface para entrada do registro de ocorrência e casos diários para cada aluno.

- Filtros para encontrar Alunos, Mediadores e Pais.

- Sistema para gerar relatórios para todas as crianças no final do dia, usando os dados do registro de ocorrência e casos diários.

- Sistema para enviar o relatório gerado para os responsáveis cadastrados.

- a conta da instituição é responsável por criar o registro do aluno e do mediador.

A conta do aluno será acessada pelos responsáveis do aluno registrado. No perfil do aluno será exibida uma ficha contendo informações sobre os cuidados do aluno, os cuidados são: 
1. Remédios controlados e para situações de necessidade
2. Métodos e técnicas para lidar com acontecimentos específicos
3. Números de contato
4. Informações sobre o plano de saúde
5. Personalidade do aluno ( Extrovertido, Introvertido, Agitado... )
As informações e a ficha do aluno devem ser editadas diretamente pelo usuário conectado à conta do aluno.
O perfil do aluno deve possuir uma seção para o relatório. 
Na seção relatório no perfil do aluno, os mediadores poderão deixar notas sobre o comportamento do aluno
Ao fim do dia, todas as notas registradas pelo mediador são enviadas automaticamente para e-mails pré-cadastrados.
A tela exibe o perfil do Mediador e será acessada pelo próprio e pela instituição de ensino. O perfil do mediador contém informações básicas sobre o próprio, como nome, idade, experiência e os alunos que ele está cuidando no momento.

Essa página poderá ser acessada por todos usuários do sistema. Nesse relatório será anunciado as atividades diárias que o aluno participou e qual foi seu rendimento. Assim o feedback será atualizado a cada momento que o dia seguinte vier, trazendo novas atividades e novos resultados ao fim. Os relatórios são reiniciados ao início de cada dia.
> 2.3. Atributos de qualidade
- A aplicação deve ser responsiva e ágil no processamento de solicitações, o tempo de processamento deve ser otimizado para evitar atrasos perceptíveis pelo usuário.

- A aplicação deve ser capaz de lidar com um aumento de usuários sem interrupções ou quedas no desempenho.

- A aplicação deve usar os recursos de CPU, memória etc de forma eficiente.

- A aplicação deve funcionar em diferentes navegadores e dispositivos (desktop, tablet, celular).

- A aplicação web deve ser minimalista e conter o mínimo de conteúdo possível por página, tornando o sistema prático e rápido de se usar.

> 2.4. Características de usuário

Há 3 tipos de usuários do sistema:

Mediador: Pessoa a qual foi atribuído o papel de cuidador/observador pelos cuidados do aluno, é a partir do mediador que o registro da atividade do aluno é feito.
É necessário experiência com pessoas atípicas ou um treinamento prévio para que a pessoa possa ser designada a esse tipo de atividade.

Responsável: Pais biológicos ou responsáveis pela guarda do aluno. Esses usuários não terão contas em seu nome, eles irão administrar a conta do seu filho.

Instituição: Coordenadores, diretor(a) ou pessoas com altos cargos atribuídos na instituição de ensino no qual o sistema será implementado.

> 2.5. Restrições
A aplicação será produzida para web. O desenvolvimento Front-end vai ser feito utilizando Vite e a framework React. Para o desenvolvimento Back-end, será realizado usando a framework FastAPI e python.
A aplicação será responsiva, porém algumas medidas de resolução de tela podem trazer problemas a interface, resultando na dificuldade do uso da aplicação.



