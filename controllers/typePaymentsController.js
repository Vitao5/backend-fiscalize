const {generateId, isNullorEmpty, getUserMoment} = require('../comum/comumFunctions');
const { TypePayments } = require('../db/models');

const registerTypePayment = async (req, res) => {
    try {
        const typePaymentsToRegister = req.body;
        const userMoment = getUserMoment(req);

        for (const element of typePaymentsToRegister) {
            const { namePayment } = element;
            if (isNullorEmpty(namePayment)) {
                return res.status(400).json({ message: "Preencha todos os campos!" });
            } else {
                let idTypePayment = generateId();
                let verifyIdTypePayment = await TypePayments.findByPk(idTypePayment);

                while (verifyIdTypePayment) {
                    idTypePayment = generateId();
                    verifyIdTypePayment = await TypePayments.findByPk(idTypePayment);
                }

                await TypePayments.create({
                    namePayment: namePayment,
                    id: idTypePayment,
                    createdBy: userMoment
                });
            }
        }

        const listAllTypePaymentsRegisterUser = await TypePayments.findAll({
            where: { createdBy: userMoment }
        });

        return res.status(201).json({ message: "Tipo de pagamento registrado com sucesso!", listaTipoPagamentos: listAllTypePaymentsRegisterUser });

    } catch (err) {
        return res.status(400).json({ message: "Erro ao registrar tipo de pagamento.", error: err.message });
    }
}

const deleteTypePayment = async (req, res) => {
    try {
        const paymentsToDelete = req.body;
        const userMoment = getUserMoment(req);

        for (const element of paymentsToDelete) {
            const { id } = element;
            const verifyIdTypePayment = await TypePayments.findByPk(id);

            if (verifyIdTypePayment) {
                await TypePayments.destroy({ where: { id: id, createdBy: userMoment } })

            } else {
                return res.status(404).json({ message: "Tipo de pagamento não encontrado!" })
            }
        }

        const listAllTypePaymentsRegisterUser = await TypePayments.findAll({
            where: { createdBy: userMoment }
        });

        return res.status(200).json({ message: "Tipo de pagamento deletado com sucesso!", listaTipoPagamentos: listAllTypePaymentsRegisterUser });

    } catch (err) {
        return res.status(400).json({ message: "Erro ao deletar tipo de pagamento.", error: err.message });
    }
}

const listTypePayments = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const listAllTypePaymentsRegisterUser = await TypePayments.findAll({
            where: { createdBy: userMoment }
        });

        return res.status(201).json({ listaTipoPagamentos: listAllTypePaymentsRegisterUser });
    } catch (err) {
        return res.status(400).json({ message: "Erro ao listar tipos de pagamento.", error: err.message });
    }
}

const alterInfoTypePayment = async (req, res) => {
    try {
        const paymentsToAlter = req.body;
        const userMoment = getUserMoment(req);

        for (const element of paymentsToAlter) {
            const { id, namePayment } = element;
            if (isNullorEmpty(namePayment)) {
                return res.status(400).json({ message: "Preencha todos os campos!" });
            } else {
                const verifyIdTypePayment = await TypePayments.findByPk(id);

                if (verifyIdTypePayment) {
await TypePayments.update({ namePayment: namePayment }, { where: { id: id, createdBy: userMoment } });
                } else {
                    return res.status(404).json({ message: "Tipo de pagamento não encontrado!" });
                }
            }
        }

        const listAllTypePaymentsRegisterUser = await TypePayments.findAll({
            where: { createdBy: userMoment }
        });

        return res.status(200).json({ message: "Tipo de pagamento alterado com sucesso!", listaTipoPagamentos: listAllTypePaymentsRegisterUser });

    } catch (err) {
        return res.status(400).json({ message: "Erro ao alterar tipo de pagamento.", error: err.message });
    }
}

module.exports = {
    registerTypePayment,
    deleteTypePayment,
    listTypePayments,
    alterInfoTypePayment
};
