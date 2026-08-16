const {generateId, isNullorEmpty, getUserMoment} = require('../comum/comumFunctions');
const { InstallmentPurchase, PurchasesInstallment, sequelize } = require('../db/config/database');
const moment = require('moment');
const { Op } = require('sequelize');

const registerInstallmentPurchase = async (req, res) => {
    const purchases = req.body
    const userMoment = getUserMoment(req);



    try{
        const results = [];

            const purchase = await InstallmentPurchase.create({
                description: purchases.description,
                quantityInstallments: parseInt(purchases.quantityInstallments),
                installmentValue: parseFloat(purchases.installmentValue),
                userId: userMoment
            });

            const installmentsToCreate = [];
            for (let i = 1; i <= purchase.quantityInstallments; i++) {
                installmentsToCreate.push({
                    userId: userMoment,
                    purchaseId: purchase.id,
                    installmentNumber: i,
                    installmentValue: purchase.installmentValue,
                    installmentPaid: false
                });
            }

            await PurchasesInstallment.bulkCreate(installmentsToCreate);

        return res.status(200).json({message: 'Compra(s) parcelada(s) registrada(s) com sucesso', status: 200})

    }catch (err){
        return res.status(500).json({message: 'Erro interno do servidor', error: ''})
    }
}

const updateInstallmentPurchase = async (req, res) => {
    const {id, description, quantityInstallments, installmentValue} = req.body
    const userMoment = getUserMoment(req);

    try {
        if(isNullorEmpty(id)){
            return res.status(400).json({message: 'ID é obrigatório'})
        }

        const exist = await InstallmentPurchase.findByPk(id)

        if (!exist || exist.userId !== userMoment) {
            return res.status(400).json({message: 'Compra parcelada não encontrada'})
        }

        await InstallmentPurchase.update({
            description: description || exist.description,
            quantityInstallments: quantityInstallments ? parseInt(quantityInstallments) : exist.quantityInstallments,
            installmentValue: installmentValue ? parseFloat(installmentValue) : exist.installmentValue
        }, {
            where: {
                id: id,
                userId: userMoment
            }
        })

        return res.json({message: 'Compra parcelada alterada com sucesso', status: 200})
    } catch (err) {
        return res.status(500).json({message: 'Erro interno do servidor', error: ''})
    }
}

const listInstallmentPurchases = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);

        const list = await InstallmentPurchase.findAll({
            where: {userId: userMoment},
            attributes: {exclude: ['userId']},
            include: [{
                model: PurchasesInstallment,
                as: 'installments',
                attributes: ['id', 'installmentNumber', 'installmentValue', 'installmentPaid']
            }],
            order: [['createdAt', 'DESC']]
        });

        if (list.length === 0) {
            return res.json({message: 'Nenhuma compra parcelada encontrada', listFormatted: []});
        }

        const listFormatted = list.map(item => ({
            ...item.toJSON(),
            createdAt: moment.utc(item.createdAt).format('DD/MM/YYYY'),
            updatedAt: moment.utc(item.updatedAt).format('DD/MM/YYYY')
        }));

        let totalValue = 0;
        listFormatted.forEach(item => {
            if (item.installments && item.installments.length > 0) {
                item.installments.forEach(inst => {
                    totalValue += parseFloat(inst.installmentValue);
                });
            }
        });

        return res.json({listFormatted: listFormatted, status: 200, totalValue: totalValue});

    } catch(err) {
        console.error('Erro ao listar compras parceladas:', err);
        return res.status(500).json({message: 'Erro interno do servidor', error: ''});
    }
}

const deleteInstallmentPurchase = async (req, res) => {
    try{
        const {id} = req.body
        const userMoment = getUserMoment(req);

        if(isNullorEmpty(id)){
            return res.status(400).json({message: 'ID é obrigatório'})
        }

        await PurchasesInstallment.destroy({
            where: {purchaseId: id, userId: userMoment}
        });

        await InstallmentPurchase.destroy({
            where: {id: id, userId: userMoment}
        });

        return res.status(200).json({message: 'Compra parcelada deletada com sucesso', status: 200})
    }catch(err){
        return res.status(500).json({message: 'Erro interno do servidor', error: ''})
    }
}

const deleteIndividualInstallment = async (req, res) => {
    try {
        const { id } = req.body;
        const userMoment = getUserMoment(req);

        if (isNullorEmpty(id)) {
            return res.status(400).json({ message: 'ID da parcela é obrigatório' });
        }

        await PurchasesInstallment.destroy({
            where: { id: id, userId: userMoment }
        });

        return res.status(200).json({ message: 'Parcela deletada com sucesso', status: 200 });
    } catch(err) {
        return res.status(500).json({ message: 'Erro interno do servidor', error: '' });
    }
}

const getInstallmentPurchaseById = async (req, res) => {
    const {id} = req.params
    const userMoment = getUserMoment(req);

    try{
        const purchase = await InstallmentPurchase.findOne({
            where: {id: id, userId: userMoment},
            attributes: {exclude: ['userId']}
        });

        if(!purchase){
            return res.status(404).json({message: 'Compra parcelada não encontrada'})
        }

        const formatted = {
            ...purchase.toJSON(),
            createdAt: moment.utc(purchase.createdAt).format('DD/MM/YYYY'),
            updatedAt: moment.utc(purchase.updatedAt).format('DD/MM/YYYY')
        };

        return res.status(200).json({status: 200, data: formatted})
    }catch (err){
        return res.status(500).json({message: 'Erro interno do servidor', error: ''})
    }
}

module.exports = {
    registerInstallmentPurchase,
    listInstallmentPurchases,
    updateInstallmentPurchase,
    deleteInstallmentPurchase,
    getInstallmentPurchaseById,
    deleteIndividualInstallment
}
