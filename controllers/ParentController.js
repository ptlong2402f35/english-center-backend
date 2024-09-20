const { Op, where } = require("sequelize");
const { UserNotFound, ParentNotFound, NotEnoughPermission, StudentNotFound, InputInfoEmpty, ExistedEmail } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { ErrorService } = require("../services/errorService");
const { ParentStudentService } = require("../services/parentStudentService/parentStudentService");
const { StudentUpdateService } = require("../services/student/studentUpdateService");
const { StudentQuerier } = require("../services/student/studentQuerier");
const { ParentQuerier } = require("../services/parent/parentQuerier");
const { AuthService } = require("../services/auth/authService");
const { parentUpdateService } = require("../services/parent/parentUpdateService");

const User = require("../models").User;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const ParentStudent = require("../models").ParentStudent;

class ParentController {
    getMyDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            let parent = await Parent.findOne({
                where: {
                    userId: userId
                }
            });
            if(!parent) throw UserNotFound;

            return res.status(200).json(parent);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateMyDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            let data = req.body;
            let parent = await Parent.findOne({
                where: {
                    userId: userId
                }
            });
            if(!parent) throw UserNotFound;
            //update info
            await new StudentUpdateService().updateStudentDetail(data, parent.id);

            return res.status(200).json({message: "Thành Công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    studentGetParentConennected = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            if(req.user.role != UserRole.Student) throw NotEnoughPermission;
            let student = await Student.findOne({
                where: {
                    userId: userId
                },
                include: [
                    {
                        model: Parent,
                        as: "parents",
                    }
                ]
            });
            if(!student) throw StudentNotFound;
            // let connect = await ParentStudent.findAll({
            //     where: {
            //         parentId: parent.id
            //     }
            // });
            // let students = await Student.findAll({
            //     where: {
            //         id: {
            //             [Op.in]: connect.map(item => item.studentId).filter(val => val) || []
            //         }
            //     }
            // });

            return res.status(200).json(student.parents);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
    
    adminGetParents = async (req, res, next) => {
        try {
            const parentQuerier = new ParentQuerier();
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let name = req.query.name || null;
            let phone = req.query.phone || null;
            let email = req.query.email || null;
            let active = req.query.active ? (req.query.active?.trim() === "true" ? true : false) : null;

            let conds = parentQuerier.buildWhere({name, phone, email, active});
            let attributes = parentQuerier.buildAttributes({});
            let include = parentQuerier.buildInclude({includeStudent: true});
            let orderBy = parentQuerier.buildSort({});

            let data = await Parent.paginate({
                page: page,
                paginate: perPage,
                where: {
                    [Op.and]: conds
                },
                attributes: attributes,
                include: include,
                order: orderBy
            });

            data.currentPage = page;

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetParentDetail = async (req, res, next) => {
        try {
            let parentId = req.params.id ? parseInt(req.params.id) : null;
            if(!parentId) throw ParentNotFound;
            let include = new ParentQuerier().buildInclude({includeStudent: true});
            let parent = await Parent.findByPk(
                parentId,
                {
                    include
                }
            );
            if(!parent) throw ParentNotFound;

            return res.status(200).json(parent);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateParent = async (req, res, next) => {
        try {
            let data = req.body;
            const authSerivce = new AuthService();
            if(!data.userName || !data.password) throw InputInfoEmpty;

            if(await authSerivce.checkUserNameExist(data.userName)) throw ExistedEmail;
            let builtData = await new StudentUpdateService().build(data, {forAdmin: true});
            
            await authSerivce.handleCustomerSignup(
                {
                    userName: data.userName,
                    password: data.password,
                    ...builtData,
                    role: UserRole.Parent
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

    adminUpdateParentDetail = async (req, res, next) => {
        try {
            let parentId = req.params.id ? parseInt(req.params.id) : null;
            if(!parentId) throw UserNotFound;
            let data = req.body;
            await new parentUpdateService().updateParentDetail(data, parentId, {forAdmin: true});

            return res.status(200).json({message: "Thành Công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminDeactiveParent = async (req, res, next) => {
        try {
            let parentId = req.params.id ? parseInt(req.params.id) : null;
            if(!parentId) throw ParentNotFound;
            let active = req.query.active ? (req.query.active?.trim() === "true" ? true : false) : null;
            if(!active && active != false) throw InputInfoEmpty;

            await Parent.update(
                {
                    active: active,
                    updatedAt: new Date()
                },
                {
                    where: {
                        id: parentId
                    }
                }
            );

            return res.status(200).json({message: "Thành Công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new ParentController();