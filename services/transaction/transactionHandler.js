const { CostStatus } = require("../../constants/status");

const Cost = require("../../models").Cost;
const Transaction = require("../../models").Transaction;

class TransactionHandler {
    constructor() {}

    async onDeleteTransactionHandler(cost) {
        try {
            if(!cost || !cost.id) return;
            let transactions = await Transaction.findAll({
                where: {
                    costId: cost.id
                }
            });
            if(!transactions || !transactions.length) {
                await cost.update({
                    debtMoney: cost.totalMoney,
                    paidMoney: 0,
                    status: CostStatus.Pending,
                    paidAt: null
                });
            }
            return;
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    TransactionHandler
}