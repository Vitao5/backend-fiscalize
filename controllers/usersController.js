const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require('../db/config/database'); 
const {generateId, isNullorEmpty, getUserMoment, isRootSystem, codeFourDigits, sendMail} = require('../comum/comumFunctions');

const process = require('process');
require("dotenv").config()

// Registrar usuário
const register = async (req, res) => {

    try {
        const { name, email, password, phoneNumber } = req.body;

        if(isNullorEmpty(name) || isNullorEmpty(email) || isNullorEmpty(password)){
            return res.status(400).json({ message: "Preencha todos os campos!" });
        }else{
            // Verifica se o usuário já está cadastrado
            const verifyUserRegistered = await User.findOne({ where: { email } });
            if (verifyUserRegistered) {
                return res.status(400).json({ message: "E=mail já cadastrado, tente outro e-mail, ou recupere sua senha." });
            }else{

                    const idUser = generateId();
                    const verifyId = await User.findOne({ where: { id: idUser } });

                    while(!!verifyId){
                        idUser = generateId();
                    }

                    const passwordHash = await bcrypt.hash(password, 10);                

                    await User.create({
                        name: req.body.name,
                        email: req.body.email,
                        id: idUser,
                        admn: req.body.userRoot ? req.body.userRoot : false,
                        password: passwordHash,
                        phoneNumber: phoneNumber
                    });

                    res.status(201).json({ message: "Usuário registrado com sucesso!", id: idUser });
                }
            }

    } catch (err) {
        res.status(400).json({ message: "Erro ao registrar usuário.", error: err.message });
    }
};

// Deletar usuário
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica se o usuário existe
        const existUser = await User.findByPk(id);
        if (!existUser) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }

        if(getUserMoment(req) != process.env.ROOT_SYSTEM){
            return res.status(400).json({ message: "Você não possui permissão para deletar usuários" });
        }else{
            // Deleta o usuário
            if(!!isRootSystem(req)){
                return res.status(400).json({message: 'Este usuário não pode ser deletado'});
            }else{
                await User.destroy({ where: { id } });
                res.status(200).json({ message: "Usuário deletado com sucesso!" });
            }
            
        }

    } catch (err) {
        console.error("Erro ao deletar usuário:", err);
        res.status(400).json({ message: err.message });
    }
};

// Login do usuário
const login = async (req, res) => {
    const LOCK_TIME_LOGIN = 15 * 60 * 1000

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        

        if(!user){
            return res.status(404).json({ message: 'Usuário inexistente. Clique em criar conta.', code: 404 });
        }

        if (user.loginAttempts >= process.env.MAX_LOGIN_ATTEMPTS && new Date() - user.lastLoginAttempt < LOCK_TIME_LOGIN) {
            return res.status(403).json({ 
                message: 'Conta bloqueada por segurança. Efetue a troca de senha.' });
        }

        if(user.inativeUser == true){
            return res.status(400).json({ message: "Usuário inativado, entre em contato com seu administrador!" });
        }else{
            const verifyPassword = await bcrypt.compare(password, user.password);
            const verifyEmail = user.email != email
            if (!verifyPassword || !!verifyEmail) {
                await User.update({
                    loginAttempts: user.loginAttempts + 1,
                    lastLoginAttempt: new Date()
                  }, { where: { id: user.id } });
                const userLogin = await User.findOne({ where: { email } });
                return res.status(400).json({ message: `E-mail ou senha incorretos!. Restam ${process.env.MAX_LOGIN_ATTEMPTS - userLogin.loginAttempts} tentativa(s) até ser bloqueado!` });
            }else{
                await User.update({
                    loginAttempts: 0,
                    lastLoginAttempt: null
                  }, { where: { id: user.id } });

                  const currentDateTime = new Date();
                  const localDateTime = new Date(currentDateTime.getTime() - (currentDateTime.getTimezoneOffset() * 60000));
          
                  await User.update({ lastLogin: localDateTime }, { where: { id: user.id} });
                  // Gera o token JWT
                  const token = jwt.sign({ id: user.id, email: user.password }, process.env.JWT_SECRET, { expiresIn: '24h' });
                 return res.status(200).json({ token, message: 'Autenticado com sucesso', userRoot: user.admin, name:user.name, email:user.email, code: 200, phoneNumber: user.phoneNumber});
                }
        }

  
    } catch (err) {
        console.error("Erro ao fazer login:", err);
        res.status(400).json({ error: "Erro ao fazer login." });
    }
};

