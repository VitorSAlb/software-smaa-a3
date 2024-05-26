import { openDB } from "./configDB.js"
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

export async function createTables() {
    const db = await openDB();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(255) NOT NULL,
            data_nascimento DATE NOT NULL,
            telefone VARCHAR(20),
            foto BYTEA,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            status BOOLEAN NOT NULL,
            tipo_usuario VARCHAR(20) NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS estudantes (
            usuario_id INT PRIMARY KEY,
            instituicao_id INT REFERENCES instituicoes(id),
            mediador_id INT REFERENCES mediadores(usuario_id),
            turma VARCHAR(255),
            temperamento VARCHAR(255),
            condicao_especial TEXT,
            metodos_tecnicas TEXT,
            alergias TEXT,
            plano_saude VARCHAR(255),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS mediadores (
            usuario_id INT PRIMARY KEY,
            instituicao_id INT REFERENCES instituicoes(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS instituicoes (
            usuario_id INT PRIMARY KEY,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
    `);
    console.log("Tabelas criadas com sucesso!");
}

export async function insertUsers() {
    const db = await openDB();

    // Verificar se já existem usuários na tabela
    const count = await db.get(`SELECT COUNT(*) AS count FROM usuarios`);
    
    if (count.count === 0) {
        // Inserir Instituição
        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES ('Instituição Exemplo', '2000-01-01', '999999999', NULL, 'instituicao@example.com', 'instituicao', 'senha123', TRUE, 'instituicao')
        `);

        const instituicaoUsuarioId = await db.get(`SELECT last_insert_rowid() AS id`);

        await db.run(`
            INSERT INTO instituicoes (usuario_id)
            VALUES (?)
        `, [instituicaoUsuarioId.id]);

        const instituicaoId = await db.get(`SELECT last_insert_rowid() AS id`);

        // Inserir Mediador
        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES ('Mediador Exemplo', '1990-05-15', '888888888', NULL, 'mediador@example.com', 'mediador', 'senha123', TRUE, 'mediador')
        `);

        const mediadorId = await db.get(`SELECT last_insert_rowid() AS id`);

        await db.run(`
            INSERT INTO mediadores (usuario_id, instituicao_id)
            VALUES (?, ?)
        `, [mediadorId.id, instituicaoId.id]);

        // Inserir Estudante
        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES ('Estudante Exemplo', '2005-09-10', '777777777', NULL, 'estudante@example.com', 'estudante', 'senha123', TRUE, 'estudante')
        `);

        const estudanteId = await db.get(`SELECT last_insert_rowid() AS id`);

        await db.run(`
            INSERT INTO estudantes (usuario_id, instituicao_id, mediador_id, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude)
            VALUES (?, ?, ?, 'Turma 1', 'Calmo', 'Nenhuma', 'Método A', 'Nenhuma', 'Plano XYZ')
        `, [estudanteId.id, instituicaoId.id, mediadorId.id]);

        console.log("Usuários inseridos com sucesso!");
    } else {
        console.log("Usuários já existem na tabela. Nenhum novo usuário foi inserido.");
    }
}

// ------------------------------------------------- MÉTODOS POST -------------------------------------------------
// função login para verificar email e senha de usuario
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const db = await openDB();

    try {
        const usuario = await db.get(`
            SELECT *
            FROM usuarios
            WHERE email = ?
        `, [email]);

        if (!usuario) {
            res.status(401).json({ error: 'E-mail inválido.' });
            return;
        }

        if (usuario.senha !== senha) {
            res.status(401).json({ error: 'Senha inválida.' });
            return;
        }

        // Geração do token JWT dentro do bloco de código onde 'usuario' está definida
        const token = jwt.sign({ userId: usuario.id, userType: usuario.tipo_usuario }, 'chave_secreta', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, 'chave_secreta', (err, decodedToken) => {
        if (err) return res.redirect('/'); // Redireciona para a tela de login
        req.user = decodedToken;
        next();
    });
};

const verifyStudent = (req, res, next) => {
    if (req.user.userType !== 'estudante') {
        return res.status(403).json({ error: 'Acesso negado. Somente estudantes podem executar esta ação.' });
    }
    next();
};

// Função para adicionar um novo usuário
app.post('/usuarios', async (req, res) => {
    const { nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario } = req.body;
    const db = await openDB();

    try {
        const emailExists = await db.get(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        const usernameExists = await db.get(`SELECT * FROM usuarios WHERE username = ?`, [username]);

        if (emailExists) {
            res.status(400).json({ error: 'E-mail já cadastrado.' });
            return;
        }

        if (usernameExists) {
            res.status(400).json({ error: 'Nome de usuário já cadastrado.' });
            return;
        }

        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario]);

        res.status(201).json({ message: 'Usuário adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Função para adicionar um novo mediador
app.post('/mediadores', async (req, res) => {
    const { nome, data_nascimento, telefone, foto, email, username, senha, status, instituicao_id } = req.body;
    const db = await openDB();

    try {
        const emailExists = await db.get(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        const usernameExists = await db.get(`SELECT * FROM usuarios WHERE username = ?`, [username]);

        if (emailExists) {
            res.status(400).json({ error: 'E-mail já cadastrado.' });
            return;
        }

        if (usernameExists) {
            res.status(400).json({ error: 'Nome de usuário já cadastrado.' });
            return;
        }

        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'mediador')
        `, [nome, data_nascimento, telefone, foto, email, username, senha, status]);

        const mediadorId = await db.get(`SELECT last_insert_rowid() AS id`);

        await db.run(`
            INSERT INTO mediadores (usuario_id, instituicao_id)
            VALUES (?, ?)
        `, [mediadorId.id, instituicao_id]);

        res.status(201).json({ message: 'Mediador adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Função para adicionar um novo estudante
app.post('/estudantes', async (req, res) => {
    const { nome, data_nascimento, telefone, foto, email, username, senha, status, instituicao_id, mediador_id, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude } = req.body;
    const db = await openDB();

    try {
        const emailExists = await db.get(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        const usernameExists = await db.get(`SELECT * FROM usuarios WHERE username = ?`, [username]);

        if (emailExists) {
            res.status(400).json({ error: 'E-mail já cadastrado.' });
            return;
        }

        if (usernameExists) {
            res.status(400).json({ error: 'Nome de usuário já cadastrado.' });
            return;
        }

        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'estudante')
        `, [nome, data_nascimento, telefone, foto, email, username, senha, status]);

        const estudanteId = await db.get(`SELECT last_insert_rowid() AS id`);

        await db.run(`
            INSERT INTO estudantes (usuario_id, instituicao_id, mediador_id, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [estudanteId.id, instituicao_id, mediador_id, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude]);

        res.status(201).json({ message: 'Estudante adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------------- MÉTODOS GET -------------------------------------------------
// função para retornar um usuario especifico por ID
app.get('/usuarios/:id', async (req, res) => {
    const db = await openDB();
    try {
        const usuario = await db.get(`
            SELECT *
            FROM usuarios
            WHERE id = ?
        `, [req.params.id]);
        
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ error: "Usuário não encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// função para retornar todos os usuarios
app.get('/usuarios', async (req, res) => {
    const db = await openDB();
    try {
        const usuarios = await db.all(`
            SELECT *
            FROM usuarios
        `);
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Função para retornar um estudante específico
app.get('/estudantes/:id', async (req, res) => {
    const db = await openDB();
    const estudante = await db.get(`
        SELECT u.*, e.*
        FROM usuarios u
        JOIN estudantes e ON u.id = e.usuario_id
        WHERE u.id = ? AND u.tipo_usuario = 'estudante'
    `, [req.params.id]);
    if (estudante) {
        res.json(estudante);
    } else {
        res.status(404).json({ error: "Estudante não encontrado" });
    }
});

// Função para retornar todos os estudantes
app.get('/estudantes', async (req, res) => {
    const db = await openDB();
    const estudantes = await db.all(`
        SELECT u.*, e.*
        FROM usuarios u
        JOIN estudantes e ON u.id = e.usuario_id
        WHERE u.tipo_usuario = 'estudante'
    `);
    res.json(estudantes);
});

// Função para retornar um mediador específico
app.get('/mediadores/:id', async (req, res) => {
    const db = await openDB();
    const mediador = await db.get(`
        SELECT u.*, m.*
        FROM usuarios u
        JOIN mediadores m ON u.id = m.usuario_id
        WHERE u.id = ? AND u.tipo_usuario = 'mediador'
    `, [req.params.id]);
    if (mediador) {
        res.json(mediador);
    } else {
        res.status(404).json({ error: "Mediador não encontrado" });
    }
});

// Função para retornar todos os mediadores
app.get('/mediadores', async (req, res) => {
    const db = await openDB();
    const mediadores = await db.all(`
        SELECT u.*, m.*
        FROM usuarios u
        JOIN mediadores m ON u.id = m.usuario_id
        WHERE u.tipo_usuario = 'mediador'
    `);
    res.json(mediadores);
});

// Função para retornar uma instituição específica
app.get('/instituicoes/:id', async (req, res) => {
    const db = await openDB();
    const instituicao = await db.get(`
        SELECT u.*, i.*
        FROM usuarios u
        JOIN instituicoes i ON u.id = i.usuario_id
        WHERE i.id = ? AND u.tipo_usuario = 'instituicao'
    `, [req.params.id]);
    if (instituicao) {
        res.json(instituicao);
    } else {
        res.status(404).json({ error: "Instituição não encontrada" });
    }
});

// Função para retornar todas as instituições
app.get('/instituicoes', async (req, res) => {
    const db = await openDB();
    const instituicoes = await db.all(`
        SELECT u.*, i.*
        FROM usuarios u
        JOIN instituicoes i ON u.id = i.usuario_id
        WHERE u.tipo_usuario = 'instituicao'
    `);
    res.json(instituicoes);
});

// ------------------------------------------------- MÉTODOS PUT -------------------------------------------------
// Função para atualizar atributos gerais de um usuário
app.put('/usuarios/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, telefone, foto, email, username, senha, status } = req.body;
    const db = await openDB();

    try {
        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [id]);

        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        // Verifica se o usuário que está tentando editar é o mesmo que está logado
        if (req.user.userId !== usuario.id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode editar seus próprios dados.' });
            return;
        }

        await db.run(`
            UPDATE usuarios
            SET nome = ?, data_nascimento = ?, telefone = ?, foto = ?, email = ?, username = ?, senha = ?, status = ?
            WHERE id = ?
        `, [nome, data_nascimento, telefone, foto, email, username, senha, status, id]);

        res.status(200).json({ message: 'Dados do usuário atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Função para atualizar atributos específicos de um estudante
app.put('/estudantes/:id/especifico', verifyToken, verifyStudent, async (req, res) => {
    const { id } = req.params;
    const { turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude } = req.body;
    const db = await openDB();

    try {
        const estudante = await db.get(`SELECT * FROM estudantes WHERE usuario_id = ?`, [id]);

        if (!estudante) {
            res.status(404).json({ error: 'Estudante não encontrado.' });
            return;
        }

        // Verifica se o estudante que está tentando editar é o mesmo que está logado
        if (req.user.userId !== estudante.usuario_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode editar seus próprios dados.' });
            return;
        }

        await db.run(`
            UPDATE estudantes
            SET turma = ?, temperamento = ?, condicao_especial = ?, metodos_tecnicas = ?, alergias = ?, plano_saude = ?
            WHERE usuario_id = ?
        `, [turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude, id]);

        res.status(200).json({ message: 'Dados específicos do estudante atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//-------------------------------------------------------------------------------------------------------
//Inicialização do servidor e criação das tabelas--------------------------------------------------------
app.listen(PORT, async () => {
    await createTables();
    await insertUsers();
    console.log(`Servidor rodando na porta ${PORT}`);
});
