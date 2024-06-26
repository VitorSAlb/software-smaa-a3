import { openDB } from "./configDB.js"
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { sendReports } from "./enviarRelatorio.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

export default app;

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


    const count = await db.get(`SELECT COUNT(*) AS count FROM usuarios`);
    
    if (count.count === 0) {
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

        await db.run(`
            INSERT INTO usuarios (nome, data_nascimento, telefone, foto, email, username, senha, status, tipo_usuario)
            VALUES ('Mediador Exemplo', '1990-05-15', '888888888', NULL, 'mediador@example.com', 'mediador', 'senha123', TRUE, 'mediador')
        `);

        const mediadorId = await db.get(`SELECT last_insert_rowid() AS id`);

        await db.run(`
            INSERT INTO mediadores (usuario_id, instituicao_id)
            VALUES (?, ?)
        `, [mediadorId.id, instituicaoId.id]);

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

        const token = jwt.sign({ userId: usuario.id, userType: usuario.tipo_usuario }, 'chave_secreta', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export const verifyToken = (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
        const userType = req.headers['user-type'];
        if (userType === 'mediador') {
            req.user = { userId: 1, userType: 'mediador' };
        } else if (userType === 'estudante') {
            req.user = { userId: 2, userType: 'estudante' };
        } else {
            return res.status(401).json({ error: 'Tipo de usuário inválido.' });
        }
        return next();
    }

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

        const usuarioId = await db.get(`SELECT last_insert_rowid() AS id`);

        if (tipo_usuario === 'instituicao') {
            await db.run(`INSERT INTO instituicoes (usuario_id) VALUES (?)`, [usuarioId.id]);
        } else if (tipo_usuario === 'mediador') {
            await db.run(`INSERT INTO mediadores (usuario_id, instituicao_id) VALUES (?, ?)`, [usuarioId.id, 1]); 
        } else if (tipo_usuario === 'estudante') {
            await db.run(`
                INSERT INTO estudantes (usuario_id, instituicao_id, mediador_id, turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude)
                VALUES (?, ?, ?, '', '', '', '', '', '')
            `, [usuarioId.id, 1, null]); 
        }

        res.status(201).json({ message: 'Usuário adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
        `, [mediadorId.id, 1]);

        res.status(201).json({ message: 'Mediador adicionado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.post('/relatorios', verifyToken, async (req, res) => {
    if (req.user.userType !== 'mediador') {
        return res.status(403).json({ error: 'Acesso negado. Somente mediadores podem criar relatórios.' });
    }

    const { anotacoes, estudante_id, mediador_id } = req.body;
    const db = await openDB();

    try {
        const estudante = await db.get(`SELECT * FROM usuarios WHERE id = ? AND tipo_usuario = 'estudante'`, [estudante_id]);
        if (!estudante) {
            return res.status(404).json({ error: 'Estudante não encontrado ou não é do tipo estudante.' });
        }

        const mediador = await db.get(`SELECT * FROM usuarios WHERE id = ? AND tipo_usuario = 'mediador'`, [mediador_id]);
        if (!mediador) {
            return res.status(404).json({ error: 'Mediador não encontrado ou não é do tipo mediador.' });
        }

        await db.run(`
            INSERT INTO relatorios (anotacoes, estudante_id, mediador_id, data_criacao)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `, [anotacoes, estudante_id, mediador_id]);

        res.status(201).json({ message: 'Relatório criado com sucesso!' });
    } catch (error) {
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

app.get('/mediadores/:mediador_id/estudantes', verifyToken, async (req, res) => {
    const mediador_id = req.params.mediador_id;

    if (req.user.userType !== 'mediador') {
        return res.status(403).json({ error: 'Acesso negado. Somente mediadores podem acessar esta informação.' });
    }

    if (req.user.userId !== parseInt(mediador_id)) {
        return res.status(403).json({ error: 'Acesso negado. Você só pode acessar seus próprios estudantes.' });
    }

    const db = await openDB();

    try {
        const estudantes = await db.all(`
            SELECT DISTINCT u.id, u.nome, u.email
            FROM usuarios u
            JOIN relatorios r ON u.id = r.estudante_id
            WHERE r.mediador_id = ? AND u.tipo_usuario = 'estudante'
        `, [mediador_id]);

        res.status(200).json(estudantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.get('/usuarios/instituicao/:instituicaoId', verifyToken, async (req, res) => {
    const { instituicaoId } = req.params;
    const db = await openDB();

    try {
        const usuariosEstudantes = await db.all(`
            SELECT u.*, e.*
            FROM usuarios u
            JOIN estudantes e ON u.id = e.usuario_id
            WHERE e.instituicao_id = ?
        `, [instituicaoId]);

        const usuariosMediadores = await db.all(`
            SELECT u.*, m.*
            FROM usuarios u
            JOIN mediadores m ON u.id = m.usuario_id
            WHERE m.instituicao_id = ?
        `, [instituicaoId]);

        const usuarios = [...usuariosEstudantes, ...usuariosMediadores];

        if (usuarios.length === 0) {
            return res.status(404).json({ message: "Nenhum usuário encontrado para esta instituição." });
        }

        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


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
    const { id } = req.params; 
    const db = await openDB();

    try {
        const estudante = await db.get(`SELECT * FROM estudantes WHERE usuario_id = ?`, [id]);

        if (!estudante) {
            res.status(404).json({ error: "Estudante não encontrado." });
            return;
        }

        if (req.user.userType === 'estudante' && req.user.userId !== estudante.usuario_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode acessar seus próprios relatórios.' });
            return;
        } else if (req.user.userType === 'mediador' && req.user.userId !== estudante.mediador_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode acessar relatórios dos seus estudantes.' });
            return;
        }

        const relatorios = await db.all(`SELECT * FROM relatorios WHERE estudante_id = ?`, [id]);

        res.json(relatorios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ------------------------------------------------- MÉTODOS PUT -------------------------------------------------
app.put('/usuarios/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, telefone, foto, email, username, senha, status } = req.body;
    const db = await openDB();
    const userId = req.user.userId; 

    try {
        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [id]);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (parseInt(id) !== parseInt(userId)) {
            return res.status(403).json({ error: 'Acesso negado. Você só pode editar seus próprios dados.' });
        }

        await db.run(`
            UPDATE usuarios
            SET nome = ?, data_nascimento = ?, telefone = ?, foto = ?, email = ?, username = ?, senha = ?, status = ?
            WHERE id = ?
        `, [nome, data_nascimento, telefone, foto, email, username, senha, status, id]);

        return res.status(200).json({ message: 'Dados do usuário atualizados com sucesso!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.put('/estudantes/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { turma, temperamento, condicao_especial, metodos_tecnicas, alergias, plano_saude } = req.body;
    const db = await openDB();

    try {
        const estudante = await db.get(`SELECT * FROM estudantes WHERE usuario_id = ?`, [id]);
        
        if (!estudante) {
            res.status(404).json({ error: 'Estudante não encontrado.' });
            return;
        }

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

app.put('/instituicoes/:id/especifico', verifyToken, async (req, res) => {
    const { id } = req.params;
    const db = await openDB();

    try {
        const instituicao = await db.get(`SELECT * FROM instituicoes WHERE usuario_id = ?`, [id]);

        if (!instituicao) {
            res.status(404).json({ error: 'Instituição não encontrada.' });
            return;
        }

        if (req.user.userId !== instituicao.usuario_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode editar seus próprios dados.' });
            return;
        }


        res.status(200).json({ message: 'Dados específicos da instituição atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/estudantes/:estudanteId/atribuir-mediador/:mediadorId', verifyToken, async (req, res) => {
    const { estudanteId, mediadorId } = req.params;
    const db = await openDB();

    try {
        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [req.user.userId]);
        if (!usuario || usuario.tipo_usuario !== 'instituicao') {
            res.status(403).json({ error: 'Acesso negado. Somente instituições podem executar esta ação.' });
            return;
        }

        const estudante = await db.get(`SELECT * FROM estudantes WHERE usuario_id = ?`, [estudanteId]);
        if (!estudante) {
            res.status(404).json({ error: 'Estudante não encontrado.' });
            return;
        }

        const mediador = await db.get(`SELECT * FROM mediadores WHERE usuario_id = ?`, [mediadorId]);
        if (!mediador) {
            res.status(404).json({ error: 'Mediador não encontrado.' });
            return;
        }

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

app.put('/estudantes/:estudanteId/atribuir-mediador/:mediadorId', verifyToken, async (req, res) => {
    const { estudanteId, mediadorId } = req.params;
    const db = await openDB();

    try {

        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [req.user.userId]);
        if (!usuario || usuario.tipo_usuario !== 'instituicao') {
            return res.status(403).json({ error: 'Acesso negado. Somente instituições podem executar esta ação.' });
        }

        const estudante = await db.get(`SELECT * FROM estudantes WHERE usuario_id = ?`, [estudanteId]);
        const mediador = await db.get(`SELECT * FROM mediadores WHERE usuario_id = ?`, [mediadorId]);

        if (!estudante) {
            return res.status(404).json({ error: 'Estudante não encontrado.' });
        }

        if (!mediador) {
            return res.status(404).json({ error: 'Mediador não encontrado.' });
        }

        await db.run(`UPDATE estudantes SET mediador_id = ? WHERE usuario_id = ?`, [mediadorId, estudanteId]);

        res.status(200).json({ message: 'Estudante alocado ao mediador com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------------- MÉTODOS DELETE -------------------------------------------------
app.delete('/usuarios/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const db = await openDB();

    try {
        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [id]);

        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        if (req.user.userId !== usuario.id && req.user.userType !== 'instituicao') {
            res.status(403).json({ error: 'Acesso negado. Você só pode deletar seus próprios dados ou ser uma instituição.' });
            return;
        }

        if (usuario.tipo_usuario === 'estudante') {
            await db.run(`DELETE FROM estudantes WHERE usuario_id = ?`, [id]);
        } else if (usuario.tipo_usuario === 'mediador') {
            await db.run(`DELETE FROM mediadores WHERE usuario_id = ?`, [id]);
        } else if (usuario.tipo_usuario === 'instituicao') {
            await db.run(`DELETE FROM instituicoes WHERE usuario_id = ?`, [id]);
        }

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

        if (req.user.userId !== relatorio.mediador_id && req.user.userId !== relatorio.estudante_id) {
            res.status(403).json({ error: 'Acesso negado. Você só pode deletar seus próprios relatórios.' });
            return;
        }


        await db.run(`DELETE FROM relatorios WHERE id = ?`, [id]);

        res.status(200).json({ message: 'Relatório deletado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/usuarios/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const db = await openDB();

    try {
        const usuario = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [req.user.userId]);
        if (!usuario || usuario.tipo_usuario !== 'instituicao') {
            return res.status(403).json({ error: 'Acesso negado. Somente instituições podem executar esta ação.' });
        }

        const usuarioToDelete = await db.get(`SELECT * FROM usuarios WHERE id = ?`, [id]);
        if (!usuarioToDelete) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (usuarioToDelete.tipo_usuario === 'estudante') {
            await db.run(`DELETE FROM estudantes WHERE usuario_id = ?`, [id]);
        } else if (usuarioToDelete.tipo_usuario === 'mediador') {
            await db.run(`DELETE FROM mediadores WHERE usuario_id = ?`, [id]);
        } else if (usuarioToDelete.tipo_usuario === 'instituicao') {
            await db.run(`DELETE FROM instituicoes WHERE usuario_id = ?`, [id]);
        }

        await db.run(`DELETE FROM usuarios WHERE id = ?`, [id]);

        res.status(200).json({ message: 'Usuário deletado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//-------------------------------------------------------------------------------------------------------
//Inicialização do servidor e criação das tabelas--------------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        await createTables();
        await insertUsers();
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}
