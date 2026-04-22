const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const usuarioModel = require("../models/usuarioModel");

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await usuarioModel.buscarPorEmail(email);

    if (usuario.rows.length === 0) {
      return res.status(400).json({ mensagem: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: "Credenciais inválidas" });
    }

    const token = jwt.sign({ id: usuario.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro interno do serbidor",
    });
  }
};

module.exports = { login };
