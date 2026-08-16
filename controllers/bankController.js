const { Bank } = require('../db/config/database'); 
const {generateId, isNullorEmpty, getUserMoment} = require('../comum/comumFunctions');

require("dotenv").config();

const registerBank = async (req, res) => {
    try {
        const banksToRegister = req.body;
        const userMoment = getUserMoment(req);         

        for (const element of banksToRegister) {
            const { bankName, datePayment } = element;
            if (isNullorEmpty(bankName) || isNullorEmpty(datePayment)) {
                return res.status(400).json({ message: "Preencha todos os campos!" });
            } else {
                const idBank = generateId();
                const verifyIdBank = await Bank.findByPK(idBank);
                

                while (verifyIdBank) {
                    idBank = generateId();
                    verifyIdBank = await Bank.findByPk(idBank);
                }

               await Bank.create({
                    bankName: bankName,
                    datePayment: datePayment,
                    id: idBank,
                    createdBy: userMoment
                });


            }
        }
        const listAllBanksRegisterUser = await Bank.findAll({
            where: { createdBy: userMoment }
          });
        
        return res.status(201).json({ message: "Banco registrado com sucesso!", listaBancos: listAllBanksRegisterUser });
    } catch (err) {
        return res.status(400).json({ message: "Erro ao registrar banco.", error: err.message });
    }
}

const listBanks = async (req, res) => {
    try {
        const userMoment = getUserMoment(req); 
         
        const listAllBanksRegisterUser = await Bank.findAll({
            where: { createdBy: userMoment }
          });

       return res.status(201).json({listaBancos: listAllBanksRegisterUser });
    } catch (err) {
        return res.status(400).json({ message: "Erro ao listar bancos.", error: err.message });
    }
}

const deleteBank = async (req, res) => {
    try {
        const banksToDelete = req.body;
        const userMoment = getUserMoment(req);
        for (const element of banksToDelete) {
            const { id } = element;
            const verifyIdBank = await Bank.findByPk(id);

            if (verifyIdBank) {
                await Bank.destroy({ where: { id: id, createdBy: userMoment } })


                const listaBancos  = await Bank.findAll({
                    where: { createdBy: userMoment }
                  });
                return res.status(200).json({ message: "Banco deletado com sucesso!", listaBancos: listaBancos });

            } else {
                return res.status(404).json({ message: "Banco não encontrado!" });
            }
        }
 

    } catch (err) {
        return res.status(400).json({ message: "Erro ao deletar banco.", error: err.message });
    }
}

const alterInfoBank = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const banksToAlter = req.body;
        
        for (const element of banksToAlter) {
            const { id, bankName, datePayment } = element;
            if(isNullorEmpty(bankName) || isNullorEmpty(datePayment)){
                return res.status(400).json({ message: "Preencha todos os campos!" });
            }else{
             
                const existBank = await Bank.findOne({ where: { id, createdBy: userMoment } });
                if (!existBank) {
                    return res.status(404).json({ message: "Banco não encontrado!" });
                }
                await Bank.update({ bankName, datePayment }, { where: { id, createdBy: userMoment } });

                const listaBancosAlter  = await Bank.findAll({
                    where: { createdBy: userMoment }
                  });
        
                return res.status(200).json({ message: "Banco atualizado com sucesso!", listaBancos: listaBancosAlter });
            }
        }

    } catch (err) {
        return res.status(400).json({ message: "Erro ao atualizar banco.", error: err.message });
    }
}

module.exports = {
    registerBank,
    listBanks,
    deleteBank,
    alterInfoBank
};
