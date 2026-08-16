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


const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors());

app.use(limiter);
app.use(speedLimiter)

app.use("/api/users", userRoutes);
app.use('/api/banks', bankRouters)
app.use('/api/type-payments', typePayments)
app.use('/api/extra-purchase', extraPurchase)
app.use('/api/installment-purchase', installmentPurchase)
app.use('/api/fixed-purchase', fixedPurchase)
app.use('/api/pluggy', pluggyRoutes)


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });


db.sequelize.authenticate()
.then(() => {
  console.log('/////////////////////////////////////////')
  console.log("Conexão com o banco de dados estabelecida!");
}).catch(err => {
  console.log('/////////////////////////////////////////')
  console.error("Erro ao conectar ao banco de dados:", err);
  console.log('/////////////////////////////////////////')
});


db.sequelize.sync({ force: false })
.then(()=>{
  console.log('/////////////////////////////////////////')
  console.log("Banco de dados sincronizado!");
  console.log('/////////////////////////////////////////')
}).catch(err => {
  console.log('/////////////////////////////////////////')
  console.error("Erro ao sincronizar o banco de dados:", err);
  console.log('/////////////////////////////////////////')
});
