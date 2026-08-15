require("dotenv").config();
const { Sequelize } = require('sequelize');
const User = require('../models/usersModel');
const Bank = require('../models/bankModel');
const TypePayments = require('../models/typePaymentsModel');
const ExtraPurchasesUser = require('../models/extraPurchasesModel')
const FixedPurchase = require('../models/fixedPurchasesModel');
const InstallmentPurchase = require('../models/installmentPurchaseModel');
const PurchasesInstallment = require('../models/purchasesInstallmentModel');
const isPostgres = (process.env.DB_DIALECT || 'postgres') === 'postgres';

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: isPostgres
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
      logging: false,
    })
  : new Sequelize(
      process.env.PGDATABASE || process.env.MYSQLDATABASE,
      process.env.PGUSER || process.env.MYSQLUSER,
      process.env.PGPASSWORD || process.env.MYSQLPASSWORD,
      {
        host: process.env.PGHOST || process.env.MYSQLHOST,
        port: process.env.PGPORT || process.env.MYSQLPORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        dialectOptions: isPostgres
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            }
          : {},
        logging: false,
      }
    );


// Inicializa o modelo User com a instância do Sequelize
const UserModel = User(sequelize);
const BankModel = Bank(sequelize);
const TypePaymentsModel = TypePayments(sequelize);
const ExtraPurchases = ExtraPurchasesUser(sequelize);
const FixedPruchase = FixedPurchase(sequelize);
const InstallmentPurchaseModel = InstallmentPurchase(sequelize);
const PurchasesInstallmentModel = PurchasesInstallment(sequelize, Sequelize.DataTypes);

const models = {
    User: UserModel,
    Bank: BankModel,
    TypePayments: TypePaymentsModel,
    ExtraPurchasesUser: ExtraPurchases,
    FixedPruchase: FixedPruchase,
    InstallmentPurchase: InstallmentPurchaseModel,
    PurchasesInstallment: PurchasesInstallmentModel
};

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = {
    sequelize,
    ...models
};