const { CostStatus } = require("../../constants/status");
const { CostType } = require("../../constants/type");
const Cost = require("../../models").Cost;

class CostOtherService {
    constructor() {}

    async createCost(data) {
        try {
            let timerTime = new Date(data.year, data.month - 1, 1);
            let bData = {
                name: data.name,
                referenceId: data.centerId || 0,
                type: data.type,
                status: CostStatus.Pending,
                totalMoney: data.totalMoney,
                forMonth: data.month,
                forYear: data.year,
                forUserId: 1,
                debtMoney: data.totalMoney,
                paidMoney: 0,
                otherType: data.otherType,
                timerTime: timerTime
            }
            await Cost.create(bData);

            return;
        }
        catch (err) {
            throw err;
        }
    }

    async createBonusCost(data) {
        try {
            let timerTime = new Date(data.year, data.month - 1, 1);
            let bData = {
                name: data.name || "Hoá đơn lương thưởng",
                referenceId: data.teacherId || 0,
                type: CostType.Bonus,
                status: CostStatus.Pending,
                totalMoney: data.totalMoney,
                forMonth: data.month,
                forYear: data.year,
                forUserId: 1,
                debtMoney: data.totalMoney,
                paidMoney: 0,
                otherType: data.otherType || null,
                timerTime: timerTime
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