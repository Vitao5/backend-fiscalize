const { PluggyClient } = require('pluggy-sdk');
const { PluggyItem, BankTransaction, User } = require('../db/config/database');
const { generateId, getUserMoment } = require('../comum/comumFunctions');
require("dotenv").config();

const getPluggyClient = () => {
    return new PluggyClient({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    });
};

const listConnectors = async (req, res) => {
    try {
        const client = getPluggyClient();
        const connectorsResponse = await client.fetchConnectors({ sandbox: true });
        const results = connectorsResponse.results || connectorsResponse || [];
        return res.status(200).json({ connectors: results });
    } catch (err) {
        console.warn('Pluggy API fallback:', err.message);
        const defaultConnectors = [
            { id: 0, name: 'Pluggy Sandbox (Testes)', imageUrl: '', primaryColor: '#22c55e', isSandbox: true },
            { id: 201, name: 'Nubank', imageUrl: 'https://assets.pluggy.ai/connectors/nubank.svg', primaryColor: '#820AD1' },
            { id: 2, name: 'Itaú', imageUrl: 'https://assets.pluggy.ai/connectors/itau.svg', primaryColor: '#EC7000' },
            { id: 1, name: 'Bradesco', imageUrl: 'https://assets.pluggy.ai/connectors/bradesco.svg', primaryColor: '#CC092F' },
            { id: 3, name: 'Banco do Brasil', imageUrl: 'https://assets.pluggy.ai/connectors/bb.svg', primaryColor: '#FAF500' },
            { id: 4, name: 'Santander', imageUrl: 'https://assets.pluggy.ai/connectors/santander.svg', primaryColor: '#EA1D25' },
            { id: 5, name: 'Caixa Econômica', imageUrl: 'https://assets.pluggy.ai/connectors/caixa.svg', primaryColor: '#0066B3' },
            { id: 202, name: 'Banco Inter', imageUrl: 'https://assets.pluggy.ai/connectors/inter.svg', primaryColor: '#FF7A00' },
            { id: 204, name: 'C6 Bank', imageUrl: 'https://assets.pluggy.ai/connectors/c6.svg', primaryColor: '#242424' },
            { id: 203, name: 'BTG Pactual', imageUrl: 'https://assets.pluggy.ai/connectors/btg.svg', primaryColor: '#0B2240' },
            { id: 205, name: 'XP Investimentos', imageUrl: 'https://assets.pluggy.ai/connectors/xp.svg', primaryColor: '#000000' },
            { id: 206, name: 'PicPay', imageUrl: 'https://assets.pluggy.ai/connectors/picpay.svg', primaryColor: '#11C76F' },
            { id: 207, name: 'Mercado Pago', imageUrl: 'https://assets.pluggy.ai/connectors/mercadopago.svg', primaryColor: '#009EE3' },
        ];
        return res.status(200).json({ connectors: defaultConnectors });
    }
};

const createConnectToken = async (req, res) => {
    try {
        const client = getPluggyClient();
        const connectToken = await client.createConnectToken();
        return res.status(200).json({ accessToken: connectToken.accessToken });
    } catch (err) {
        console.error('Erro ao gerar connect token:', err);
        return res.status(500).json({ message: 'Erro ao gerar token Pluggy', error: err.message });
    }
};

const saveItem = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const { pluggyItemId, connectorName, connectorId } = req.body;

        if (!pluggyItemId) {
            return res.status(400).json({ message: 'pluggyItemId é obrigatório' });
        }

        const id = generateId();

        await PluggyItem.create({
            id,
            userId: userMoment,
            pluggyItemId,
            connectorName: connectorName || 'Instituição',
            connectorId: connectorId || 0,
            status: 'UPDATED'
        });

        return res.status(201).json({ message: 'Instituição conectada com sucesso', id });
    } catch (err) {
        console.error('Erro ao salvar item Pluggy:', err);
        return res.status(500).json({ message: 'Erro ao salvar conexão', error: err.message });
    }
};

