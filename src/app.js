const express = require("express");
const bodyParser = require("body-parser");
//const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const Database = require('better-sqlite3');
const app = express();
const db = new Database('./database/users.db');
const fs = require('fs');
const pathbanco = './database';

// Configurar o middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Verifica se o diretório existe, e se não, cria
if (!fs.existsSync(pathbanco)) {
    fs.mkdirSync(pathbanco);
  }

// Criar tabela no banco de dados (se não existir)

db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password_filled TEXT NOT NULL
)`).run();

// Rota para processar o formulário
app.post("/submit", (req, res) => {
    const { username, password } = req.body;

    // Verifica se o campo de senha foi preenchido
    const passwordFilled = password ? "Sim" : "Não";

    // Inserir dados no banco de dados
    db.run(`INSERT INTO users (username, password_filled) VALUES (?, ?)`, [username, passwordFilled], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Erro ao salvar os dados.");
        } else {
            res.redirect("/conscientizacao.html");
        }
    });
});

// Rota para exportar os dados do banco de dados para CSV
app.get("/export", (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Erro ao exportar os dados.");
        } else {
            let csv = "id,username,password_filled\n";
            rows.forEach(row => {
                csv += `${row.id},${row.username},${row.password_filled}\n`;
            });
            res.header("Content-Type", "text/csv");
            res.attachment("usuarios.csv");
            res.send(csv);
        }
    });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
