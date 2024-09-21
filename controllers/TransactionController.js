const { Op, where } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const { UserRole } = require("../constants/roles");
const { NotEnoughPermission, InputInfoEmpty } = require("../constants/message");
const { TransactionService } = require("../services/transaction/transactionService");
const Transaction = require("../models").Transaction;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
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

            await new TransactionService().createTransaction(data, data.costId, {isAdmin: true});

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

            await new TransactionService().createTransaction(data, costId);

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