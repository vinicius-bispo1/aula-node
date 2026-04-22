const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Sem token" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    req.usuario = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = auth;
