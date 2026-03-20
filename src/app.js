const express = require("express");
const pool = require("./config/db");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Rede Social!</h1>");
});

// GET POSTS
app.get("/posts", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        usuarios.nome,
        posts.conteudo,
        posts.criado_em
      FROM posts
      JOIN usuarios 
      ON posts.usuario_id = usuarios.id
      ORDER BY posts.criado_em DESC
    `);
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar postagens" });
  }
});

module.exports = app;
