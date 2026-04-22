const express = require("express");
const router = express.Router();
const validarUsuarios = require("../middlewares/validacao/usuarios");
const controller = require("../controllers/usuarioController");

router.post("/usuarios", validarUsuarios, controller.criarUsuario);

module.exports = router;
