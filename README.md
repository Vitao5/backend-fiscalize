# 🛡️ Fiscalize API v1

<p align="center">
  <strong>API RESTful para Gestão Financeira Pessoal</strong>
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
  <a href="https://sequelize.org/"><img src="https://img.shields.io/badge/Sequelize-6.x-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize"/></a>
  <a href="https://docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/></a>
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <a href="#-sobre-o-projeto"><strong>Português</strong></a> · <a href="#-about-the-project"><strong>English</strong></a>
</p>

---

## 🇧🇷 Documentação em Português

---

## 📋 Sobre o Projeto

A **Fiscalize API** é o backend da plataforma **Fiscalize Finanças** — um sistema completo de gestão financeira pessoal. Construída com **Node.js** e **Express**, a API oferece uma arquitetura RESTful robusta para controle de despesas, integração bancária via **Open Finance (Pluggy)**, autenticação segura com **JWT** e notificações por e-mail.

---

## ✨ Funcionalidades Principais

| Módulo | Descrição |
|:---|:---|
| 🔐 **Autenticação** | Registro, login com JWT, refresh token, controle de tentativas de login |
| 👤 **Usuários** | CRUD completo, recuperação de senha por e-mail com código de verificação |
| 🏦 **Bancos** | Cadastro e gerenciamento de contas bancárias do usuário |
| 💳 **Formas de Pagamento** | Gerenciamento de métodos de pagamento (cartão, PIX, boleto, etc.) |
| 🛒 **Despesas Extras** | Registro e controle de compras/despesas avulsas |
| 📅 **Despesas Fixas** | Gerenciamento de gastos recorrentes mensais |
| 🔄 **Compras Parceladas** | Controle de compras parceladas com geração automática de parcelas |
| 🏧 **Open Finance** | Integração com a API Pluggy para conexão bancária e extrato automático |
| 📧 **E-mail** | Envio de e-mails transacionais via Resend (recuperação de senha) |

---

## 🏗️ Arquitetura

```
Fiscalize-API-V1/
│
├── config/                 # Configurações do banco de dados
├── controllers/            # Lógica de negócio dos endpoints
│   ├── bankController.js
│   ├── extraPurchaseController.js
│   ├── fixedPurchaseController.js
│   ├── installmentPurchaseController.js
│   ├── pluggyController.js
│   ├── typePaymentsController.js
│   └── usersController.js
│
├── db/
│   ├── config/             # Config de conexão Sequelize
│   └── models/             # Modelos do banco de dados
│       ├── bankModel.js
│       ├── bankTransactionModel.js
│       ├── extraPurchasesModel.js
│       ├── fixedPurchasesModel.js
│       ├── installmentPurchaseModel.js
│       ├── pluggyItemModel.js
│       ├── purchasesInstallmentModel.js
│       ├── refreshTokenModel.js
│       ├── typePaymentsModel.js
│       └── usersModel.js
│
├── middleware/              # Middlewares (auth, rate limit, slow down)
├── migrations/              # Migrações do banco de dados
├── models/                  # Index de carregamento automático dos models
├── routes/                  # Definição das rotas
│   ├── bank.routes.js
│   ├── extraPurchase.routes.js
│   ├── fixedPurchase.routes.js
│   ├── installmentPurchase.routes.js
│   ├── pluggy.routes.js
│   ├── typePayments.routes.js
│   └── user.routes.js
│
├── comum/                   # Funções utilitárias compartilhadas
├── server.js                # Ponto de entrada da aplicação
├── Dockerfile               # Configuração Docker
├── ecosystem.config.js      # Configuração PM2
├── .env.example             # Variáveis de ambiente de exemplo
└── package.json
```

---

## 🔌 Endpoints da API

### 🩺 Health Check

| Método | Rota | Descrição |
|:---:|:---|:---|
| `GET` | `/api/health` | Verifica se a API está online |

### 👤 Usuários — `/api/users`

| Método | Rota | Auth | Descrição |
|:---:|:---|:---:|:---|
| `POST` | `/register` | ❌ | Criar nova conta |
| `POST` | `/login` | ❌ | Autenticar e obter token JWT |
| `POST` | `/refresh-token` | ❌ | Renovar token de acesso |
| `POST` | `/send-code` | ❌ | Enviar código de recuperação por e-mail |
| `POST` | `/verify-code` | ❌ | Verificar código de recuperação |
| `POST` | `/reset-password` | ❌ | Redefinir senha |
| `GET` | `/profile` | ✅ | Obter dados do usuário logado |
| `PUT` | `/update` | ✅ | Atualizar perfil do usuário |
| `DELETE` | `/delete` | ✅ | Excluir conta do usuário |

