const bcrypt = require("bcrypt");
const usuarioModel = require("../models/usuarioModel");

const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await usuarioModel.criarUsuario(nome, email, senhaHash);

    res.status(201).json({
      mensagem: "Usuário criado com sucesso",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao criar usuário",
    });
  }
};

module.exports = { criarUsuario };
