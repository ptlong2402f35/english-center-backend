const { Op } = require("sequelize");
const { InputInfoEmpty, ClassNotFound, UserNotFound, ParentNotFound, NotEnoughPermission, StudentNotFound } = require("../constants/message");
const { ClassCreateService } = require("../services/class/classCreateService");
const { ClassQuerier } = require("../services/class/classQuerier");
const { ClassRegisterService } = require("../services/class/classRegisterService");
const { classUpdateService } = require("../services/class/classUpdateService");
const { ErrorService } = require("../services/errorService");
const { ParentStudentService } = require("../services/parentStudentService/parentStudentService");
const { StudentQuerier } = require("../services/student/studentQuerier");
const { TeacherQuerier } = require("../services/teacher/teacherQuerier");
const { TimeHandle } = require("../utils/timeHandle");
const util = require("util");
const { UserRole } = require("../constants/roles");
const { TeacherService } = require("../services/teacher/teacherService");
const { ClassStatus } = require("../constants/status");
const { ClassHandler } = require("../services/class/classHandler");
const { sequelize } = require("../models");
const { CostType } = require("../constants/type");
const { UserService } = require("../services/user/userService");

const Class = require("../models").Class;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;
const StudentClass = require("../models").StudentClass;
const TeacherClass = require("../models").TeacherClass;
const Schedule = require("../models").Schedule;
const Attendance = require("../models").Attendance;
const Center = require("../models").Center;
const Cost = require("../models").Cost;
const ClassSchedule = require("../models").ClassSchedule;

