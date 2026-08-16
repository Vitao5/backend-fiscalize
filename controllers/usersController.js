const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const { User } = require('../db/config/database')
const { generateId, isNullorEmpty, getUserMoment, isRootSystem, codeSixDigits, sendMail } = require('../comum/comumFunctions')

const process = require('process')
require("dotenv").config()

const hashCode = (code) => crypto.createHash('sha256').update(String(code).trim()).digest('hex')

// Registrar usuário
const register = async (req, res) => {

    try {
        const { name, email, password, phoneNumber } = req.body

        if (isNullorEmpty(name) || isNullorEmpty(email) || isNullorEmpty(password)) {
            return res.status(400).json({ message: "Preencha todos os campos!" })
        } else {
            // Verifica se o usuário já está cadastrado
            const verifyUserRegistered = await User.findOne({ where: { email } })
            if (verifyUserRegistered) {
                return res.status(400).json({ message: "E-mail já cadastrado, tente outro e-mail, ou recupere sua senha." })
            } else {
                if (password.length < 8) {
                    return res.status(400).json({ message: "A senha deve ter no mínimo 8 caracteres." });
                }
                const idUser = generateId()
                const verifyId = await User.findOne({ where: { id: idUser } })

                while (!!verifyId) {
                    idUser = generateId()
                }

                const passwordHash = await bcrypt.hash(password, 10)

                await User.create({
                    name: req.body.name,
                    email: req.body.email,
                    id: idUser,
                    admn: false,
                    password: passwordHash,
                    phoneNumber: phoneNumber
                })

                res.status(201).json({ message: "Usuário registrado com sucesso!", id: idUser })
            }
        }

    } catch (err) {
        res.status(400).json({ message: "Erro ao registrar usuário.", error: err.message })
    }
}

// Deletar usuário
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        // Verifica se o usuário existe
        const existUser = await User.findByPk(id)
        if (!existUser) {
            return res.status(404).json({ message: "Usuário não encontrado!" })
        }

        if (getUserMoment(req) != process.env.ROOT_SYSTEM) {
            return res.status(400).json({ message: "Você não possui permissão para deletar usuários" })
        } else {
            // Deleta o usuário
            if (!!isRootSystem(req)) {
                return res.status(400).json({ message: 'Este usuário não pode ser deletado' })
            } else {
                await User.destroy({ where: { id } })
                res.status(200).json({ message: "Usuário deletado com sucesso!" })
            }

        }

    } catch (err) {
        console.error("Erro ao deletar usuário:", err)
        res.status(400).json({ message: err.message })
    }
}

// Login do usuário
const login = async (req, res) => {
    const LOCK_TIME_LOGIN = 5 * 60 * 1000
    const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10)

    try {
        const { email, password } = req.body

        if (isNullorEmpty(email) || isNullorEmpty(password)) {
            return res.status(400).json({ message: "Preencha e-mail e senha!" })
        }

        const user = await User.findOne({ where: { email } })

        if (!user) {
            return res.status(404).json({ message: 'Usuário inexistente. Clique em criar conta.', code: 404 })
        }

        if (user.inativeUser === true) {
            return res.status(400).json({ message: "Usuário inativado, entre em contato com seu administrador!" })
        }

      
        if (user.loginAttempts >= MAX_ATTEMPTS) {
            const timeSinceLastAttempt = user.lastLoginAttempt ? (new Date() - new Date(user.lastLoginAttempt)) : LOCK_TIME_LOGIN

            if (timeSinceLastAttempt < LOCK_TIME_LOGIN) {
                const remainingSeconds = Math.ceil((LOCK_TIME_LOGIN - timeSinceLastAttempt) / 1000)
                const remainingMinutes = Math.ceil(remainingSeconds / 60)
                return res.status(403).json({
                    message: `Conta bloqueada por excesso de tentativas. Tente novamente em ${remainingMinutes} minuto(s) ou redefina sua senha.`
                })
            } else {
               
                await User.update({
                    loginAttempts: 0,
                    lastLoginAttempt: null
                }, { where: { id: user.id } })
                user.loginAttempts = 0
            }
        }

        const verifyPassword = await bcrypt.compare(password, user.password)

        if (!verifyPassword) {
            const newAttempts = (user.loginAttempts || 0) + 1
            await User.update({
                loginAttempts: newAttempts,
                lastLoginAttempt: new Date()
            }, { where: { id: user.id } })

            if (newAttempts >= MAX_ATTEMPTS) {
                return res.status(403).json({
                    message: 'Conta bloqueada por 5 minutos devido a múltiplas tentativas incorretas.'
                })
            } else {
                const restam = MAX_ATTEMPTS - newAttempts
                return res.status(400).json({
                    message: `E-mail ou senha incorretos! Restam ${restam} tentativa(s) até ser temporariamente bloqueado.`
                })
            }
        }

        // Login correto: zera as tentativas e atualiza último login
        await User.update({
            loginAttempts: 0,
            lastLoginAttempt: null
        }, { where: { id: user.id } })

        const currentDateTime = new Date()
        const localDateTime = new Date(currentDateTime.getTime() - (currentDateTime.getTimezoneOffset() * 60000))

        await User.update({ lastLogin: localDateTime }, { where: { id: user.id } })

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })

        return res.status(200).json({
            token,
            message: 'Autenticado com sucesso',
            userRoot: user.admin,
            name: user.name,
            email: user.email,
            code: 200,
            phoneNumber: user.phoneNumber,
            onboardingCompleted: user.onboardingCompleted || false
        })

    } catch (err) {
        console.error("Erro ao fazer login:", err)
        res.status(400).json({ error: "Erro ao fazer login." })
    }
}


