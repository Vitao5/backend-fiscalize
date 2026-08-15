
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'postgres';
const useEnvVar = process.env.DATABASE_URL ? 'DATABASE_URL' : undefined;

const dbConfig = {
  username: process.env.PGUSER || process.env.MYSQLUSER,
  password: process.env.PGPASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.PGDATABASE || process.env.MYSQLDATABASE,
  host: process.env.PGHOST || process.env.MYSQLHOST,
  dialect: dialect,
  use_env_variable: useEnvVar,
  dialectOptions: dialect === 'postgres' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
};

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};