class ClassController {
    getClasses = async (req, res, next) => {
        try {
            const classQuerier = new ClassQuerier();
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let forAge = req.query.forAge || null;
            let fromDate = req.query.fromDate || null;
            let toDate = req.query.toDate || null;
            let status = req.query.status ? parseInt(req.query.status) : null;
            let centerId = req.query.centerId || null;
            let code = req.query.code || null;
            let includeStudent = req.query.includeStudent?.trim() === "true" || null;
            let includeProgram = req.query.includeProgram?.trim() === "true" || null;
            let includeTeacher = req.query.includeTeacher?.trim() === "true" || null;
            let includeCenter = req.query.includeCenter?.trim() === "true" || null;
            let includeSchedule = req.query.includeSchedule?.trim() === "true" || null;
            let forAdmin = req.query.forAdmin?.trim() === "true" ? true : false;

            let conds = classQuerier.buildWhere({forAge, fromDate, toDate, status, centerId, code}, forAdmin);
            let attributes = classQuerier.buildAttributes({});
            let include = classQuerier.buildInclude({
                includeStudent,
                includeCenter,
                includeProgram,
                includeTeacher,
                includeSchedule
            });
            let orderBy = classQuerier.buildSort({});

            let data = await Class.paginate({
                page: page,
                paginate: perPage,
                where: {
                    [Op.and]: conds
                },
                attributes: attributes,
                include: include,
                order: orderBy,
                // logging: true
            });

            data.currentPage = page;

            for (let item of data.docs) {
                for(let schedule of (item?.schedules || [])) {
                    TimeHandle.attachDayLabel(schedule);
                }
                await new ClassHandler().attachAttendancesExtendInfo(item.students, item.id);
                for(let teacher of item?.teachers) {
                    await new UserService().handleHidenInfo(teacher);
                }
            }

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getClassDetail = async (req, res, next) => {
        try {
            const classQuerier = new ClassQuerier();
            let classId = req.params.id ? parseInt(req.params.id) : null;
            if(!classId) throw InputInfoEmpty;

            let includeStudent = req.query.includeStudent?.trim() === "true" || null;
            let includeProgram = req.query.includeProgram?.trim() === "true" || null;
            let includeTeacher = req.query.includeTeacher?.trim() === "true" || null;
            let includeCenter = req.query.includeCenter?.trim() === "true" || null;
            let includeSchedule = req.query.includeSchedule?.trim() === "true" || null;

            let attributes = classQuerier.buildAttributes({});
            let include = classQuerier.buildInclude({
                includeStudent,
                includeCenter,
                includeProgram,
                includeTeacher,
                includeSchedule
            });

            let data = await Class.findByPk(classId,
                {
                    attributes: attributes,
                    include: include,
                }
            );
            if(!data || data.status === ClassStatus.Disable) throw ClassNotFound;

            for(let schedule of (data?.schedules || [])) {
                TimeHandle.attachDayLabel(schedule);
            }
            await new ClassHandler().attachAttendancesExtendInfo(data.students, data.id);
            
            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getMyClass = async (req, res, next) => {
        try {
            const studentQuerier = new StudentQuerier();
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            let status = req.query.status ? parseInt(req.query.status) : null;

            let include = studentQuerier.buildInclude({
                includeClass: true
            });

            let student = await Student.findOne({
                where: {
                    userId: userId
                },
                include: include
            });

            // let classes = await StudentClass.findAll({
            //     where: {
            //         studentId: student.id
            //     }
            // });

            // let classIds = classes.map(item => item.id);

            // console.log(`==== sequelize detail: `, util.inspect(user, false, null, true));

            if(!student.classes) return res.status(200).json([]);

            return res.status(200).json(student.classes);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    teacherGetClass = async (req, res, next) => {
        try {
            const teacherQuerier = new TeacherQuerier();
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;

            if(req.user.role != UserRole.Teacher) return res.status(422).json({message: "Chức năng chỉ dành cho giáo viên"});

            let teacher = await Teacher.findOne({
                where: {
                    userId: userId
                },
                include: [
                    {
                        model: Class,
                        as: "classes",
                        include: [
                            {
                                model: Schedule,
                                as: "schedules"
                            },
                            {
                                model: Student,
                                as: "students"
                            },
                            {
                                model: Attendance,
                                as: "attendances"
                            },
                            {
                                model: Center,
                                as: "center"
                            }
                        ]
                    }
                ]
            });

            if(!teacher) return res.status(403).json({message: "Giáo viên không tồn tại"});

            if(!teacher?.classes) return res.status(200).json([]);

            await new TeacherService().attachTeacherSalary(teacher.classes, teacher.id);

            return res.status(200).json(teacher.classes);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentGetStudentClass = async (req, res, next) => {
        try {
            const studentQuerier = new StudentQuerier();
            let studentId = req.params.studentId;
            if(!studentId) throw UserNotFound;

            let parent = await Parent.findOne({
                where: {
                    userId: req.user.userId
                }
            });

            if(!parent) throw ParentNotFound;

            if(!await new ParentStudentService().checkConnect(parent.id, studentId)) throw NotEnoughPermission;

            let include = studentQuerier.buildInclude({
                includeClass: true
            });

            let user = await Student.findOne({
                where: {
                    id: studentId
                },
                include: include
            });

            if(!user.classes) return res.status(200).json([]);

            return res.status(200).json(user.classes);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createClass = async (req, res, next) => {
        try {
            let data = req.body;

            let resp = await new ClassCreateService().createClass(data);

            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateClass = async (req, res, next) => {
        try {
            let data = req.body;
            let classId = req.params.id ? parseInt(req.params.id): null;
            if(!classId) throw ClassNotFound;
            await new classUpdateService().updateDetail(data, classId);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    deactiveClass = async (req, res, next) => {
        try {
            let classId = req.params.id ? parseInt(req.params.id) : 0;
            if(!classId) throw InputInfoEmpty;
            let classEl = await Class.findByPk(classId);
            if(!classEl) return res.status(403).json({message: "Lớp không tồn tại"});
            let status = req.body.status;
            await classEl.update(
                {
                    status: status || ClassStatus.Disable
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

    deleteClass = async (req, res, next) => {
        try {
            let classId = req.params.id ? parseInt(req.params.id) : 0;
            if(!classId) throw InputInfoEmpty;
            let classEl = await Class.findByPk(classId);
            if(!classEl) return res.status(403).json({message: "Lớp không tồn tại"});
            let cost = await Cost.findOne({
                where: {
                    referenceId: classId,
                    type: CostType.StudentFee
                }
            });
            if(cost) return res.status(403).json({message: "Không thể xóa lớp đã có dữ liệu thu học phí"});
            let t = await sequelize.transaction();
            try {
                await Class.destroy({
                    where: {
                        id: classId
                    },
                    transaction: t
                });
    
                await StudentClass.destroy({
                    where: {
                        classId
                    },
                    transaction: t
                });
    
                await TeacherClass.destroy({
                    where: {
                        classId
                    },
                    transaction: t
                });

                await ClassSchedule.destroy({
                    where: {
                        classId
                    },
                    transaction: t
                });

                await t.commit();
            }
            catch (err) {
                await t.rollback();
            }

            return res.status(200).json({message: "Thành công"});

        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    studentRegisterClass = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let classId = req.body.classId ? parseInt(req.body.classId) : null;
            if(!userId) throw UserNotFound;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    userId: userId
                }
            });
            let studentClass = await StudentClass.findOne(
                {
                    where: {
                        studentId: student.id,
                        classId: classId
                    }
                }
            );
            if(studentClass) return res.status(403).json({message: "Bạn đã đăng kí lớp này"});
            if(!student) throw StudentNotFound;

            await new ClassRegisterService().register(classId, student.id);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentRegisterClass = async (req, res, next) => {
        try {
            let studentId = req.body.studentId;
            if(!studentId) throw UserNotFound;
            if(req.user.role != UserRole.Parent) return res.status(403).json({message: "Chức năng này chỉ dành cho phụ huynh"});
            let parent = await Parent.findOne({
                where: {
                    userId: req.user.userId
                }
            });

            if(!parent) throw ParentNotFound;

            if(!await new ParentStudentService().checkConnect(parent.id, studentId)) throw NotEnoughPermission;

            let classId = req.body.classId;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    id: studentId
                }
            });
            if(!student) throw StudentNotFound;

            let studentClass = await StudentClass.findOne(
                {
                    where: {
                        studentId: student.id,
                        classId: classId
                    }
                }
            );
            if(studentClass) return res.status(403).json({message: "Con bạn đã đăng kí lớp này"});
            if(!student) throw StudentNotFound;

            await new ClassRegisterService().register(classId, student.id);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminRegisterClass = async (req, res, next) => {
        try {
            let studentId = req.body.studentId ? parseInt(req.body.studentId) : null;
            let classId = req.body.classId ? parseInt(req.body.classId) : null;
            if(!studentId) throw StudentNotFound;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    id: studentId
                }
            });
            if(!student) throw StudentNotFound;

            let studentClass = await StudentClass.findOne(
                {
                    where: {
                        studentId: student.id,
                        classId: classId
                    }
                }
            );
            if(studentClass) return res.status(403).json({message: "Học sinh đã đăng kí lớp này"});
            if(!student) throw StudentNotFound;

            await new ClassRegisterService().register(classId, student.id);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    studentUnRegisterClass = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let classId = req.body.classId ? parseInt(req.body.classId) : null;
            if(!userId) throw UserNotFound;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    userId: userId
                }
            });
            let studentClass = await StudentClass.findOne(
                {
                    where: {
                        studentId: student.id,
                        classId: classId
                    }
                }
            );
            if(!studentClass) return res.status(403).json({message: "Bạn chưa đăng kí lớp này"});
            if(!student) throw StudentNotFound;

            await new ClassRegisterService().unRegister(classId, student.id);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentUnRegisterClass = async (req, res, next) => {
        try {
            let studentId = req.body.studentId;
            if(!studentId) throw UserNotFound;
            if(req.user.role != UserRole.Parent) return res.status(403).json({message: "Chức năng này chỉ dành cho phụ huynh"});
            let userId = req.user.userId;
            let parent = await Parent.findOne({
                where: {
                    userId: req.user.userId
                }
            });

            if(!parent) throw ParentNotFound;

            if(!await new ParentStudentService().checkConnect(parent.id, studentId)) throw NotEnoughPermission;

            let classId = req.body.classId;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    id: studentId
                }
            });
            if(!student) throw StudentNotFound;

            let studentClass = await StudentClass.findOne(
                {
                    where: {
                        studentId: student.id,
                        classId: classId
                    }
                }
            );
            if(!studentClass) return res.status(403).json({message: "Con bạn chưa đăng kí lớp này"});
            if(!student) throw StudentNotFound;

            await new ClassRegisterService().unRegister(classId, student.id);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUnRegisterClass = async (req, res, next) => {
        try {
            let studentId = req.body.studentId ? parseInt(req.body.studentId) : null;
            let classId = req.body.classId ? parseInt(req.body.classId) : null;
            if(!studentId) throw StudentNotFound;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    id: studentId
                }
            });
            if(!student) throw StudentNotFound;

            let studentClass = await StudentClass.findOne(
                {
                    where: {
                        studentId: student.id,
                        classId: classId
                    }
                }
            );
            if(!studentClass) return res.status(403).json({message: "Học sinh chưa đăng kí lớp này"});
            if(!student) throw StudentNotFound;

            await new ClassRegisterService().unRegister(classId, student.id);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    studentCheckRegisted = async (req, res, next) => {
        try {
            let studentId = req.query.studentId ? parseInt(req.query.studentId) : null;
            let classId = req.query.classId ? parseInt(req.query.classId) : null;
            if(!studentId || !classId) throw InputInfoEmpty;

            let checker = await StudentClass.findOne(
                {
                    where: {
                        studentId,
                        classId
                    }
                }
            );
            let resp = {
                isRegisted: checker ? true : false
            }
            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentCheckStudentsRegisted = async (req, res, next) => {
        try {
            let studentId = req.query.studentId.split(";").map(item => parseInt(item)) || [];
            let classId = req.query.classId ? parseInt(req.query.classId) : null;
            if(!studentId.length || !classId) throw InputInfoEmpty;

            let checker = await StudentClass.findAll(
                {
                    where: {
                        studentId: {
                            [Op.in]: studentId
                        },
                        classId
                    }
                }
            );

            let registedId = checker.map(item => item.studentId).filter(val => val);
            return res.status(200).json(
                {
                    registedId: registedId
                }
            );
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new ClassController();