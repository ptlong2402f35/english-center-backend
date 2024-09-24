const { Op, where } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const { UserRole } = require("../constants/roles");
const { NotEnoughPermission, InputInfoEmpty, CostNotFound } = require("../constants/message");
const { CostCreateService } = require("../services/cost/costCreateService");
const { CostTeacherCreateService } = require("../services/cost/costTeacherCreateService");
const { CostOtherService } = require("../services/cost/costOtherService");
const { CostStatus } = require("../constants/status");
const { sequelize } = require("../models");
const { TransactionService } = require("../services/transaction/transactionService");
const { CostType } = require("../constants/type");
const Transaction = require("../models").Transaction;
const Cost = require("../models").Cost;
const User = require("../models").User;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const ParentStudent = require("../models").ParentStudent;

class CostController {
    getCosts = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let forUserId = req.query.forUserId ? parseInt(req.query.forUserId) : null;
            let type = req.query.type ? parseInt(req.query.type) : null;
            let referenceId = req.query.referenceId ? parseInt(req.query.referenceId) : null;
            let fromDate = req.query.fromDate || null;
            let toDate = req.query.toDate || null;

            let conds = [];
            if(forUserId) {
                conds.push({forUserId: forUserId});
            }
            if(type) {
                conds.push({type: type});
            }
            if(referenceId) {
                conds.push({referenceId: referenceId});
            }
            if(fromDate) {
                conds.push({
                    fromDate: {
                        [Op.gte]: fromDate
                    }
                });
            }
            if(toDate) {
                conds.push({
                    toDate: {
                        [Op.lte]: toDate
                    }
                });
            }

            let data = await Cost.paginate(
                {
                    page: page,
                    paginate: perPage,
                    where: {
                        [Op.and]: conds
                    },
                    order: [["id", "desc"]]
                }
            );

            data.currentPage = page;
            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getCostDetail = async (req, res, next) => {
        try {
            let user = req.user;
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let data = await Cost.findByPk(id);

            return data;
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createClassCost = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.classId || !data.month || !data.year || !data.name) throw InputInfoEmpty;

            await new CostCreateService().createCostByClass(data.classId, data.month, data.year, data.name);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createTeacherSalary = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.teacherId || !data.month || !data.year || !data.name) throw InputInfoEmpty;

            await new CostTeacherCreateService().createCost(data.teacherId, data.month, data.year, data.name);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createOtherCost = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.month || !data.year || !data.totalMoney || !data.type) throw InputInfoEmpty;
            if(![CostType.ElecFee, CostType.OtherFee, CostType.WaterFee].includes(data.type)) return res.status(403).json({message: "Loại hóa đơn không hợp lệ"});
            await new CostOtherService().createCost(data);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateCost = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;;
            if(!id) throw InputInfoEmpty;
            let data = req.body;

            let cost = await Cost.findByPk(
                id,
                {
                    include: [
                        {
                            model: User,
                            as: "user"
                        }
                    ]
                }
            );
            if(![CostType.ElecFee, CostType.OtherFee, CostType.WaterFee].includes(cost.type)) return res.status(403).json({message: "Loại hóa đơn không hợp lệ"});
            if(!cost) return res.status(422).json({message: "Hóa đơn không tồn tai"});
            await cost.update(
                {
                    ...data,
                }
            );

            let existTrans = await Transaction.findOne({
                where: {
                    forUserId: cost.user.id,
                    createdByUserId: 1,
                    totalMoney: cost.totalMoney,
                    costId: id,
                    costType: cost.type
                }
            });

            if(!existTrans) {
                let trans = await Transaction.create(
                    {
                        forUserId: cost.user.id,
                        createdByUserId: 1,
                        content: `Giao dịch thanh toán hóa đơn ${id}`,
                        totalMoney: cost.totalMoney,
                        costId: id,
                        costType: cost.type
                    }
                );
            }
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateCostStatus = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            let status = req.body.status;
            if(!id || !status) throw InputInfoEmpty;

            let cost = await Cost.findByPk(
                id,
                {
                    include: [
                        {
                            model: User,
                            as: "user"
                        }
                    ]
                }
            );
            if(!cost) throw CostNotFound;

            if(status === CostStatus.Done) {
                let transaction = await sequelize.transaction();
                try {
                    await cost.update(
                        {
                            status: status,
                            debtMoney: 0,
                            paidMoney: cost.totalMoney,
                            paidAt: new Date()
                        },
                        {
                            transaction: transaction
                        }
                    );

                    let existTrans = await Transaction.findOne({
                        where: {
                            forUserId: cost.user.id,
                            createdByUserId: 1,
                            totalMoney: cost.totalMoney,
                            costId: id,
                            costType: cost.type
                        }
                    });

                    if(!existTrans) {
                        let trans = await Transaction.create(
                            {
                                forUserId: cost.user.id,
                                createdByUserId: 1,
                                content: `Giao dịch thanh toán hóa đơn ${id}`,
                                totalMoney: cost.totalMoney,
                                costId: id,
                                costType: cost.type
                            },
                            {
                                transaction: transaction
                            }
                        );
                    }

                    await transaction.commit();
                }
                catch (err1) {
                    await transaction.rollback();
                    throw err1;
                }
            }
            if(status === CostStatus.Pending) {
                await cost.update(
                    {
                        status: status,
                        debtMoney: cost.totalMoney,
                        paidMoney: 0,
                    }
                );
            }

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new CostController();