const allUsers = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const currentUser = await User.findByPk(userMoment);

        if (!currentUser || !currentUser.admin) {
            return res.status(403).json({ message: "Você não possui permissão para listar usuários." });
        }

        const users = await User.findAll()


        const usersSelected = users.map(user => {
            return {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })

        res.status(200).json({ users: usersSelected })
    } catch (err) {
        console.error("Erro ao listar usuários:", err)
        res.status(400).json({ message: err.message })
    }
}

// Buscar usuário por ID
const userId = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado!" })
        }

        // Seleciona apenas os dados necessários
        const userSelected = {
            name: user.name,
            email: user.email
        }

        res.status(200).json({ user: userSelected })
    } catch (err) {
        console.error("Erro ao buscar usuário por ID:", err)
        res.status(400).json({ message: err.message })
    }
}

// Atualizar usuário
const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email } = req.body

        // Verifica se o usuário existe
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado!" })
        }

        // Atualiza o usuário
        await User.update({ name }, { where: { id } })
        res.status(200).json({ message: "Usuário atualizado com sucesso!" })
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err)
        res.status(400).json({ error: "Erro ao atualizar usuário." })
    }
}

const inativerUser = async (req, res) => {
    try {
        const { id, inativeUser } = req.body
        const userRoot = getUserMoment(req)
        const userIsRoot = await User.findByPk(userRoot)

        if (userIsRoot.admin == false) {
            return res.status(400).json({ message: "Você não possui permissão para inativar usuários" })
        } else {
            // Verifica se o usuário existe
            const user = await User.findByPk(id)
            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado!" })
            } else {

                if (!isRootSystem(id)) {
                    if (inativeUser == true) {
                        await User.update({ inativeUser }, { where: { id } })
                        res.status(200).json({ message: "Usuário inativado com sucesso!" })

                    } else {
                        await User.update({ inativeUser }, { where: { id } })
                        res.status(200).json({ message: "Usuário ativado com sucesso!" })
                    }
                } else {
                    res.status(400).json({ message: "O usuário root não pode ser desativado!" })
                }

            }
        }
    } catch (err) {
        console.error("Erro ao inativar usuário:", err)
        res.status(400).json({ message: "Erro ao inativar usuário.", error: err })
    }
}

