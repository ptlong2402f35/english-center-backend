const { Op, where } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const { UserRole } = require("../constants/roles");
const { NotEnoughPermission, InputInfoEmpty, CostNotFound } = require("../constants/message");
const { TransactionService } = require("../services/transaction/transactionService");
const { CostStatus } = require("../constants/status");
const { CostType } = require("../constants/type");
const { TransactionHandler } = require("../services/transaction/transactionHandler");
const Transaction = require("../models").Transaction;
const Student = require("../models").Student;
const User = require("../models").User;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;
const Cost = require("../models").Cost;
const ParentStudent = require("../models").ParentStudent;

class TransactionController {
    getTransactions = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let forUserId = req.query.forUserId ? parseInt(req.query.forUserId) : null;

            let conds = [];
            if(forUserId) {
                conds.push({forUserId: forUserId});
            }

            let data = await Transaction.paginate(
                {
                    page: page,
                    perPage: perPage,
                    where: {
                        [Op.and]: conds
                    },
                    order: [["id", "desc"]],
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "role"],
                            include: [
                                {
                                    model: Student,
                                    as: "student",
                                    attributes: ["id", "name"]
                                },
                                {
                                    model: Teacher,
                                    as: "teacher",
                                    attributes: ["id", "name"]
                                },
                                {
                                    model: Parent,
                                    as: "parent",
                                    attributes: ["id", "name"]
                                }
                            ]
                        },
                        {
                            model: Cost,
                            as: "cost"
                        }
                    ]
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

    getMyTransactions = async (req, res, next) => {
        try {
            let user = req.user;
            if([UserRole.Student, UserRole.Teacher].includes(user.role)) {
                let transactions = await Transaction.findAll(
                    {
                        where: {
                            forUserId: user.userId
                        },
                        order: [["id", "desc"]]
                    }
                );

                return res.status(200).json(transactions);
            }
            if(user.role === UserRole.Parent) {
                let parent =  await Parent.findOne(
                    {
                        where: {
                            userId: user.userId
                        },
                        include: [
                            {
                                model: Student,
                                as: "child"
                            }
                        ]
                    }
                );

                let studentUserIds = (parent?.child || []).map(item => item.userId).filter(val => val);

                let transactions = await Transaction.findAll(
                    {
                        where: {
                            forUserId: {
                                [Op.in]: studentUserIds
                            }
                        },
                        order: [["id", "desc"]]
                    }
                );

                return res.status(200).json(transactions);
            }
            throw NotEnoughPermission;
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateTransaction = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.costId || !data) throw InputInfoEmpty;
            let cost = await Cost.findByPk(data.costId);
            if(!cost) throw CostNotFound;
            if(cost.status === CostStatus.Done) return res.status(403).json({message: "Hóa đơn này đã thanh toán"}); 

            await new TransactionService().createTransaction(data, data.costId, {isAdmin: true});

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateTransaction = async (req, res, next) => {
        try {
            let transactionId = req.params.id ? parseInt(req.params.id) : null;
            if(!transactionId) throw InputInfoEmpty;
            let data = req.body;

            let transaction = await Transaction.findByPk(transactionId);
            if(!transaction) return res.status(403).json({message: "Giao dịch không tồn tại"});

            await new TransactionService().updateTransactions(data, transaction);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminDeleteTransaction = async (req, res, next) => {
        try {
            let transactionId = req.params.id ? parseInt(req.params.id) : null;
            if(!transactionId) throw InputInfoEmpty;

            let transaction = await Transaction.findByPk(transactionId);
            if(!transaction) return res.status(403).json({message: "Giao dịch không tồn tại"});

            let cost = await new TransactionService().deleteTransaction(transaction);

            await new TransactionHandler().onDeleteTransactionHandler(cost);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    paymentSuccess = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data) throw InputInfoEmpty;
            let cost = await Cost.findByPk(data.costId);
            if(!cost) throw CostNotFound;
            if(cost.status === CostStatus.Done) return res.status(403).json({message: "Hóa đơn này đã thanh toán"}); 
            await new TransactionService().createTransaction(data, data.costId);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new TransactionController();