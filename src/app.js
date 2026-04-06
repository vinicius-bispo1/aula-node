require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const validarPost = require("./validacao/post");

const auth = require("./auth/authLogin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10); // incluido

    const resultado = await pool.query(
      `
      INSERT INTO usuarios (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [nome, email, senhaHash], //alteração aqui
    );
    res.status(201).json({
      mensagem: "Usuário criado com sucesso",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao criar usuário",
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await pool.query("SELECT * FROM usuarios WHERE email=$1", [
    email,
  ]);

  if (usuario.rows.length === 0) {
    return res.status(400).json({ message: "Usuário não encontrado" });
  }

  //alteração aqui
  const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);

  if (!senhaValida) {
    return res.status(400).json({
      mensagem: "Senha inválida",
    });
  }

  const token = jwt.sign({ id: usuario.rows[0].id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // remover antes de subir
  console.log("LOGIN SECRET:", process.env.JWT_SECRET);
  res.json({ token });
});

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
app.post("/post", auth, validarPost, async (req, res) => {
  try {
    const { titulo, conteudo } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO post (titulo, conteudo, usuario_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [titulo, conteudo, req.usuario.id],
    );
    console.log(resultado);
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
app.put("/posts/:id", auth, validarPost, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo } = req.body;

    // 🔍 Busca o post
    const post = await pool.query("SELECT * FROM post WHERE id=$1", [id]);

    // ❌ Post não existe
    if (post.rows.length === 0) {
      return res.status(404).json({ mensagem: "Post não encontrado" });
    }

    // ❌ Usuário não é dono
    if (post.rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensagem: "Sem permissão" });
    }

    // ✅ Atualiza
    const resultado = await pool.query(
      `UPDATE post SET titulo=$1, conteudo=$2 WHERE id=$3 RETURNING *`,
      [titulo, conteudo, id],
    );

    res.status(200).json({
      mensagem: "Post atualizado com sucesso",
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao atualizar post",
    });
  }
});

// Rota delete:

app.delete("/posts/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await pool.query("SELECT * FROM post WHERE id=$1", [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ mensagem: "Post não encontrado" });
    }

    if (post.rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensagem: "Sem permissão" });
    }

    const resultado = await pool.query(
      `DELETE FROM post WHERE id=$1 RETURNING *`,
      [id],
    );

    res.json({
      mensagem: "Post deletado com sucesso",
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao deletar post",
    });
  }
});

module.exports = app;