const changeToAdmin = async (req, res) => {
    try {
        if (!!isRootSystem(req)) {
            const { idNewRootUser, root } = req.body

            const user = await User.findByPk(idNewRootUser)
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado!" })
            } else {
                if (!!root) {
                    await User.update({ admin: root }, { where: { id: user.id } })
                    res.status(200).json({ message: 'Usuário alterado para admin' })
                } else {
                    await User.update({ admin: root }, { where: { id: user.id } })
                    res.status(200).json({ message: 'Permissão de admin removida' })
                }
            }

        } else {
            res.status(400).json({ message: 'Você não possui acesso a essa funcionalidade!' })
        }
    } catch (err) {
        console.error("Erro ao alterar usuário para administrador:", err)
        res.status(400).json({ message: err.message })
    }
}

const sendCodePassword = async (req, res) => {
    try {
        const { email } = req.body
        if (isNullorEmpty(email)) {
            return res.status(400).json({ message: 'Informe o e-mail!' })
        }

        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(400).json({ message: 'E-mail não encontrado!' })
        }

        const code = codeSixDigits()
        const hashedCode = hashCode(code)
        const codeExpires = new Date(Date.now() + 2 * 60 * 1000)
        const codeExpiresMinutes = 2

        await sendMail(user.email, `Fiscalize Finanças: Seu código ${code} expira em ${codeExpiresMinutes} minutos, não compartilhe com ninguém. Se não foi você que solicitou, troque sua senha imediatamente.`)

        await User.update({ codePassword: hashedCode, codePasswordExpires: codeExpires }, { where: { id: user.id } })

        const [local, domain] = email.split('@')
        const emailSend = local.slice(0, 2) + '***@' + domain

        res.status(200).json({ message: `Código de segurança enviado para ${emailSend}` })
    } catch (err) {
        console.error("Erro ao enviar código de segurança:", err)
        res.status(500).json({ message: 'Erro ao enviar código de segurança. Tente novamente mais tarde.' })
    }
}

// Verificar código de segurança
const verifyCode = async (req, res) => {
    try {
        const { email, codePassword } = req.body

        if (isNullorEmpty(email) || isNullorEmpty(codePassword)) {
            return res.status(400).json({ message: 'Preencha todos os campos!' })
        }

        const hashedCode = hashCode(codePassword)
        const user = await User.findOne({ where: { email, codePassword: hashedCode } })

        if (!user) {
            return res.status(400).json({ message: 'Código inválido!' })
        }

        if (user.codePasswordExpires && new Date() > new Date(user.codePasswordExpires)) {
            await User.update({ codePassword: null, codePasswordExpires: null }, { where: { id: user.id } })
            return res.status(400).json({ message: 'Código expirado! Solicite um novo código.' })
        }

        return res.status(200).json({ message: 'Código verificado com sucesso!' })
    } catch (err) {
        console.error("Erro ao verificar código:", err)
        res.status(500).json({ message: 'Erro ao verificar código. Tente novamente mais tarde.' })
    }
}

// Resetar senha
const resetPassword = async (req, res) => {
    try {
        const { email, codePassword, password } = req.body

        if (isNullorEmpty(email) || isNullorEmpty(codePassword) || isNullorEmpty(password)) {
            return res.status(400).json({ message: 'Preencha todos os campos!' })
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "A senha deve ter no mínimo 8 caracteres." })
        }

        const hashedCode = hashCode(codePassword)
        const user = await User.findOne({ where: { email, codePassword: hashedCode } })

        if (!user) {
            return res.status(400).json({ message: 'Código inválido!' })
        }

        if (user.codePasswordExpires && new Date() > new Date(user.codePasswordExpires)) {
            await User.update({ codePassword: null, codePasswordExpires: null }, { where: { id: user.id } })
            return res.status(400).json({ message: 'Código expirado! Solicite um novo código.' })
        }

        const newPasswordHash = await bcrypt.hash(password, 10)

        await User.update({
            loginAttempts: 0,
            codePassword: null,
            codePasswordExpires: null,
            password: newPasswordHash
        }, { where: { id: user.id } })

        return res.status(200).json({ message: 'Senha atualizada com sucesso!' })
    } catch (err) {
        console.error("Erro ao resetar senha:", err)
        res.status(500).json({ message: 'Erro ao resetar senha. Tente novamente mais tarde.' })
    }
}


module.exports = {
    register, deleteUser,
    login, allUsers,
    userId, updateUser,
    inativerUser, changeToAdmin,
    sendCodePassword, verifyCode, resetPassword
}