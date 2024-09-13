const { InputInfoEmpty, ClassNotFound, UserNotFound, ParentNotFound, NotEnoughPermission, StudentNotFound } = require("../constants/message");
const { ClassCreateService } = require("../services/class/classCreateService");
const { ClassQuerier } = require("../services/class/classQuerier");
const { ClassRegisterService } = require("../services/class/classRegisterService");
const { classUpdateService } = require("../services/class/classUpdateService");
const { ErrorService } = require("../services/errorService");
const { ParentStudentService } = require("../services/parentStudentService/parentStudentService");
const { StudentQuerier } = require("../services/student/studentQuerier");
const { TeacherQuerier } = require("../services/teacher/teacherQuerier");

const Class = require("../models").Class;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;

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
            let includeStudent = req.query.includeStudent?.trim() === "true" || null;
            let includeProgram = req.query.includeProgram?.trim() === "true" || null;
            let includeTeacher = req.query.includeTeacher?.trim() === "true" || null;
            let includeCenter = req.query.includeCenter?.trim() === "true" || null;

            let conds = classQuerier.buildWhere({forAge, fromDate, toDate, status, centerId});
            let attributes = classQuerier.buildAttributes({});
            let include = classQuerier.buildInclude({
                includeStudent,
                includeCenter,
                includeProgram,
                includeTeacher
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
                orderBy: orderBy
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

    getClassDetail = async (req, res, next) => {
        try {
            const classQuerier = new ClassQuerier();
            let classId = req.params.id ? parseInt(req.params.id) : null;
            if(!classId) throw InputInfoEmpty;

            let includeStudent = req.query.includeStudent?.trim() === "true" || null;
            let includeProgram = req.query.includeProgram?.trim() === "true" || null;
            let includeTeacher = req.query.includeTeacher?.trim() === "true" || null;
            let includeCenter = req.query.includeCenter?.trim() === "true" || null;

            let attributes = classQuerier.buildAttributes({});
            let include = classQuerier.buildInclude({
                includeStudent,
                includeCenter,
                includeProgram,
                includeTeacher
            });

            let data = await Class.findByPk(classId,
                {
                    attributes: attributes,
                    include: include,
                }
            );
            if(!data) throw ClassNotFound;
            
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

            let include = studentQuerier.buildAttributes({});

            let user = await Student.findOne({
                where: {
                    userId: userId
                },
                include: include
            });

            if(!user.class) return res.status(200).json([]);

            return res.status(200).json(user.class);
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

            let include = teacherQuerier.buildAttributes({});

            let teacher = await Teacher.findOne({
                where: {
                    userId: userId
                },
                include: include
            });

            if(!teacher.class) return res.status(200).json([]);

            return res.status(200).json(teacher.class);
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

            if(!user.class) return res.status(200).json([]);

            return res.status(200).json(user.class);
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

            await new ClassCreateService().createClass(data);

            return res.status(200).json({message: "Thành công"});
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
            let classId = req.params.id ? parseInt(req.params.id) : null;
            if(!userId) throw UserNotFound;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    userId: userId
                }
            });
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

            let parent = await Parent.findOne({
                where: {
                    userId: req.user.userId
                }
            });

            if(!parent) throw ParentNotFound;

            if(!await new ParentStudentService().checkConnect(parent.id, studentId)) throw NotEnoughPermission;

            let classId = req.params.id ? parseInt(req.params.id) : null;
            if(!classId) throw ClassNotFound;
            let student = await Student.findOne({
                where: {
                    userId: userId
                }
            });
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

            await new ClassRegisterService().register(classId, student.id);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new ClassController();