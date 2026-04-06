const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Sem token" });
  }
  //   if (!token || !token.startsWith("Bearer ")) {
  //   return res.status(401).json({ message: "Token mal formatado" });
  // }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

    req.usuario = decoded;
    console.log(req.usuario);
    next();
  } catch (erro) {
    console.log("ERRO JWT:", erro.message); // 👈 adiciona isso
    return res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = auth;