### 🏦 Bancos — `/api/banks`

| Método | Rota | Auth | Descrição |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | Listar bancos do usuário |
| `POST` | `/` | ✅ | Cadastrar novo banco |
| `PUT` | `/:id` | ✅ | Atualizar dados do banco |
| `DELETE` | `/:id` | ✅ | Remover banco |

### 💳 Formas de Pagamento — `/api/type-payments`

| Método | Rota | Auth | Descrição |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | Listar formas de pagamento |
| `POST` | `/` | ✅ | Criar nova forma de pagamento |
| `PUT` | `/:id` | ✅ | Atualizar forma de pagamento |
| `DELETE` | `/:id` | ✅ | Remover forma de pagamento |

### 🛒 Despesas Extras — `/api/extra-purchase`

| Método | Rota | Auth | Descrição |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | Listar despesas extras |
| `POST` | `/` | ✅ | Criar despesa extra |
| `PUT` | `/:id` | ✅ | Atualizar despesa extra |
| `DELETE` | `/:id` | ✅ | Remover despesa extra |

### 📅 Despesas Fixas — `/api/fixed-purchase`

| Método | Rota | Auth | Descrição |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | Listar despesas fixas |
| `POST` | `/` | ✅ | Criar despesa fixa |
| `PUT` | `/:id` | ✅ | Atualizar despesa fixa |
| `DELETE` | `/:id` | ✅ | Remover despesa fixa |

### 🔄 Compras Parceladas — `/api/installment-purchase`

| Método | Rota | Auth | Descrição |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | Listar compras parceladas |
| `POST` | `/` | ✅ | Criar compra parcelada |
| `PUT` | `/:id` | ✅ | Atualizar compra parcelada |
| `DELETE` | `/:id` | ✅ | Remover compra parcelada |

### 🏧 Pluggy (Open Finance) — `/api/pluggy`

| Método | Rota | Auth | Descrição |
|:---:|:---|:---:|:---|
| `POST` | `/connect-token` | ✅ | Gerar token de conexão Pluggy |
| `POST` | `/webhook` | ❌ | Receber eventos do webhook Pluggy |
| `GET` | `/accounts` | ✅ | Listar contas conectadas |
| `GET` | `/transactions` | ✅ | Listar transações bancárias |
| `DELETE` | `/disconnect` | ✅ | Desconectar conta bancária |

---

## 🔒 Segurança

