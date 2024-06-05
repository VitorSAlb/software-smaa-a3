import { openDB } from "./configDB.js"
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { sendReports } from "./enviarRelatorio.js";

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

        CREATE TABLE IF NOT EXISTS relatorios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anotacoes TEXT NOT NULL,
            estudante_id INT NOT NULL,
            mediador_id INT NOT NULL,
            data_criacao DATETIME DEFAULT (datetime('now')),
            FOREIGN KEY (estudante_id) REFERENCES estudantes(usuario_id),
            FOREIGN KEY (mediador_id) REFERENCES mediadores(usuario_id)
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

// Middleware para verificar o token e definir o usuário no request
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, 'chave_secreta', (err, decodedToken) => {
        if (err) return res.status(401).json({ error: 'Token inválido.' });
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

const verifyMediator = (req, res, next) => {
    if (req.user.userType !== 'mediador') {
        return res.status(403).json({ error: 'Acesso negado. Somente mediadores podem executar esta ação.' });
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

        // Inserir na tabela de usuários
        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario]);

        const usuarioId = await db.get(`SELECT last_insert_rowid() AS id`);

        // Inserir nas tabelas específicas com dados vazios
        if (tipo_usuario === 'instituicao') {
            await db.run(`INSERT INTO instituicoes (usuario_id) VALUES (?)`, [usuarioId.id]);
        } else if (tipo_usuario === 'mediador') {
            await db.run(`INSERT INTO mediadores (usuario_id, instituicao_id) VALUES (?, ?)`, [usuarioId.id, null]); // Adicione null ou um valor padrão para instituicao_id
        } else if (tipo_usuario === 'estudante') {
            await db.run(`
                INSERT INTO estudantes (usuario_id, instituicao_id, mediador_id, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude)
                VALUES (?, ?, ?, '', '', '', '', '', '')
            `, [usuarioId.id, null, null]); // Adicione null ou valores padrão para instituicao_id e mediador_id
        }

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

app.post('/relatorios', async (req, res) => {
    const { anotacoes, estudante_id, mediador_id } = req.body;
    const db = await openDB();

    console.log('Received data:', { anotacoes, estudante_id, mediador_id });

    try {
        const estudante = await db.get(`SELECT * FROM usuarios WHERE id = ? AND tipo_usuario = 'estudante'`, [estudante_id]);
        if (!estudante) {
            return res.status(404).json({ error: 'Estudante não encontrado ou não é do tipo estudante.' });
        }

        const mediador = await db.get(`SELECT * FROM usuarios WHERE id = ? AND tipo_usuario = 'mediador'`, [mediador_id]);
        if (!mediador) {
            return res.status(404).json({ error: 'Mediador não encontrado ou não é do tipo mediador.' });
        }

        const existingReport = await db.get(`SELECT * FROM relatorios WHERE estudante_id = ?`, [estudante_id]);
        if (existingReport) {
            return res.status(400).json({ error: 'O estudante já possui um relatório.' });
        }

        await db.run(`
            INSERT INTO relatorios (anotacoes, estudante_id, mediador_id, data_criacao)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `, [anotacoes, estudante_id, mediador_id]);

        res.status(201).json({ message: 'Relatório criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar relatório:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ------------------------------------------------- MÉTODOS GET -------------------------------------------------

app.get('/me', verifyToken, async (req, res) => {
    const db = await openDB();
    try {
        const usuario = await db.get(`
            SELECT *
            FROM usuarios
            WHERE id = ?
        `, [req.user.userId]);

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        let estudanteInfo = null;

        if (usuario.tipo_usuario === 'estudante') {
            estudanteInfo = await db.get(`
                SELECT turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude
                FROM estudantes
                WHERE usuario_id = ?
            `, [req.user.userId]);
        }

        res.json({ ...usuario, estudanteInfo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



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


app.get('/estudantes/mediador/:mediadorId', verifyToken, async (req, res) => {
    const { mediadorId } = req.params;
    const db = await openDB();

    try {
        const estudantes = await db.all(`
            SELECT u.*, e.*
            FROM usuarios u
            JOIN estudantes e ON u.id = e.usuario_id
            WHERE e.mediador_id = ?
        `, [mediadorId]);

        if (estudantes.length === 0) {
            return res.status(404).json({ message: "Nenhum estudante encontrado para este mediador." });
        }

        res.json(estudantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

app.get('/relatorios/:id', async (req, res) => {
    const { id } = req.params;
    const db = await openDB();

    try {
        // Obter o relatório
        const relatorio = await db.get(`
            SELECT *
            FROM relatorios
            WHERE id = ?
        `, [id]);

        if (!relatorio) {
            res.status(404).json({ error: 'Relatório não encontrado.' });
            return;
        }

        res.status(200).json(relatorio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/relatorios', async (req, res) => {
    const db = await openDB();

    try {
        const relatorios = await db.all(`
            SELECT r.*, u.nome AS estudante_nome, m.nome AS mediador_nome
            FROM relatorios r
            JOIN usuarios u ON r.estudante_id = u.id
            JOIN usuarios m ON r.mediador_id = m.id
        `);

        res.status(200).json(relatorios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/relatorios/estudante/:id', verifyToken, async (req, res) => {
    const { id } = req.params; // ID do estudante
    const db = await openDB();

    try {
        // Obtenha os dados do estudante
        const estudante = await db.get(`SELECT * FROM estudantes WHERE usuario_id = ?`, [id]);

        // Verifique se o estudante existe
        if (!estudante) {
            res.status(404).json({ error: "Estudante não encontrado." });
            return;
        }

        // Verifique se o usuário logado é o estudante ou o mediador associado
        if (req.user.userType === 'estudante' && req.user.userId !== estudante.usuario_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode acessar seus próprios relatórios.' });
            return;
        } else if (req.user.userType === 'mediador' && req.user.userId !== estudante.mediador_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode acessar relatórios dos seus estudantes.' });
            return;
        }

        // Obtenha os relatórios do estudante
        const relatorios = await db.all(`SELECT * FROM relatorios WHERE estudante_id = ?`, [id]);

        res.json(relatorios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
app.put('/estudantes/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, telefone, foto, email, username, senha, status, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude } = req.body;
    const db = await openDB();

    try {
        const estudante = await db.get(`SELECT * FROM usuarios WHERE id = ? AND tipo_usuario = 'estudante'`, [id]);

        if (!estudante) {
            res.status(404).json({ error: 'Estudante não encontrado.' });
            return;
        }

        // Atualizar dados na tabela `usuarios`
        await db.run(`
            UPDATE usuarios
            SET nome = ?, data_nascimento = ?, telefone = ?, foto = ?, email = ?, username = ?, senha = ?, status = ?
            WHERE id = ?
        `, [nome, data_nascimento, telefone, foto, email, username, senha, status, id]);

        // Atualizar dados na tabela `estudantes`
        await db.run(`
            UPDATE estudantes
            SET turma = ?, temperamento = ?, condicao_especial = ?, metodos_tecnicas = ?, alergias = ?, plano_saude = ?
            WHERE usuario_id = ?
        `, [turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude, id]);

        res.status(200).json({ message: 'Dados do estudante atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/mediadores/:id/especifico', verifyToken, verifyMediator, async (req, res) => {
    const { id } = req.params;
    const { instituicao_id } = req.body;
    const db = await openDB();

    try {
        const mediador = await db.get(`SELECT * FROM mediadores WHERE usuario_id = ?`, [id]);

        if (!mediador) {
            res.status(404).json({ error: 'Mediador não encontrado.' });
            return;
        }

        // Verifica se o mediador que está tentando editar é o mesmo que está logado
        if (req.user.userId !== mediador.usuario_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode editar seus próprios dados.' });
            return;
        }

        await db.run(`
            UPDATE mediadores
            SET instituicao_id = ?
            WHERE usuario_id = ?
        `, [instituicao_id, id]);

        res.status(200).json({ message: 'Dados específicos do mediador atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Função para atualizar atributos específicos de uma instituição
app.put('/instituicoes/:id/especifico', verifyToken, async (req, res) => {
    const { id } = req.params;
    const db = await openDB();

    try {
        const instituicao = await db.get(`SELECT * FROM instituicoes WHERE usuario_id = ?`, [id]);

        if (!instituicao) {
            res.status(404).json({ error: 'Instituição não encontrada.' });
            return;
        }

        // Verifica se a instituição que está tentando editar é a mesma que está logada
        if (req.user.userId !== instituicao.usuario_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode editar seus próprios dados.' });
            return;
        }

        // Não há dados específicos da instituição para atualizar neste exemplo, mas você pode adicionar campos conforme necessário

        res.status(200).json({ message: 'Dados específicos da instituição atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/estudantes/:estudanteId/atribuir-mediador/:mediadorId', verifyToken, async (req, res) => {
    const { estudanteId, mediadorId } = req.params;
    const db = await openDB();

    try {
        // Verificar se o usuário é do tipo instituição
        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [req.user.userId]);
        if (!usuario || usuario.tipo_usuario !== 'instituicao') {
            res.status(403).json({ error: 'Acesso negado. Somente instituições podem executar esta ação.' });
            return;
        }

        // Verificar se o estudante existe
        const estudante = await db.get(`SELECT * FROM estudantes WHERE usuario_id = ?`, [estudanteId]);
        if (!estudante) {
            res.status(404).json({ error: 'Estudante não encontrado.' });
            return;
        }

        // Verificar se o mediador existe
        const mediador = await db.get(`SELECT * FROM mediadores WHERE usuario_id = ?`, [mediadorId]);
        if (!mediador) {
            res.status(404).json({ error: 'Mediador não encontrado.' });
            return;
        }

        // Atribuir mediador ao estudante
        await db.run(`
            UPDATE estudantes
            SET mediador_id = ?
            WHERE usuario_id = ?
        `, [mediadorId, estudanteId]);

        res.status(200).json({ message: 'Mediador atribuído ao estudante com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------------- MÉTODOS DELETE -------------------------------------------------
// Funçãoo para deletar um usuario especifico por ID
app.delete('/usuarios/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const db = await openDB();

    try {
        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [id]);

        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        // Verifica se o usuário que está tentando deletar é o mesmo que está logado ou se é uma instituição
        if (req.user.userId !== usuario.id && req.user.userType !== 'instituicao') {
            res.status(403).json({ error: 'Acesso negado. Você só pode deletar seus próprios dados ou ser uma instituição.' });
            return;
        }

        // Deletar dados específicos de cada tipo de usuário
        if (usuario.tipo_usuario === 'estudante') {
            await db.run(`DELETE FROM estudantes WHERE usuario_id = ?`, [id]);
        } else if (usuario.tipo_usuario === 'mediador') {
            await db.run(`DELETE FROM mediadores WHERE usuario_id = ?`, [id]);
        } else if (usuario.tipo_usuario === 'instituicao') {
            await db.run(`DELETE FROM instituicoes WHERE usuario_id = ?`, [id]);
        }

        // Deletar o usuário da tabela 'usuarios'
        await db.run(`DELETE FROM usuarios WHERE id = ?`, [id]);

        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/relatorios/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const db = await openDB();

    try {
        const relatorio = await db.get(`SELECT * FROM relatorios WHERE id = ?`, [id]);

        if (!relatorio) {
            res.status(404).json({ error: 'Relatório não encontrado.' });
            return;
        }

        // Verifica se o usuário que está tentando deletar é o mediador ou estudante do relatório
        if (req.user.userId !== relatorio.mediador_id && req.user.userId !== relatorio.estudante_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode deletar seus próprios relatórios.' });
            return;
        }

        // Deletar o relatório da tabela 'relatorios'
        await db.run(`DELETE FROM relatorios WHERE id = ?`, [id]);

        res.status(200).json({ message: 'Relatório deletado com sucesso!' });
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