const listItems = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const items = await PluggyItem.findAll({ where: { userId: userMoment } });
        return res.status(200).json({ items });
    } catch (err) {
        console.error('Erro ao listar itens Pluggy:', err);
        return res.status(500).json({ message: 'Erro ao listar instituições', error: err.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const { id } = req.params;

        const item = await PluggyItem.findOne({ where: { id, userId: userMoment } });
        if (!item) {
            return res.status(404).json({ message: 'Conexão não encontrada' });
        }

        try {
            const client = getPluggyClient();
            await client.deleteItem(item.pluggyItemId);
        } catch (pluggyErr) {
            console.warn('Aviso ao deletar item no Pluggy:', pluggyErr.message);
        }

        await PluggyItem.destroy({ where: { id } });
        return res.status(200).json({ message: 'Conexão removida com sucesso' });
    } catch (err) {
        console.error('Erro ao deletar item Pluggy:', err);
        return res.status(500).json({ message: 'Erro ao remover conexão', error: err.message });
    }
};

const getAccounts = async (req, res) => {
    try {
        const { itemId } = req.params;
        const client = getPluggyClient();
        const accounts = await client.fetchAccounts(itemId);
        return res.status(200).json(accounts);
    } catch (err) {
        console.error('Erro ao buscar contas:', err);
        return res.status(500).json({ message: 'Erro ao buscar contas', error: err.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const { accountId } = req.params;
        const client = getPluggyClient();
        const transactions = await client.fetchAllTransactions(accountId);
        return res.status(200).json({ results: transactions || [] });
    } catch (err) {
        console.error('Erro ao buscar transações:', err);
        return res.status(500).json({ message: 'Erro ao buscar transações', error: err.message });
    }
};

const importTransactions = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const { accountId, pluggyItemId } = req.body;

        const client = getPluggyClient();
        const transactions = await client.fetchAllTransactions(accountId);
        const txList = Array.isArray(transactions) ? transactions : (transactions?.results || []);

        let imported = 0;
        for (const tx of txList) {
            const existing = await BankTransaction.findOne({
                where: { pluggyAccountId: accountId, description: tx.description, date: tx.date, amount: tx.amount, userId: userMoment }
            });

            if (!existing) {
                await BankTransaction.create({
                    id: generateId(),
                    userId: userMoment,
                    pluggyItemId: pluggyItemId,
                    pluggyAccountId: accountId,
                    description: tx.description,
                    amount: tx.amount,
                    date: tx.date,
                    category: tx.category || null,
                    type: tx.type || null,
                    currencyCode: tx.currencyCode || 'BRL'
                });
                imported++;
            }
        }

        return res.status(200).json({ message: `${imported} transações importadas com sucesso`, total: txList.length, imported });
    } catch (err) {
        console.error('Erro ao importar transações:', err);
        return res.status(500).json({ message: 'Erro ao importar transações', error: err.message });
    }
};

const completeOnboarding = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        await User.update({ onboardingCompleted: true }, { where: { id: userMoment } });
        return res.status(200).json({ message: 'Onboarding concluído com sucesso' });
    } catch (err) {
        console.error('Erro ao completar onboarding:', err);
        return res.status(500).json({ message: 'Erro ao completar onboarding', error: err.message });
    }
};

// Verifica status do onboarding do usuário
const getOnboardingStatus = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const user = await User.findByPk(userMoment);
        const itemCount = await PluggyItem.count({ where: { userId: userMoment } });
        return res.status(200).json({
            onboardingCompleted: Boolean(user?.onboardingCompleted),
            itemCount
        });
    } catch (err) {
        console.error('Erro ao buscar status de onboarding:', err);
        return res.status(500).json({ message: 'Erro ao verificar status', error: err.message });
    }
};

