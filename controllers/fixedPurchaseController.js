const {generateId, isNullorEmpty, getUserMoment} = require('../comum/comumFunctions');
const { FixedPruchase, sequelize } = require('../db/config/database'); 

const registerFixedPurchase = async (req, res) => {
    const purchase = req.body;
    const userMoment = getUserMoment(req); 

    try {

        if (isNullorEmpty(purchase.name) || isNullorEmpty(purchase.value) || isNullorEmpty(purchase.dayMaxPayment)) {
            return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
        }

        await FixedPruchase.create({
            name: purchase.name,
            value: purchase.value,
            paymentMonth: purchase.paymentMonth || false,
            dayMaxPayment: purchase.dayMaxPayment,
            userId: userMoment
        });
        
        return res.status(200).json({ message: 'Despesa fixa registrada com sucesso', status: 200 });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
    }
};

const listFixedPurchase = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);

        const list = await FixedPruchase.findAll({
            where: { userId: userMoment },
            attributes: { exclude: ['userId'] },
            order: [['dayMaxPayment', 'ASC']]
        });

        if (list.length === 0) {
            return res.json({ message: 'Nenhuma despesa fixa encontrada', listFormatted: [] });
        }

        const listFormatted = list.map(item => item.toJSON());

        let totalFixo = 0;
        listFormatted.forEach(item => {
            totalFixo += parseFloat(item.value);
        });

        return res.json({ listFormatted, status: 200, totalFixo });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
    }
};

const alterFixedPurchase = async (req, res) => {
    const purchaseAlter = req.body;
    const userMoment = getUserMoment(req);

    try {
        const exist = await FixedPruchase.findByPk(purchaseAlter.id);

        if (!exist) return res.status(400).json({ message: 'Despesa fixa não encontrada.' });

        await FixedPruchase.update({
            name: purchaseAlter.name,
            value: purchaseAlter.value,
            paymentMonth: purchaseAlter.paymentMonth,
            dayMaxPayment: purchaseAlter.dayMaxPayment
        }, {
            where: {
                id: purchaseAlter.id,
                userId: userMoment
            }
        });

        return res.json({ message: 'Despesa fixa alterada com sucesso', status: 200 });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
    }
};

const deleteFixedPurchase = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);

        await FixedPruchase.destroy({
            where: { id: req.body.id, userId: userMoment }
        });

        return res.status(200).json({ message: 'Despesa fixa deletada com sucesso', status: 200 });
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
    }
};

module.exports = {
    registerFixedPurchase,
    listFixedPurchase,
    alterFixedPurchase,
    deleteFixedPurchase
};