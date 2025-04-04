const { Op } = require("sequelize");
const { UserNotFound, InputInfoEmpty, ExistedEmail, TeacherNotFound, TeacherNotActive, ClassStatusInvalid } = require("../constants/message");
const { AuthService } = require("../services/auth/authService");
const { ErrorService } = require("../services/errorService");
const { TeacherQuerier } = require("../services/teacher/teacherQuerier");
const { TeacherUpdateService } = require("../services/teacher/teacherUpdateService");
const { UserRole } = require("../constants/roles");
const { ClassStatus } = require("../constants/status");
const { AttendanceService } = require("../services/attendance/attendanceService");
const { TeacherService } = require("../services/teacher/teacherService");
const { UserService } = require("../services/user/userService");
const { sequelize } = require("../models");
const { DataMasking } = require("../services/dataMasking");
const { AesService } = require("../services/security/AesService");
const Teacher = require("../models").Teacher;
const TeacherClass = require("../models").TeacherClass;
const Class = require("../models").Class;
const Attendance = require("../models").Attendance;

class TeacherController {
    getTeachers = async (req, res, next) => {
        try {
            const teacherQuerier = new TeacherQuerier();
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let name = req.query.name || null;
            let phone = req.query.phone || null;
            let email = req.query.email || null;
            let level = req.query.level || null;
            let active = req.query.active ? (req.query.active?.trim() === "true" ? true : false) : null;

            let includeClass = req.query.includeClass || null;

            let conds = teacherQuerier.buildWhere({name, phone, email, level, active});
            let attributes = teacherQuerier.buildAttributes({});
            let include = teacherQuerier.buildInclude({
                includeClass: true,
                includeUser: true
            });
            let orderBy = teacherQuerier.buildSort({});

            let data = await Teacher.paginate({
                page: page,
                paginate: perPage,
                where: {
                    [Op.and]: conds
                },
                attributes: attributes,
                include: include,
                order: orderBy
            });
            let dataMasking = new DataMasking();
            for(let item of data.docs) {
                await new UserService().attachDecodeField(item);
                await new UserService().attachDecodeField(item.user);
                await new UserService().removeEncodeField(item);
                await new UserService().removeEncodeField(item.user);

                let hidePhone = dataMasking.process(item.phone);
                let hideEmail = dataMasking.process(item.email);
                item.setDataValue("phone", hidePhone);
                item.setDataValue("email", hideEmail);

            }

            data.currentPage = page;

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getTeacherDetail = async (req, res, next) => {
        try {
            const teacherQuerier = new TeacherQuerier();
            let teacherId = req.params.id ? parseInt(req.params.id) : null;
            if(!teacherId) throw InputInfoEmpty;

            let attributes = teacherQuerier.buildAttributes({});
            let include = teacherQuerier.buildInclude({
                includeClass: true,
                includeUser: true
            });

            let data = await Teacher.findByPk(teacherId,
                {
                    include,
                    attributes
                }
            );
            if(!data) throw ClassNotFound;
            await new UserService().attachDecodeField(data);
            await new UserService().attachDecodeField(data.user);
            await new UserService().removeEncodeField(data);
            await new UserService().removeEncodeField(data.user);
            
            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    //self teacher info
    getMyDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            let teacher = await Teacher.findOne({
                where: {
                    userId: userId
                }
            });
            if(!teacher) throw UserNotFound;

            return res.status(200).json(await new AesService().getTransferResponse(teacher));
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
            let teacher = await Teacher.findOne({
                where: {
                    userId: userId
                }
            });
            if(!teacher) throw UserNotFound;
            await new TeacherUpdateService().updateDetail(data, teacher.id);

            return res.status(200).json({message: "Thành Công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateTeacherDetail = async (req, res, next) => {
        try {
            let teacherId = req.params.id ? parseInt(req.params.id) : null;
            if(!teacherId) throw UserNotFound;
            let data = req.body;
            let teacher = await Teacher.findOne({
                where: {
                    id: teacherId
                }
            });
            if(!teacher) throw UserNotFound;
            await new TeacherUpdateService().updateDetail(data, teacher.id, {forAdmin: true});

            return res.status(200).json({message: "Thành Công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateTeacher = async (req, res, next) => {
        try {
            let data = req.body;
            let {userName, password} = await new UserService().autoGenerateUserAccount(UserRole.Teacher);
            if(!userName || !password) throw InputInfoEmpty;
            if(await new AuthService().checkUserNameExist(userName)) throw ExistedEmail;

            await new AuthService().handleCustomerSignup(
                {
                    ...data,
                    userName,
                    password,
                    role: UserRole.Teacher
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

    adminAssignTeacherToClass = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.teacherId || !data.classId || !data.salary) throw InputInfoEmpty;

            let teacher = await Teacher.findByPk(data.teacherId);
            if(!teacher.active) throw TeacherNotActive;
            let curClass = await Class.findByPk(data.classId);
            if([ClassStatus.Disable, ClassStatus.Finish].includes(curClass.status)) throw ClassStatusInvalid;

            await TeacherClass.create(
                {
                    ...data
                }
            );

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getTeachedSessionInTime = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let forMonth =req.query.forMonth ? parseInt(req.query.forMonth) : null;
            let forYear =req.query.forYear ? parseInt(req.query.forYear) : null;
            if(!forMonth || !forYear) throw InputInfoEmpty;
            if(req.user.role != UserRole.Teacher && req.user.role != UserRole.Admin) {
                return res.status(403).json({message: "Chức năng chỉ dành cho giáo viên"});
            }
            let teacher = await Teacher.findOne({
                where: {userId: userId},
            });
            if(!teacher) return res.status(403).json({message: "Giáo viên không tồn tại"});

            let {classIds, attendances} = await new AttendanceService().getTeacherAttendanceDependOnTime(teacher.id, forMonth, forYear);
            let classes = await Class.findAll({
                where: {
                    id: {
                        [Op.in]: classIds
                    }
                }
            });
            await new TeacherService().attachTeacherSalary(classes, teacher.id);
            await new AttendanceService().groupAttendanceByClass(attendances, classes);

            return res.status(200).json(await new AesService().getTransferResponse(classes));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateTeacherToClass = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.teacherId || !data.classId || !data.salary) throw InputInfoEmpty;

            let teacher = await Teacher.findByPk(data.teacherId);
            if(!teacher.active) throw TeacherNotActive;
            let curClass = await Class.findByPk(data.classId);
            if([ClassStatus.Disable, ClassStatus.Finish].includes(curClass.status)) throw ClassStatusInvalid;
            let transaction = await sequelize.transaction();
            try {
                await TeacherClass.destroy(
                    {
                        where: {
                            classId: data.classId
                        },
                        transaction
                    }
                )

                await TeacherClass.create(
                    {
                        ...data
                    },
                    {
                        transaction
                    }
                );

                await transaction.commit();
            }
            catch (err1) {
                await transaction.rollback();
                throw err1;
            }

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new TeacherController();