const getDashboardData = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const items = await PluggyItem.findAll({ where: { userId: userMoment } });

        if (items.length === 0) {
            return res.status(200).json({
                saldoTotalContas: 0,
                totalFaturasCartao: 0,
                totalGastosMesPluggy: 0,
                contas: [],
                transacoes: [],
                itensConectados: []
            });
        }

        let saldoTotalContas = 0;
        let totalFaturasCartao = 0;
        const allAccounts = [];

        try {
            const client = getPluggyClient();

            for (const item of items) {
                try {
                    const accountsRes = await client.fetchAccounts(item.pluggyItemId);
                    const accounts = accountsRes.results || accountsRes || [];

                    for (const acc of accounts) {
                        const balance = parseFloat(acc.balance || 0);
                        const isCredit = acc.type === 'CREDIT' || acc.subtype === 'CREDIT_CARD';

                        if (isCredit) {
                            const creditBalance = acc.creditData?.balance !== undefined 
                                ? parseFloat(acc.creditData.balance) 
                                : Math.abs(balance);
                            totalFaturasCartao += creditBalance;
                        } else {
                            saldoTotalContas += balance;
                        }

                        allAccounts.push({
                            id: acc.id,
                            pluggyItemId: item.pluggyItemId,
                            connectorName: item.connectorName,
                            name: acc.name,
                            type: acc.type,
                            subtype: acc.subtype,
                            number: acc.number,
                            balance: balance,
                            currencyCode: acc.currencyCode || 'BRL',
                            creditData: acc.creditData || null
                        });

                        try {
                            const transactions = await client.fetchAllTransactions(acc.id);
                            const txList = Array.isArray(transactions) ? transactions : (transactions?.results || []);
                            for (const tx of txList.slice(0, 30)) {
                                const exists = await BankTransaction.findOne({
                                    where: { 
                                        userId: userMoment, 
                                        pluggyAccountId: acc.id, 
                                        description: tx.description, 
                                        date: tx.date, 
                                        amount: tx.amount 
                                    }
                                });

                                if (!exists) {
                                    await BankTransaction.create({
                                        id: generateId(),
                                        userId: userMoment,
                                        pluggyItemId: item.pluggyItemId,
                                        pluggyAccountId: acc.id,
                                        description: tx.description,
                                        amount: tx.amount,
                                        date: tx.date,
                                        category: tx.category || null,
                                        type: tx.type || (tx.amount < 0 ? 'DEBIT' : 'CREDIT'),
                                        currencyCode: tx.currencyCode || 'BRL'
                                    });
                                }
                            }
                        } catch (txErr) {
                            console.warn(`Aviso ao buscar transações da conta ${acc.id}:`, txErr.message);
                        }
                    }
                } catch (accErr) {
                    console.warn(`Aviso ao buscar contas do item ${item.pluggyItemId}:`, accErr.message);
                }
            }
        } catch (clientErr) {
            console.warn('Aviso no cliente Pluggy:', clientErr.message);
        }

        const transacoes = await BankTransaction.findAll({
            where: { userId: userMoment },
            order: [['date', 'DESC']],
            limit: 50
        });

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const totalGastosMesPluggy = transacoes.reduce((sum, tx) => {
            const txDate = new Date(tx.date);
            if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                if (tx.amount < 0 || tx.type === 'DEBIT') {
                    return sum + Math.abs(parseFloat(tx.amount || 0));
                }
            }
            return sum;
        }, 0);

        return res.status(200).json({
            saldoTotalContas,
            totalFaturasCartao,
            totalGastosMesPluggy,
            contas: allAccounts,
            transacoes: transacoes.map(t => ({
                id: t.id,
                description: t.description,
                amount: t.amount,
                date: t.date,
                category: t.category,
                type: t.type,
                pluggyItemId: t.pluggyItemId,
                connectorName: items.find(i => i.pluggyItemId === t.pluggyItemId)?.connectorName || 'Banco'
            })),
            itensConectados: items
        });
    } catch (err) {
        console.error('Erro ao buscar dados do dashboard Pluggy:', err);
        return res.status(500).json({ message: 'Erro ao consolidar dados bancários', error: err.message });
    }
};

// Sincroniza dados e força atualização dos itens no Pluggy
const syncData = async (req, res) => {
    try {
        const userMoment = getUserMoment(req);
        const items = await PluggyItem.findAll({ where: { userId: userMoment } });

        const client = getPluggyClient();
        let syncedCount = 0;

        for (const item of items) {
            try {
                await client.updateItem(item.pluggyItemId);
                syncedCount++;
            } catch (syncErr) {
                console.warn(`Aviso ao sincronizar item ${item.pluggyItemId}:`, syncErr.message);
            }
        }

        return res.status(200).json({ message: `${syncedCount} instituições sincronizadas com sucesso.` });
    } catch (err) {
        console.error('Erro ao sincronizar dados Pluggy:', err);
        return res.status(500).json({ message: 'Erro ao sincronizar dados', error: err.message });
    }
};

module.exports = {
    listConnectors,
    createConnectToken,
    saveItem,
    listItems,
    deleteItem,
    getAccounts,
    getTransactions,
    importTransactions,
    completeOnboarding,
    getOnboardingStatus,
    getDashboardData,
    syncData
};
