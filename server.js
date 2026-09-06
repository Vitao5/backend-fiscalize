const express = require("express");
const cors = require("cors");
const {limiter, speedLimiter } = require("./middleware/middleware");
const userRoutes = require('./routes/user.routes')
const bankRouters = require('./routes/bank.routes')
const typePayments = require('./routes/typePayments.routes')
const extraPurchase = require('./routes/extraPurchase.routes')
const installmentPurchase = require('./routes/installmentPurchase.routes')
const fixedPurchase = require('./routes/fixedPurchase.routes')
const pluggyRoutes = require('./routes/pluggy.routes')

require("dotenv").config();

const db = require("./db/models");

const app = express();
app.use(express.json())

const helmet = require('helmet');
app.use(helmet());

const PORT = process.env.PORT || 3002;

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true
}));

app.use(limiter);
app.use(speedLimiter)

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/api/users", userRoutes);
app.use('/api/banks', bankRouters)
app.use('/api/type-payments', typePayments)
app.use('/api/extra-purchase', extraPurchase)
app.use('/api/installment-purchase', installmentPurchase)
app.use('/api/fixed-purchase', fixedPurchase)
app.use('/api/pluggy', pluggyRoutes)


db.sequelize.authenticate()
.then(() => {
  console.log("Conexão com o banco de dados estabelecida!");
}).catch(err => {
  console.error("Erro ao conectar ao banco de dados:", err);
});


db.sequelize.sync({ force: false })
.then(() => {
  console.log("Banco de dados sincronizado!");
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error("Erro ao sincronizar o banco de dados:", err);
});
