const { CostStatus } = require("../../constants/status");
const { CostType } = require("../../constants/type");
const Cost = require("../../models").Cost;

class CostOtherService {
    constructor() {}

    async createCost(data) {
        try {
            let bData = {
                referenceId: 0,
                type: data.type,
                status: CostStatus.Pending,
                totalMoney: data.totalMoney,
                forMonth: data.month,
                forYear: data.year,
                forUserId: 1,
                debtMoney: 0,
                paidMoney: 0,
                otherType: data.otherType
            }
            await Cost.create(bData);

            return;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    CostOtherService
}