const {generateId, isNullorEmpty, getUserMoment} = require('../comum/comumFunctions');
const { FixedPruchase, sequelize } = require('../db/config/database'); 
const moment = require('moment');

const registerFixedPurchase = async (req, res) => {
    const fixedPurchases = req.body  
    const userMoment = getUserMoment(req); 

    //verifico se o formato do body é válido
    if(Array.isArray(fixedPurchases) && fixedPurchases.every(item => typeof item === "object" && item == null)){
        return res.status(400).json({message: 'Dados no formato inválido'})
    }
    
    try{
        fixedPurchases.forEach(async (element) => {
            const idPurchase = generateId()
              
            if(isNullorEmpty(element.purchaseName) || isNullorEmpty(element.purchaseDate) ||
            isNullorEmpty(element.purchaseTypePayment) ||isNullorEmpty(element.bankName) ||isNullorEmpty(element.purchaseValue) ||
            isNullorEmpty(element.monthPayment)){
                return res.status(400).json({message: 'Campos obrigatórios não preenchidos'})
            }

            await FixedPruchase.create({
                name: element.name,
                value: element.value,
                paymentMonth: element.paymentMonth,
                dayMaxPayment:  moment.utc(element.dayMaxPayment).format('YYYY-MM-DD'),
                id: idPurchase,
                userId: userMoment
            });
        });
        
        return res.status(200).json({message: 'Despesa(s) registrada(s) com sucesso', status: 200})
     
    }catch (err){
        return res.status(500).json({message: 'Erro interno do servidor', error: err})
    }
}