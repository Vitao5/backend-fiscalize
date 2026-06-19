const {generateId, isNullorEmpty, getUserMoment} = require('../comum/comumFunctions');
const { ExtraPurchasesUser, sequelize } = require('../db/config/database'); 
const moment = require('moment');
const { Op } = require('sequelize');
const { limiter } = require('../middleware/middleware');

const registerExtraPurchase =  async (req, res) => {
    const purchases = req.body  
    const userMoment = getUserMoment(req); 

    if(Array.isArray(purchases) && purchases.every(item => typeof item === "object" && item == null)){
        return res.status(400).json({message: 'Dados no formato inválido'})
    }
    
    try{
        purchases.forEach(async (element) => {
            const idPurchase = generateId()
              
            if(isNullorEmpty(element.purchaseName) || isNullorEmpty(element.purchaseDate) ||
            isNullorEmpty(element.purchaseTypePayment) ||isNullorEmpty(element.bankName) ||isNullorEmpty(element.purchaseValue) ||
            isNullorEmpty(element.monthPayment)){
                return res.status(400).json({message: 'Campos obrigatórios não preenchidos'})
            }

            await ExtraPurchasesUser.create({
                purchaseName: element.purchaseName,
                purchaseTypePayment: element.purchaseTypePayment,
                bankName: element.bankName,
                purchaseValue: element.purchaseValue,
                monthPayment: element.monthPayment,
                purchaseDate:  moment.utc(element.purchaseDate).format('YYYY-MM-DD'),
                id: idPurchase,
                userId: userMoment
            });
        });
        
        return res.status(200).json({message: 'Despesa(s) registrada(s) com sucesso', status: 200})
     
    }catch (err){
        return res.status(500).json({message: 'Erro interno do servidor', error: err})
    }


}

const alterExtraPurchase = async (req, res) =>{
    const purchaseAlter = req.body  
    const userMoment = getUserMoment(req);   
    
    try {
        const exist = await ExtraPurchasesUser.findByPk(purchaseAlter.id)

        if (!exist) return res.status(400).json({ message: 'Uma compra não foi encontrada. Verifique as informações!' })

        await ExtraPurchasesUser.update({
            purchaseName: purchaseAlter.purchaseName,
            purchaseTypePayment: purchaseAlter.purchaseTypePayment,
            bankName: purchaseAlter.bankName,
            purchaseValue: purchaseAlter.purchaseValue,
            monthPayment: purchaseAlter.monthPayment,
            purchaseDate: purchaseAlter.purchaseDate
        }, {
            where: {
                id: purchaseAlter.id,
                userId: userMoment
            }
        })

        return res.json({ message: 'Informações alteradas com sucesso', status: 200 })
    } catch (err) {
        return res.status(500).json({ message: 'Erro interno do servidor', error: err })
    }
}

//a função abaixo tras as compras extras, caso não informado data inciio e fim, pega as 
//compras do mes atual
const listExtraPurchase = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);   
        const dateInitial = req.body.dateInitial ? moment(req.body.dateInitial, 'DD/MM/YYYY').format('YYYY-MM-DD'): moment().startOf('month').format('YYYY-MM-DD');
        const dateFinal = req.body.dateFinal ? moment(req.body.dateFinal, 'DD/MM/YYYY').format('YYYY-MM-DD'): moment().format('YYYY-MM-DD');

        const list = await ExtraPurchasesUser.findAll({
            where: {
                userId: userMoment,
                [Op.and]: [
                    sequelize.where(sequelize.fn('DATE', sequelize.col('purchaseDate')), '>=', dateInitial),
                    sequelize.where(sequelize.fn('DATE', sequelize.col('purchaseDate')), '<=', dateFinal)
                ]
            },
            attributes: { exclude: ['userId'] },
            order: [['purchaseDate', 'ASC']]
        });


        if (list.length === 0) {
            return res.json({ message: 'Nenhuma compra encontrada nesse período', listFormatted:[] });
        }

        const listFormatted = list.map(item => ({
            ...item.toJSON(),
            purchaseDate: moment.utc(item.purchaseDate).format('DD/MM/YYYY')
        }));
        
        let valorCompras = 0;
        listFormatted.forEach(item => {
            valorCompras += parseFloat(item.purchaseValue);
        });
        listFormatted.reverse()
        return res.json({listFormatted: listFormatted, status: 200, valuePurchases: valorCompras});
        
    } catch(err) {
        console.error('Erro ao listar compras extras:', err);
        return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
    }
}

const deleteExtraPurchase = async (req, res)=>{
    try{
        console.log(req.body)
        const userMoment = getUserMoment(req); 

        setTimeout(async () => {
            await ExtraPurchasesUser.destroy({
                where: { id: req.body.id, userId: userMoment }
            });
              
            const saldoDevedor = await ExtraPurchasesUser.findAll({
                where: { userId: userMoment },
                attributes: [[sequelize.fn('SUM', sequelize.col('purchaseValue')), 'totalValue']]
            });

            return res.status(200).json({message: 'Compra deletada com sucesso', totalDevedorMesAtual: saldoDevedor[0].dataValues.totalValue || 0})
        }, 300);
    }catch(err){
        return res.status(500).json({message: 'Erro interno do servidor', error: err})
    }

}

const getPruchaseById =  async (req, res) =>{
    const {id} = req.params

    try{
        const purchase = await ExtraPurchasesUser.findAll({
            where: { id: id },
            attributes: { exclude: ['userId'] } 
          });

        if(!!purchase){

            return res.status(200).json(purchase)
        }else{
            return res.status(404).json({message: 'Nenhuma compra encontrada'}) 
        }
    }catch (err){
        return res.status(500).json({message: 'Erro interno do servidor', error: err})
    }
}

module.exports = {
    registerExtraPurchase,listExtraPurchase, alterExtraPurchase, deleteExtraPurchase, getPruchaseById
}