// Listar todos os usuários
const allUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        // Seleciona apenas os dados necessários
        const usersSelected = users.map(user => {
            return {
                id: user.id,
                name: user.name,
                email: user.email
            };
        });

        res.status(200).json({ users: usersSelected });
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(400).json({ message: err.message });
    }
};

// Buscar usuário por ID
const userId = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }

        // Seleciona apenas os dados necessários
        const userSelected = {
            name: user.name,
            email: user.email
        };

        res.status(200).json({ user: userSelected });
    } catch (err) {
        console.error("Erro ao buscar usuário por ID:", err);
        res.status(400).json({ message: err.message });
    }
};

// Atualizar usuário
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Verifica se o usuário existe
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado!" });
        }

        // Atualiza o usuário
        await User.update({ name }, { where: { id } });
        res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(400).json({ error: "Erro ao atualizar usuário." });
    }
};

const inativerUser = async (req, res) => {
    try {
        const {id, inativeUser } = req.body;
        const userRoot = getUserMoment(req);
        const userIsRoot = await User.findByPk(userRoot);

        if(userIsRoot.admin == false){
            return res.status(400).json({ message: "Você não possui permissão para inativar usuários" });
        }else{
            // Verifica se o usuário existe
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado!" });
            }else{

                if(!isRootSystem(id)){
                    if(inativeUser == true){
                        await User.update({ inativeUser }, { where: { id } });
                        res.status(200).json({ message: "Usuário inativado com sucesso!" });
    
                    }else{
                        await User.update({ inativeUser }, { where: { id } });
                        res.status(200).json({ message: "Usuário ativado com sucesso!" });
                    }
                }else{
                    res.status(400).json({ message: "O usuário root não pode ser desativado!" });  
                }

            }
        }
    } catch (err) {
        console.error("Erro ao inativar usuário:", err);
        res.status(400).json({ message: "Erro ao inativar usuário.", error: err });
    }
}

const changeToAdmin = async (req, res) => {
    try {
        if(!!isRootSystem(req)){
            const { idNewRootUser, root } = req.body;
    
            const user = await User.findByPk(idNewRootUser);
            if (!user) {
                return res.status(404).json({ message: "Usuário não encontrado!" });
            }else{
                if(!!root){
                    await User.update({ admin: root }, { where: { id: user.id} });
                    res.status(200).json({message: 'Usuário alterado para admin'})
                }else{
                    await User.update({ admin: root }, { where: { id: user.id} });
                    res.status(200).json({message: 'Permissão de admin removida'})
                }
            }
            
        }else{
            res.status(400).json({message: 'Você não possui acesso a essa funcionalidade!'})
        }
    } catch (err) {
        console.error("Erro ao alterar usuário para administrador:", err);
        res.status(400).json({ message: err.message });
    }
}

const sendCodePassword = async (req, res) =>{
    const {email} = req.body

    const user = await User.findOne({where: {email}})
    if(!user){
        return res.status(400).json({message: 'E-mail não encontrado!'})
    }
    
    const code = codeFourDigits()
     sendMail(user.email,`Fiscalize Finanças: Seu código de segurança é ${code}, não compartilhe com ninguém. Se não foi você que solicitou, troque sua senha imediatamente.`)

    await User.update({ codePassword: code }, { where: { id: user.id} });

    const [local, domain] = email.split('@');
    const emailSend=  local.slice(0, 2) + '***@' + domain.replace(/.(?=.{2}@)/g, '*');

    res.status(200).json({message: `Código de segurança enviado para ${emailSend}`})

}

const resetPassword = async (req, res) =>{
    const {codePassword, password} = req.body
    const user = await User.findOne({where: {codePassword}})

    if(user.codePassword != codePassword){
        return res.status(400).json({message: 'Código informado esta inválido'})
    }
    const newPasswordHash = await bcrypt.hash(password, 10);

    await User.update({
        loginAttempts: 0,
        codePassword: null,
        password: newPasswordHash
      }, { where: { id: user.id } });

    return res.status(200).json({message: 'Senha atualizada com sucesso'})
}

// Exportação dos métodos
module.exports = {
    register,deleteUser,
    login,allUsers,
    userId,updateUser,
    inativerUser, changeToAdmin,
    sendCodePassword, resetPassword
};