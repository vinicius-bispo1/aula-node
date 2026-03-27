const express = require("express");
const pool = require("./config/db");

const app = express();
app.use(express.json());

// colocar no horario local
function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Bahia",
  });
}

app.get("/", (req, res) => {
  res.send("<h1>Rede Social!</h1>");
});

// GET - usuarios
// app.get("/usuarios", async (req, res) => {
//   try {
//     const resultado = await pool.query(`
//       SELECT
//         *
//       FROM usuarios;
//     `);
//     res.json(resultado.rows);
//   } catch (erro) {
//     res.status(500).json({ erro: "Erro ao buscar postagens" });
//   }
// });

// GET POSTS
app.get("/posts", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        usuarios.id,
        usuarios.nome,
        post.conteudo,
        post.criado_em
      FROM post
      JOIN usuarios 
        ON post.usuario_id = usuarios.id
      ORDER BY post.criado_em DESC
    `);

    const dados = resultado.rows.map((post) => ({
      ...post,
      criado_em: formatarData(post.criado_em),
    }));

    res.json(dados);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar postagens" });
  }
});

// CREATE POST
app.post("/post", async (req, res) => {
  try {
    const { titulo, conteudo, usuario_id } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO post (titulo, conteudo, usuario_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [titulo, conteudo, usuario_id],
    );

    const post = {
      ...resultado.rows[0],
      criado_em: formatarData(resultado.rows[0].criado_em),
    };

    res.status(201).json({
      mensagem: "Post criado com sucesso",
      post,
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao criar postagem",
    });
  }
});

// UPDATE POST
app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, conteudo } = req.body;

  const resultado = await pool.query(
    "UPDATE post SET titulo=$1, conteudo=$2 WHERE id=$3 RETURNING *",
    [titulo, conteudo, id],
  );

  res.json(resultado.rows[0]);
});

// DELETE POST
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM post WHERE id=$1", [id]);

  res.json({ message: "Post deletado" });
});

module.exports = app;