| Recurso | Implementação |
|:---|:---|
| 🔑 Autenticação | JWT (JSON Web Token) com refresh token |
| 🔐 Senhas | Hash com bcryptjs |
| 🛡️ Headers | Helmet.js para proteção de cabeçalhos HTTP |
| 🚦 Rate Limiting | express-rate-limit (100 req/15min em produção) |
| 🐌 Speed Limiting | express-slow-down (delay progressivo) |
| 🌐 CORS | Lista de origens permitidas configurável |
| 📧 Recuperação de Senha | Código por e-mail com expiração (rate-limited) |

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** >= 18
- **PostgreSQL** >= 15 (ou [Neon](https://neon.tech/))
- **npm** ou **yarn**
- Conta no [Resend](https://resend.com/) (envio de e-mails)
- Conta no [Pluggy](https://pluggy.ai/) (Open Finance — opcional)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/Fiscalize-API-V1.git
cd Fiscalize-API-V1

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### Variáveis de Ambiente

```env
# Application
PORT=3002
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app

# Database (Neon / Postgres)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DB_DIALECT=postgres

# Authentication
JWT_SECRET=sua_chave_secreta_jwt_longa_e_forte
ROOT_SYSTEM=id_do_usuario_root
MAX_LOGIN_ATTEMPTS=5

# Resend (Email)
RESEND_API_KEY=sua_chave_resend

# Pluggy Open Finance
PLUGGY_CLIENT_ID=seu_client_id_pluggy
PLUGGY_CLIENT_SECRET=seu_client_secret_pluggy
```

### Executar

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start

# Testes
npm test
```

### Docker

```bash
# Build da imagem
docker build -t fiscalize-api .

# Executar container
docker run -p 3002:3002 --env-file .env fiscalize-api
```

### PM2 (Produção)

```bash
# Iniciar com PM2
pm2 start ecosystem.config.js

# Monitorar
pm2 monit
```

---

## 🗄️ Banco de Dados

### Modelos

| Modelo | Descrição |
|:---|:---|
| `Users` | Usuários do sistema |
| `Bank` | Contas bancárias dos usuários |
| `TypePayments` | Formas de pagamento |
| `ExtraPurchases` | Despesas extras/avulsas |
| `FixedPurchases` | Despesas fixas recorrentes |
| `InstallmentPurchase` | Compras parceladas (cabeçalho) |
| `PurchasesInstallment` | Parcelas individuais |
| `PluggyItem` | Itens conectados via Pluggy |
| `BankTransaction` | Transações bancárias importadas |
| `RefreshToken` | Tokens de atualização JWT |

### Migrações

```bash
# Executar migrações
npx sequelize-cli db:migrate

# Desfazer última migração
npx sequelize-cli db:migrate:undo

# Desfazer todas as migrações
npx sequelize-cli db:migrate:undo:all
```

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=flat-square&logo=sequelize&logoColor=white" alt="Sequelize"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
</p>

---
---

## 🇺🇸 English Documentation

---

## 📋 About the Project

**Fiscalize API** is the backend for the **Fiscalize Finanças** platform — a comprehensive personal finance management system. Built with **Node.js** and **Express**, the API provides a robust RESTful architecture for expense tracking, banking integration via **Open Finance (Pluggy)**, secure **JWT** authentication, and email notifications.

---

## ✨ Key Features

| Module | Description |
|:---|:---|
| 🔐 **Authentication** | Registration, JWT login, refresh tokens, login attempt control |
| 👤 **Users** | Full CRUD, password recovery via email with verification code |
| 🏦 **Banks** | Register and manage user bank accounts |
| 💳 **Payment Methods** | Manage payment methods (card, PIX, bank slip, etc.) |
| 🛒 **Extra Expenses** | Track and manage one-off purchases/expenses |
| 📅 **Fixed Expenses** | Manage recurring monthly expenses |
| 🔄 **Installment Purchases** | Track installment purchases with automatic installment generation |
| 🏧 **Open Finance** | Pluggy API integration for bank connection and automatic statements |
| 📧 **Email** | Transactional emails via Resend (password recovery) |

---

## 🏗️ Architecture

```
Fiscalize-API-V1/
│
├── config/                 # Database configurations
├── controllers/            # Business logic for endpoints
│   ├── bankController.js
│   ├── extraPurchaseController.js
│   ├── fixedPurchaseController.js
│   ├── installmentPurchaseController.js
│   ├── pluggyController.js
│   ├── typePaymentsController.js
│   └── usersController.js
│
├── db/
│   ├── config/             # Sequelize connection config
│   └── models/             # Database models
│       ├── bankModel.js
│       ├── bankTransactionModel.js
│       ├── extraPurchasesModel.js
│       ├── fixedPurchasesModel.js
│       ├── installmentPurchaseModel.js
│       ├── pluggyItemModel.js
│       ├── purchasesInstallmentModel.js
│       ├── refreshTokenModel.js
│       ├── typePaymentsModel.js
│       └── usersModel.js
│
├── middleware/              # Middlewares (auth, rate limit, slow down)
├── migrations/              # Database migrations
├── models/                  # Auto-loading model index
├── routes/                  # Route definitions
│   ├── bank.routes.js
│   ├── extraPurchase.routes.js
│   ├── fixedPurchase.routes.js
│   ├── installmentPurchase.routes.js
│   ├── pluggy.routes.js
│   ├── typePayments.routes.js
│   └── user.routes.js
│
├── comum/                   # Shared utility functions
├── server.js                # Application entry point
├── Dockerfile               # Docker configuration
├── ecosystem.config.js      # PM2 configuration
├── .env.example             # Environment variables example
└── package.json
```

---

## 🔌 API Endpoints

### 🩺 Health Check

| Method | Route | Description |
|:---:|:---|:---|
| `GET` | `/api/health` | Check if API is online |

### 👤 Users — `/api/users`

| Method | Route | Auth | Description |
|:---:|:---|:---:|:---|
| `POST` | `/register` | ❌ | Create new account |
| `POST` | `/login` | ❌ | Authenticate and get JWT token |
| `POST` | `/refresh-token` | ❌ | Renew access token |
| `POST` | `/send-code` | ❌ | Send recovery code via email |
| `POST` | `/verify-code` | ❌ | Verify recovery code |
| `POST` | `/reset-password` | ❌ | Reset password |
| `GET` | `/profile` | ✅ | Get logged-in user data |
| `PUT` | `/update` | ✅ | Update user profile |
| `DELETE` | `/delete` | ✅ | Delete user account |

### 🏦 Banks — `/api/banks`

| Method | Route | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | List user banks |
| `POST` | `/` | ✅ | Register new bank |
| `PUT` | `/:id` | ✅ | Update bank data |
| `DELETE` | `/:id` | ✅ | Remove bank |

### 💳 Payment Methods — `/api/type-payments`

| Method | Route | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | List payment methods |
| `POST` | `/` | ✅ | Create payment method |
| `PUT` | `/:id` | ✅ | Update payment method |
| `DELETE` | `/:id` | ✅ | Remove payment method |

### 🛒 Extra Expenses — `/api/extra-purchase`

| Method | Route | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | List extra expenses |
| `POST` | `/` | ✅ | Create extra expense |
| `PUT` | `/:id` | ✅ | Update extra expense |
| `DELETE` | `/:id` | ✅ | Remove extra expense |

### 📅 Fixed Expenses — `/api/fixed-purchase`

| Method | Route | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | List fixed expenses |
| `POST` | `/` | ✅ | Create fixed expense |
| `PUT` | `/:id` | ✅ | Update fixed expense |
| `DELETE` | `/:id` | ✅ | Remove fixed expense |

### 🔄 Installment Purchases — `/api/installment-purchase`

| Method | Route | Auth | Description |
|:---:|:---|:---:|:---|
| `GET` | `/` | ✅ | List installment purchases |
| `POST` | `/` | ✅ | Create installment purchase |
| `PUT` | `/:id` | ✅ | Update installment purchase |
| `DELETE` | `/:id` | ✅ | Remove installment purchase |

### 🏧 Pluggy (Open Finance) — `/api/pluggy`

| Method | Route | Auth | Description |
|:---:|:---|:---:|:---|
| `POST` | `/connect-token` | ✅ | Generate Pluggy connect token |
| `POST` | `/webhook` | ❌ | Receive Pluggy webhook events |
| `GET` | `/accounts` | ✅ | List connected accounts |
| `GET` | `/transactions` | ✅ | List bank transactions |
| `DELETE` | `/disconnect` | ✅ | Disconnect bank account |

---

## 🔒 Security

| Feature | Implementation |
|:---|:---|
| 🔑 Authentication | JWT (JSON Web Token) with refresh token |
| 🔐 Passwords | Hashed with bcryptjs |
| 🛡️ Headers | Helmet.js for HTTP header protection |
| 🚦 Rate Limiting | express-rate-limit (100 req/15min in production) |
| 🐌 Speed Limiting | express-slow-down (progressive delay) |
| 🌐 CORS | Configurable allowed origins list |
| 📧 Password Recovery | Email code with expiration (rate-limited) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 15 (or [Neon](https://neon.tech/))
- **npm** or **yarn**
- [Resend](https://resend.com/) account (email delivery)
- [Pluggy](https://pluggy.ai/) account (Open Finance — optional)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Fiscalize-API-V1.git
cd Fiscalize-API-V1

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit the .env file with your credentials
```

### Environment Variables

```env
# Application
PORT=3002
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Database (Neon / Postgres)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DB_DIALECT=postgres

# Authentication
JWT_SECRET=your_strong_long_jwt_secret_key
ROOT_SYSTEM=root_user_id
MAX_LOGIN_ATTEMPTS=5

# Resend (Email)
RESEND_API_KEY=your_resend_key

# Pluggy Open Finance
PLUGGY_CLIENT_ID=your_pluggy_client_id
PLUGGY_CLIENT_SECRET=your_pluggy_client_secret
```

### Running

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start

# Tests
npm test
```

### Docker

```bash
# Build image
docker build -t fiscalize-api .

# Run container
docker run -p 3002:3002 --env-file .env fiscalize-api
```

### PM2 (Production)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

---

## 🗄️ Database

### Models

| Model | Description |
|:---|:---|
| `Users` | System users |
| `Bank` | User bank accounts |
| `TypePayments` | Payment methods |
| `ExtraPurchases` | One-off extra expenses |
| `FixedPurchases` | Recurring fixed expenses |
| `InstallmentPurchase` | Installment purchases (header) |
| `PurchasesInstallment` | Individual installments |
| `PluggyItem` | Pluggy connected items |
| `BankTransaction` | Imported bank transactions |
| `RefreshToken` | JWT refresh tokens |

### Migrations

```bash
# Run migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

---

<p align="center">
  <strong>Feito com ❤️ para o Fiscalize Finanças</strong> · <strong>Made with ❤️ for Fiscalize Finanças</strong>
</p>
