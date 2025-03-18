const { Op, where } = require("sequelize");
const { UserNotFound, ParentNotFound, NotEnoughPermission, StudentNotFound, ExistedEmail, InputInfoEmpty } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { ErrorService } = require("../services/errorService");
const { ParentStudentService } = require("../services/parentStudentService/parentStudentService");
const { StudentUpdateService } = require("../services/student/studentUpdateService");
const { StudentQuerier } = require("../services/student/studentQuerier");
const { AuthService } = require("../services/auth/authService");
const { StudentService } = require("../services/student/studentService");
const { UserService } = require("../services/user/userService");
const { AesService } = require("../services/security/AesService");

const User = require("../models").User;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Class = require("../models").Class;
const ParentStudent = require("../models").ParentStudent;
const StudentClass = require("../models").StudentClass;

class StudentController {
    getMyDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            let student = await Student.findOne({
                where: {
                    userId: userId
                }
            });
            if(!student) throw UserNotFound;

            return res.status(200).json(await new AesService().getTransferResponse(student));
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
            let student = await Student.findOne({
                where: {
                    userId: userId
                }
            });
            if(!student) throw UserNotFound;
            await new StudentUpdateService().updateStudentDetail(data, student.id);

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentGetStudentConennected = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            if(req.user.role != UserRole.Parent) throw NotEnoughPermission;
            let parent = await Parent.findOne({
                where: {
                    userId: userId
                },
                include: [
                    {
                        model: Student,
                        as: "childs",
                    }
                ]
            });
            if(!parent) throw ParentNotFound;
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

            return res.status(200).json(await new AesService().getTransferResponse(parent.childs || []));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentGetStudentDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            if(req.user.role != UserRole.Parent) throw NotEnoughPermission;
            let studentId = req.params.id;
            let parent = await Parent.findOne({
                where: {
                    userId: userId
                }
            });
            if(!parent) throw ParentNotFound;
            await new ParentStudentService().checkConnect(parent.id, studentId);

            let student = await Student.findOne({
                where: {
                    id: studentId
                }
            });
            if(!student) throw UserNotFound;

            return res.status(200).json(await new AesService().getTransferResponse(student));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
    
    adminGetStudents = async (req, res, next) => {
        try {
            const studentQuerier = new StudentQuerier();
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let name = req.query.name || null;
            let age = req.query.age || null;
            let active = req.query.active ? (req.query.active?.trim() === "true" ? true : false) : null;

            let conds = studentQuerier.buildWhere({name, age, active});
            let attributes = studentQuerier.buildAttributes({});
            let include = studentQuerier.buildInclude({includeParent: true, includeClass: true, includeUser: true});
            let orderBy = studentQuerier.buildSort({});

            let data = await Student.paginate({
                page: page,
                paginate: perPage,
                where: {
                    [Op.and]: conds
                },
                // attributes: attributes,
                include: include,
                order: orderBy
            });

            data.currentPage = page;

            for(let student of data.docs) {
                new StudentService().attachUnJoinClassCount(student.classes, student.id);
            }


            return res.status(200).json(await new AesService().getTransferResponse(data))
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateStudent = async (req, res, next) => {
        try {
            let data = req.body;
            const authSerivce = new AuthService();
            let {userName, password} = await new UserService().autoGenerateUserAccount(UserRole.Student);
            if(!userName || !password) throw InputInfoEmpty;

            if(await authSerivce.checkUserNameExist(userName)) throw ExistedEmail;

            let builtData = await new StudentUpdateService().build(data, {forAdmin: true});
            
            let resp = await authSerivce.handleCustomerSignup(
                {
                    userName: userName,
                    password: password,
                    ...builtData,
                    role: UserRole.Student
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

    adminGetStudentDetail = async (req, res, next) => {
        try {
            let studentId = req.params.id ? parseInt(req.params.id) : null;
            if(!studentId) throw StudentNotFound;
            let student = await Student.findByPk(studentId);
            if(!student) throw StudentNotFound;

            return res.status(200).json(await new AesService().getTransferResponse(student));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateStudentDetail = async (req, res, next) => {
        try {
            let studentId = req.params.id ? parseInt(req.params.id) : null;
            if(!studentId) throw UserNotFound;
            let data = req.body;
            await new StudentUpdateService().updateStudentDetail(data, studentId, {forAdmin: true});

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminDeactiveStudent = async (req, res, next) => {
        try {
            let studentId = req.params.id ? parseInt(req.params.id) : null;
            if(!studentId) throw UserNotFound;
            let active = req.body.active || null;
            if(!active && active != false) throw InputInfoEmpty;

            await Student.update(
                {
                    active: active,
                    updatedAt: new Date()
                },
                {
                    where: {
                        id: studentId
                    }
                }
            );

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateStudentReduceValue = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.classId || !data.studentId || (!data.reduceFee && data.reduceFee != 0 && !data.reducePercent && data.reducePercent !=0)) throw InputInfoEmpty;
            let student = await Student.findByPk(data.studentId);
            if(!student) return res.status(403).json({message: "Học sinh không tồn tại"});
            let classInfo = await Class.findByPk(data.classId);
            if(!classInfo) return res.status(403).json({message: "Lớp học không tồn tại"});

            let value = data.reduceFee || 0;
            let percent = data.reducePercent || 0;
            if(percent || percent === 0) {
                value = classInfo.fee * percent / 100;
                await StudentClass.update(
                    {
                        reducePercent: data.reducePercent,
                        reduceFee: value,
                        updatedAt: new Date()
                    },
                    {
                        where: {
                            studentId: data.studentId,
                            classId: data.classId
                        }
                    }
                );
                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
            }
            
            if(data.reduceFee || data.reduceFee === 0) {
                percent = data.reduceFee / classInfo.fee * 100;
                await StudentClass.update(
                    {
                        reducePercent: percent,
                        reduceFee: data.reduceFee,
                        updatedAt: new Date()
                    },
                    {
                        where: {
                            studentId: data.studentId,
                            classId: data.classId
                        }
                    }
                );
                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
            }

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new StudentController();