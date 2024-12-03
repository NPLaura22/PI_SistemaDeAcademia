const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./app');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MIDDLEWARE PARA SERVIR ARQUIVOS ESTÁTICOS (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'src_frontend')));

// ENDPOINT PARA CADASTRO
app.post('/api/cadastro', (req, res) => {
    const { name, email, dob, cpf } = req.body;
    console.log('Dados recebidos:', { name, email, dob, cpf }); // LOG DOS DADOS RECEBIDOS

    const query = 'INSERT INTO USUARIOS (NOME, EMAIL, DATANASCIMENTO, CPF) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, email, dob, cpf], (error, results) => {
        if (error) {
            console.error('Erro ao inserir no banco de dados:', error); // LOG DO ERRO
            return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        }
        res.status(200).json({ message: 'Cadastro realizado com sucesso!' });
    });
});

// ENPOINT PARA PEGAR HORARIO
app.post('/api/catraca', (req, res) => {
    const { usuarioId, horarioEntrada, horarioSaida, statusAcesso } = req.body;

    const queryCheck = `
        SELECT ID, HORARIO_ENTRADA 
        FROM CATRACA 
        WHERE USUARIO_ID = ? AND HORARIO_ENTRADA IS NOT NULL AND HORARIO_SAIDA IS NULL
    `;

    connection.query(queryCheck, [usuarioId], (error, results) => {
        if (error) {
            console.error('Erro ao verificar registros existentes:', error);
            return res.status(500).json({ message: 'Erro ao verificar registros existentes.' });
        }

        if (results.length > 0) {
            const registroId = results[0].ID;
            const horarioEntrada = results[0].HORARIO_ENTRADA;

            // CÁLCULO DO TOTAL_HORAS EM FORMATO HH:mm:ss
            const queryUpdate = `
                UPDATE CATRACA 
                SET HORARIO_SAIDA = ?, 
                    TOTAL_HORAS = SEC_TO_TIME(TIMESTAMPDIFF(SECOND, ? , ?)), 
                    STATUS_ACESSO = ? 
                WHERE ID = ?
            `;

            connection.query(queryUpdate, [horarioSaida, horarioEntrada, horarioSaida, statusAcesso || "Finalizado", registroId], (error, updateResults) => {
                if (error) {
                    console.error('Erro ao atualizar o horário de saída:', error);
                    return res.status(500).json({ message: 'Erro ao registrar horário de saída.' });
                }

                res.status(200).json({ message: 'Horário de saída registrado com sucesso!', id: registroId });
            });
        } else {
            const queryInsert = `
                INSERT INTO CATRACA (USUARIO_ID, HORARIO_ENTRADA, HORARIO_SAIDA, TOTAL_HORAS, STATUS_ACESSO) 
                VALUES (?, ?, ?, ?, ?)
            `;

            connection.query(queryInsert, [usuarioId, horarioEntrada, null, null, statusAcesso || "Aguardando"], (error, insertResults) => {
                if (error) {
                    console.error('Erro ao inserir novo registro:', error);
                    return res.status(500).json({ message: 'Erro ao registrar entrada na catraca.' });
                }

                res.status(200).json({ message: 'Horário de entrada registrado com sucesso!', id: insertResults.insertId });
            });
        }
    });
});

//GET CATRACA
app.get('/api/catraca', (req, res) => {
    const { usuarioId, statusAcesso } = req.query; // Parâmetros opcionais via query

    let query = `
        SELECT ID, USUARIO_ID, HORARIO_ENTRADA, HORARIO_SAIDA, TOTAL_HORAS, STATUS_ACESSO
        FROM CATRACA
        WHERE 1=1
    `;
    const params = [];

    // Adiciona condições dinamicamente
    if (usuarioId) {
        query += ' AND USUARIO_ID = ?';
        params.push(usuarioId);
    }

    if (statusAcesso) {
        query += ' AND STATUS_ACESSO = ?';
        params.push(statusAcesso);
    }

    connection.query(query, params, (error, results) => {
        if (error) {
            console.error('Erro ao buscar registros:', error);
            return res.status(500).json({ message: 'Erro ao buscar registros.' });
        }

        res.status(200).json({ registros: results });
    });
});


// ROTA PARA PEGAR TODOS OS USUÁRIOS
app.get('/api/usuarios', (req, res) => {
    const query = 'SELECT * FROM USUARIOS';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao buscar usuários no banco de dados:', error); // LOG DO ERRO
            return res.status(500).json({ message: 'Erro ao buscar usuários.' });
        }
        res.status(200).json(results); // RETORNA TODOS OS USUÁRIOS COMO JSON
    });
});


