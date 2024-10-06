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
const { CostService } = require("../services/cost/costService");
const Transaction = require("../models").Transaction;
const Cost = require("../models").Cost;
const User = require("../models").User;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;
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
            let multipleType = req.query.multipleType ? req.query.multipleType?.split(";").map(item => parseInt(item)).filter(val => val) : null;

            let conds = [];
            if(forUserId) {
                conds.push({forUserId: forUserId});
            }
            if(type) {
                conds.push({type: type});
            }
            if(multipleType) {
                conds.push(
                    {
                        type: {
                            [Op.in]: multipleType
                        }
                    }
                );
            }
            if(referenceId) {
                conds.push({referenceId: referenceId});
            }
            if(fromDate) {
                conds.push({
                    timerTime: {
                        [Op.gte]: fromDate
                    }
                });
            }
            if(toDate) {
                conds.push({
                    timerTime: {
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
                    include: [
                        {
                            model: Transaction,
                            as: "transactions"
                        }
                    ],
                    order: [["id", "desc"]]
                }
            );

            for( let item of data.docs) {
                await new CostService().attachExtendInfoToCost(item);
                await new CostService().attachCenterInfo(item);
                await new CostService().attachTeacherInfo(item);
            }

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
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let data = await Cost.findByPk(id);
            if(!data) return res.status(403).json({message: "Hóa đơn không tồn tại"});

            await new CostService().attachExtendInfoToCost(data);
            await new CostService().attachCenterInfo(data);

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentGetCosts = async (req, res, next) => {
        try {
            let user = req.user;
            if(user.role != UserRole.Parent) return res.status(403).json({message: "Chức năng chỉ dành cho phụ huynh"});
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
                    timerTime: {
                        [Op.gte]: fromDate
                    }
                });
            }
            if(toDate) {
                conds.push({
                    timerTime: {
                        [Op.lte]: toDate
                    }
                });
            }

            let parent = await Parent.findOne({
                where: {
                    userId: user.userId
                },
                include: [
                    {
                        model: Student,
                        as: "childs"
                    }
                ]
            });
            if(!parent) return res.status(403).json({message: "Phụ huynh không tồn tại"});
            let childUserIds = (parent?.childs || [])?.map(item => item.userId).filter(val => val);

            let data = await Cost.paginate(
                {
                    page: page,
                    paginate: perPage,
                    where: {
                        [Op.and]: [
                            ...conds,
                            {
                                forUserId: {
                                    [Op.in]: childUserIds
                                }
                            },
                            {
                                type: CostType.StudentFee
                            }
                        ]
                    },
                    include: [
                        {
                            model: Transaction,
                            as: "transactions"
                        },
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "role"],
                            include: [
                                {
                                    model: Student,
                                    as: "student"
                                }
                            ]
                        }
                    ],
                    order: [["id", "desc"]]
                }
            );

            for( let item of data.docs) {
                await new CostService().attachExtendInfoToCost(item);
            }

            data.currentPage = page;
            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    teacherGetCosts = async (req, res, next) => {
        try {
            let user = req.user;
            if(user.role != UserRole.Teacher) return res.status(403).json({message: "Chức năng chỉ dành cho giáo viên"});
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
                    timerTime: {
                        [Op.gte]: fromDate
                    }
                });
            }
            if(toDate) {
                conds.push({
                    timerTime: {
                        [Op.lte]: toDate
                    }
                });
            }

            let teacher = await Teacher.findOne({
                where: {
                    userId: user.userId
                }
            })

            let data = await Cost.paginate(
                {
                    page: page,
                    paginate: perPage,
                    where: {
                        [Op.and]: [
                            ...conds,
                            {
                                referenceId: teacher.id
                            },
                            {
                                type: {
                                    [Op.in]: [CostType.TeacherSalary, CostType.Bonus]
                                }
                            }
                        ]
                    },
                    include: [
                        {
                            model: Transaction,
                            as: "transactions"
                        }
                    ],
                    order: [["id", "desc"]]
                }
            );

            for( let item of data.docs) {
                await new CostService().attachExtendInfoToCost(item);
            }

            data.currentPage = page;
            return res.status(200).json(data);
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

            let costs = await Cost.findOne({
                where: {
                    forMonth: data.month,
                    forYear: data.year,
                    referenceId: data.classId,
                    type: CostType.StudentFee
                }
            });
            if(costs) return res.status(422).json({message: "Hóa đơn này đã tồn tại"});

            let {userIds} = await new CostCreateService().createCostByClass(data.classId, data.month, data.year, data.name);

            new CostService().createNewCostNoti(userIds, data.month, data.year);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createClassCostForSingleStudent = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.classId || !data.month || !data.year || !data.name || !data.studentId) throw InputInfoEmpty;

            let student = await Student.findByPk(data.studentId);
            if(!student) return res.status(403).json({message: "Học sinh này không tồn tại"});

            let costs = await Cost.findOne({
                where: {
                    forMonth: data.month,
                    forYear: data.year,
                    referenceId: data.classId,
                    forUserId: student.userId,
                    type: CostType.StudentFee
                }
            });
            if(costs) return res.status(422).json({message: "Hóa đơn này đã tồn tại"});
            let {userIds} = await new CostCreateService().createCostToSingleStudent(data.classId, student, data.month, data.year, data.name);

            new CostService().createNewCostNoti(userIds, data.month, data.year);

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
            let costs = await Cost.findOne({
                where: {
                    name: data.name,
                    forMonth: data.month,
                    forYear: data.year,
                    referenceId: data.teacherId,
                    type: CostType.TeacherSalary
                }
            });
            if(costs) return res.status(422).json({message: "Hóa đơn này đã tồn tại"});
            let {create} = await new CostTeacherCreateService().createCost(data.teacherId, data.month, data.year, data.name);
            if(!create) {
                return res.status(403).json({message: "Giáo viên chưa dạy buổi học nào"});
            }
            new CostService().onCreateNotiTransToTeacher(data.teacherId, data.month, data.year);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createBonusCost = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.month || !data.year || !data.totalMoney || !data.teacherId) throw InputInfoEmpty;
            let teacher = await Teacher.findByPk(data.teacherId);
            if(!teacher) return res.status(403).json({message: "giáo viên không tồn tại"});
            await new CostOtherService().createBonusCost(data);

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
            if(!cost) return res.status(403).json({message: "Hóa đơn không tồn tại"})
            if(![CostType.ElecFee, CostType.OtherFee, CostType.WaterFee].includes(cost.type)) return res.status(403).json({message: "Loại hóa đơn không hợp lệ"});
            if(!cost) return res.status(422).json({message: "Hóa đơn không tồn tai"});
            await cost.update(
                {
                    ...data,
                    referenceId: data.centerId
                }
            );

            return res.status(200).json({message: "Thành công"});
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
            console.log("cost", cost);
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
                    let targetId = 0;
                    if(cost.type === CostType.StudentFee) {
                        targetId = cost.user.id;
                    }
                    if(cost.type === CostType.TeacherSalary || cost.type === CostType.Bonus) {
                        let teacherId = cost.referenceId;
                        let teacher = await Teacher.findByPk(teacherId);
                        if(!teacher) return res.status(403).json({message: "Giáo viên không tồn tại"});
                        targetId = teacher.userId;
                    }

                    let existTrans = await Transaction.findOne({
                        where: {
                            forUserId: targetId,
                            createdByUserId: 1,
                            totalMoney: cost.totalMoney,
                            costId: id,
                            costType: cost.type
                        },
                        logging: true
                    });

                    if(!existTrans) {
                        let trans = await Transaction.create(
                            {
                                forUserId: targetId,
                                createdByUserId: 1,
                                content: `Giao dịch thanh toán hóa đơn ${cost.name || id}`,
                                totalMoney: cost.totalMoney,
                                costId: id,
                                costType: cost.type,
                                timerTime: new Date()
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
                        paidAt: null,
                    }
                );
                let targetId = 0;
                if(cost.type === CostType.StudentFee) {
                    targetId = cost.user.id;
                }
                if(cost.type === CostType.TeacherSalary || cost.type === CostType.Bonus) {
                    let teacherId = cost.referenceId;
                    let teacher = await Teacher.findByPk(teacherId);
                    if(!teacher) return res.status(403).json({message: "Giáo viên không tồn tại"});
                    targetId = teacher.userId;
                }
                await Transaction.destroy({
                    where: {
                        forUserId: targetId,
                        createdByUserId: 1,
                        totalMoney: cost.totalMoney,
                        costId: id,
                        costType: cost.type
                    }
                });
                new CostService().onCreateNotiTransToUser(cost);
            }

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminDeleteCost = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            let cost = await Cost.findByPk(
                id,
                {
                        include: [
                        {
                            model: Transaction,
                            as: "transactions"
                        }
                    ]
                }
            );
            if(!cost) return res.status(403).json({message: "Hóa đơn không tồn tại"});
            if(cost.transactions?.length) return res.status(403).json({message: "Không thể xóa hóa đơn đã có giao dịch"});

            await Cost.destroy({
                where: {
                    id: id
                }
            });

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