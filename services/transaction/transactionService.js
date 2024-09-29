const { InputInfoEmpty, CostNotFound, TotalMoneyIsOver } = require("../../constants/message");
const { CostStatus } = require("../../constants/status");
const { CostType } = require("../../constants/type");
const { sequelize } = require("../../models");

const Transaction = require("../../models").Transaction;
const Cost = require("../../models").Cost;
const User = require("../../models").User;
const Teacher = require("../../models").Teacher;

class TransactionService {
    constructor() {}

    async createTransaction(data, costId, {isAdmin} = {}) {
        try {
            if(!costId) throw InputInfoEmpty;
            let cost = await this.prepare(costId);
            if(!cost) throw CostNotFound;
            let targetId = 0;
            if(cost.type === CostType.StudentFee) {
                targetId = cost.user.id;
            }
            if(cost.type === CostType.TeacherSalary) {
                let teacherId = cost.referenceId;
                let teacher = await Teacher.findByPk(teacherId);
                if(!teacher) return res.status(403).json({message: "Giáo viên không tồn tại"});
                targetId = teacher.userId;
            }
            let transaction = await sequelize.transaction();
            try {
                let trans = await Transaction.create(
                    {
                        forUserId: targetId,
                        createdByUserId: isAdmin ? 1 : data.createdByUserId,
                        content: `Giao dịch thanh toán hóa đơn ${costId}`,
                        totalMoney: data.totalMoney,
                        costId: costId,
                        costType: cost.type
                    },
                    {
                        transaction: transaction
                    }
                );

                await this.updateCost(cost, trans, transaction);

                await transaction.commit();
            }
            catch (err1) {
                await transaction.rollback();
                throw err1;
            }
            
        }
        catch (err) {
            throw err;
        }
    }

    async updateCost(cost, trans, transaction) {
        try {
            if( cost.debtMoney && (cost.debtMoney < trans.totalMoney)) throw TotalMoneyIsOver;
            let debt = cost.debtMoney - trans.totalMoney;
            let paid = cost.paidMoney + trans.totalMoney;
            let status = debt === 0 ? CostStatus.Done : CostStatus.Debt;
            let paidAt = status === CostStatus.Done ? new Date() : null;

            await cost.update(
                {
                    debtMoney: debt,
                    paidMoney: paid,
                    status: status,
                    paidAt: paidAt
                },
                {
                    transaction: transaction
                }
            );
        }
        catch (err) {
            throw err;
        }
    }

    async prepare(costId) {
        try {
            let cost = await Cost.findByPk(
                costId,
                {
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "role"]
                        }
                    ]
                }
            );
            return cost;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    TransactionService
}