// ROTA PARA CARREGAR LOGIN
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src_frontend', 'login.html'));
});


// INICIALIZA SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Servidor Aluno-Gerente`);
    console.log(`Acesse a aplicação em http://localhost:${PORT}`);
});

// ENDPOINT PARA PEGAR NOME ( ID ESPECÍFICO)
app.get('/api/usuarios/:id', (req, res) => {
    const userId = req.params.id; // Obtém o ID do usuário da URL
    const query = 'SELECT * FROM USUARIOS WHERE ID = ?';

    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Erro ao buscar o usuário no banco de dados:', error); // LOG DO ERRO
            return res.status(500).json({ message: 'Erro ao buscar o usuário.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' }); // Retorna erro se não encontrado
        }

        res.status(200).json(results[0]); // Retorna o usuário encontrado
    });
});

// ENDPOINT PARA PEGAR TOTAL HORAS SEMANAIS (ID ESPECÍFICO)
app.get('/api/usuarios/:id/hsemanais', (req, res) => {
    const userId = req.params.id; // Obtém o ID do usuário da URL

    // Query para somar o total de horas semanais (formato TIME)
    const query = `
        SELECT 
            SEC_TO_TIME(SUM(TIME_TO_SEC(TOTAL_HORAS))) AS totalHorasSemana
        FROM 
            CATRACA
        WHERE 
            USUARIO_ID = ? 
            AND WEEK(HORARIO_ENTRADA) = WEEK(CURDATE()) 
            AND YEAR(HORARIO_ENTRADA) = YEAR(CURDATE())
    `;

    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Erro ao buscar o total de horas semanais no banco de dados:', error); // LOG DO ERRO
            return res.status(500).json({ message: 'Erro ao buscar o total de horas semanais.' });
        }

        // Se não houver registros para essa semana, retorna um total de 00:00:00
        if (results[0].totalHorasSemana === null) {
            return res.status(200).json({
                userId,
                totalHorasSemanais: '00:00:00' // Caso não haja horas registradas
            });
        }

        res.status(200).json({
            userId,
            totalHorasSemanais: results[0].totalHorasSemana // Retorna as horas somadas no formato HH:MM:SS
        });
    });
});

// ENDPOINT PARA RELATÓRIO (GERENTE)
app.get('/api/relatorio/gerente', (req, res) => {
    const query = `
        SELECT 
            U.ID AS usuario_id,
            U.NOME AS nome_usuario,
            SEC_TO_TIME(SUM(TIME_TO_SEC(CASE 
                WHEN C.HORARIO_ENTRADA >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                  AND C.HORARIO_ENTRADA < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
                THEN C.TOTAL_HORAS
                ELSE '00:00:00'
            END))) AS total_horas_semanal,
            SEC_TO_TIME(SUM(TIME_TO_SEC(C.TOTAL_HORAS))) AS total_horas_geral,
            CASE
                WHEN SUM(TIME_TO_SEC(CASE 
                    WHEN C.HORARIO_ENTRADA >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                      AND C.HORARIO_ENTRADA < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
                    THEN C.TOTAL_HORAS ELSE '00:00:00'
                END)) <= 5 * 3600 THEN 'Iniciante'
                WHEN SUM(TIME_TO_SEC(CASE 
                    WHEN C.HORARIO_ENTRADA >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                      AND C.HORARIO_ENTRADA < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
                    THEN C.TOTAL_HORAS ELSE '00:00:00'
                END)) BETWEEN 6 * 3600 AND 10 * 3600 THEN 'Intermediário'
                WHEN SUM(TIME_TO_SEC(CASE 
                    WHEN C.HORARIO_ENTRADA >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                      AND C.HORARIO_ENTRADA < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
                    THEN C.TOTAL_HORAS ELSE '00:00:00'
                END)) BETWEEN 11 * 3600 AND 20 * 3600 THEN 'Avançado'
                WHEN SUM(TIME_TO_SEC(CASE 
                    WHEN C.HORARIO_ENTRADA >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                      AND C.HORARIO_ENTRADA < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
                    THEN C.TOTAL_HORAS ELSE '00:00:00'
                END)) > 20 * 3600 THEN 'Extremamente Avançado'
                ELSE 'Não classificado'
            END AS classificacao
        FROM 
            USUARIOS U
        LEFT JOIN 
            CATRACA C ON U.ID = C.USUARIO_ID
        WHERE
            U.ID NOT IN (1, 2, 3) -- Exclui usuários específicos
        GROUP BY 
            U.ID, U.NOME
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Erro ao buscar dados para o relatório:', error);
            return res.status(500).json({ message: 'Erro ao gerar o relatório.' });
        }

        res.status(200).json(results); // Retorna os resultados
    });
});