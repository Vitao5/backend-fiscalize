const jwt = require('jsonwebtoken');
const process = require('process');
require("dotenv").config()
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    if (!res.headersSent) {
      return res.status(401).json({ message: 'Acesso não autorizado.' });
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (!res.headersSent) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
  }
};

// Middleware para verificar se os cabeçalhos já foram enviados
const checkHeadersSent = (req, res, next) => {
  if (res.headersSent) {
    return;
  }
  next();
};

const isDev = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  message: 'Muitas requisições do mesmo IP, por favor tente novamente mais tarde.'
});

//aqui coloquei um dealy em cada requisição
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: isDev ? 500 : 100,
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  }
});

//rate limit para envio do código de troca de senha
const sendCodeLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: isDev ? 50 : 3,
  message: { message: 'Muitas tentativas de envio de código. Aguarde 3 minutos antes de tentar novamente.' }
});

module.exports = { authMiddleware, checkHeadersSent, limiter, speedLimiter, sendCodeLimiter };
