const Joi = require("joi");

const postSchema = Joi.object({
  titulo: Joi.string().min(3).required().messages({
    "string.empty": "O título é obrigatório",
    "string.min": "O título deve ter pelo menos 3 caracteres",
    "any.required": "O título é obrigatório",
  }),
  conteudo: Joi.string().min(5).required().messages({
    "string.empty": "O conteúdo é obrigatório",
    "string.min": "O conteúdo deve ter pelo menos 5 caracteres",
    "any.required": "O conteúdo é obrigatório",
  }),
  // RETIRAR
  // usuario_id: Joi.number().integer().required().messages({
  //   "number.base": "O usuário_id deve ser um número",
  //   "number.integer": "O usuário_id deve ser um número inteiro",
  //   "any.required": "O usuário_id é obrigatório",
  // }),
});

function validarPost(req, res, next) {
  const { error } = postSchema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log(error);
    return res.status(400).json({
      erro: error.details.map((e) => e.message),
    });
  }

  next();
}

module.exports = validarPost;
