const pool = require("../config/db");

const criarUsuario = async (nome, email, senhaHash) => {
  return await pool.query(
    `
          INSERT INTO usuarios (nome, email, senha)
          VALUES ($1, $2, $3)
        `,
    [nome, email, senhaHash],
  );
};

const buscarPorEmail = async (email) => {
  return await pool.query(
    `
          SELECT * FROM usuarios WHERE email=$1`,
    [email],
  );
};

module.exports = { buscarPorEmail, criarUsuario };
