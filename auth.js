const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { USER_VERIFICATION_TOKEN_SECRET } = require("./env");

async function gethash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (token == null)
    return res
      .status(401)
      .send({ message: "No token found please login first" });
  const user = validateToken(token);
  if (user) next();
  else res.status(401).send({ message: "Token expired" });
}

function validateToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, USER_VERIFICATION_TOKEN_SECRET);
  } catch (err) {
    console.log(err);
  }
}

function generateToken(email) {
  return jwt.sign({ email }, USER_VERIFICATION_TOKEN_SECRET, {
    expiresIn: "1h",
  });
}

module.exports = {
  generateToken,
  authenticateToken,
  gethash,
  comparePassword,
  validateToken,
};
