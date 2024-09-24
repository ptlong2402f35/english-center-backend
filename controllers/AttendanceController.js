const { Op, where } = require("sequelize");
const { InputInfoEmpty } = require("../constants/message");
const { AttendanceService } = require("../services/attendance/attendanceService");
const { ErrorService } = require("../services/errorService");
const { ClassStatus } = require("../constants/status");
const { TimeHandle } = require("../utils/timeHandle");
const { ParentStudentService } = require("../services/parentStudentService/parentStudentService");
const { UserRole } = require("../constants/roles");
const { sequelize } = require("../models");
const Attendance = require("../models").Attendance;
const StudentClass = require("../models").StudentClass;
const TeacherClass = require("../models").TeacherClass;
const Class = require("../models").Class;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Schedule = require("../models").Schedule;
const Center = require("../models").Center;
const Teacher = require("../models").Teacher;

class AttendanceController {
    getAttendance = async(req, res, next) => {
        try {
            let classId = req.query.classId ? parseInt(req.query.classId) : null;
            let fromDate = req.query.fromDate || null;
            let toDate = req.query.toDate || null;
            let user = req.user;
            if(!classId) throw InputInfoEmpty;
            if(!await new AttendanceService().permissionChecker(user, classId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});
            let conds = [];
            if(fromDate) {
                conds.push({
                    date: {
                        [Op.gte]: fromDate
                    }
                })
            }
            if(toDate) {
                conds.push({
                    date: {
                        [Op.lte]: toDate
                    }
                })
            }
            let data = await Attendance.findAll(
                {
                    where: {
                        [Op.and]: [
                            {classId: classId},
                            ...conds
                        ]
                    }
                }
            );

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getAttendanceDetail = async(req, res, next) => {
        try {
            let attendanceId = req.query.id ? parseInt(req.query.id) : null;
            
            let user = req.user;
            if(!await new AttendanceService().permissionChecker(user, classId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});
            let data = await Attendance.findByPk(attendanceId);

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createAttendance = async (req, res, next) => {
        try {
            let data = req.body;
            let user = req.user;
            if(!data.date || !data.classId) throw InputInfoEmpty;
            if(!await new AttendanceService().permissionChecker(user, data.classId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});

            let infoClass = await Class.findOne({
                where: {
                    id: data.classId
                }
            });
            if(!infoClass) return res.status(403).json({message: "Lớp này không tồn tại"});
            let convertData = {
                classId: data.classId,
                date: data.date,
                studentIds: data.studentIds || [],
            }
            let trans = await sequelize.transaction();
            try {
                await Attendance.create(convertData, {transaction: trans});
                await infoClass.update(
                    {
                        teachedSession: infoClass.teachedSession + 1,
                        updatedAt: new Date()
                    },
                    {
                        transaction: trans
                    }
                );
                await trans.commit();
            }
            catch (err1) {
                await trans.rollback();
                console.error(err1);
            }

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateAttendance = async (req, res, next) => {
        try {
            let attendanceId = req.params.id ? parseInt(req.params.id) : null;
            let data = req.body;
            let user = req.user;
            let attendance = await Attendance.findByPk(attendanceId);
            if(!attendance) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            if(!await new AttendanceService().permissionChecker(user, attendance.classId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});

            let convertData = {
                date: data.date,
                studentIds: data.studentIds,
            }

            await Attendance.update(
                convertData,
                {
                    where: {
                        id: attendanceId
                    }
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

    removeAttendance = async (req, res, next) => {
        try {
            let attendanceId = req.params.id ? parseInt(req.params.id) : null;
            let user = req.user;
            let attendance = await Attendance.findByPk(attendanceId);
            if(!attendance) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            if(!await new AttendanceService().permissionChecker(user, attendance.classId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});
            let infoClass = await Class.findOne({where: {id: attendance.classId}});
            await Attendance.destroy(
                {
                    where: {
                        id: attendanceId
                    }
                }
            );

            await infoClass.update(
                {
                    teachedSession: infoClass.teachedSession - 1,
                    updatedAt: new Date()
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

    getMyScheduleAttendace = async (req, res, next) => {
        try {
            let user = req.user;

            let student = await Student.findOne(
                {
                    where: {
                        userId: user.userId
                    }
                }
            );
            if(!student) return res.status(403).json({message: "Học sinh không tồn tại"});
            let studenClass = await StudentClass.findAll({
                where: {
                    studentId: student.id
                }
            });

            let classIds = [...new Set(studenClass.map(item => item.classId).filter(val => val))];
            let classes = await Class.findAll(
                {
                    where: {
                        id: {
                            [Op.in]: classIds
                        },
                        status: {
                            [Op.notIn]: [ClassStatus.Finish, ClassStatus.Disable]
                        }
                    },
                    include: [
                        {
                            model: Schedule,
                            as: "schedules"
                        },
                        {
                            model: Center,
                            as: "center"
                        }
                    ]
                }
            );
            
            let ret =[];
            for(let item of classes) {
                if(!item.schedules?.length) continue;
                let scheduleData = TimeHandle.getAllScheduleDayOfClass(item.startAt, item.endAt, item.totalSession, item.schedules, item);
                for(let item of scheduleData) {
                    let fItem = ret.find(key => key.key === item.key);
                    if(fItem) {
                        fItem.value = [...fItem.value, ...item.value];
                    }
                    else {
                        ret.push({
                            key: item.key,
                            value: [...item.value]
                        })
                    }
                }
            }

            ret.sort((a,b) => (new Date(a.key) < new Date(b.key) ? -1 : 1));

            let resp = ret.map(item => ({
                [item.key]: item.value
            }));

            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    teacherGetMyScheduleAttendace = async (req, res, next) => {
        try {
            let user = req.user;
            if(user.role != UserRole.Teacher) return res.status(403).json({message: "Chức năng chỉ dành cho giáo viên"});
            let teacher = await Teacher.findOne(
                {
                    where: {
                        userId: user.userId
                    }
                }
            );
            if(!teacher) return res.status(403).json({message: "giao vien không tồn tại"});
            let teacherClass = await TeacherClass.findAll({
                where: {
                    teacherId: teacher.id
                }
            });

            let classIds = [...new Set(teacherClass.map(item => item.classId).filter(val => val))];
            let classes = await Class.findAll(
                {
                    where: {
                        id: {
                            [Op.in]: classIds
                        },
                        status: {
                            [Op.notIn]: [ClassStatus.Finish, ClassStatus.Disable]
                        }
                    },
                    include: [
                        {
                            model: Schedule,
                            as: "schedules"
                        },
                        {
                            model: Center,
                            as: "center"
                        }
                    ]
                }
            );
            
            let ret =[];
            for(let item of classes) {
                if(!item.schedules?.length) continue;
                let scheduleData = TimeHandle.getAllScheduleDayOfClass(item.startAt, item.endAt, item.totalSession, item.schedules, item);
                for(let item of scheduleData) {
                    let fItem = ret.find(key => key.key === item.key);
                    if(fItem) {
                        fItem.value = [...fItem.value, ...item.value];
                    }
                    else {
                        ret.push({
                            key: item.key,
                            value: [...item.value]
                        })
                    }
                }
            }

            ret.sort((a,b) => (new Date(a.key) < new Date(b.key) ? -1 : 1));

            let resp = ret.map(item => ({
                [item.key]: item.value
            }));

            return res.status(200).json(resp);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getAttendanceByStudent = async(req, res, next) => {
        try {
            let classId = req.query.classId ? parseInt(req.query.classId) : null;
            let fromDate = req.query.fromDate || null;
            let toDate = req.query.toDate || null;
            let isJoin = req.query.isJoin?.trim() === "true" ? true : false;
            let user = req.user;
            if(!classId) throw InputInfoEmpty;
            let student = await Student.findOne({where: {userId: user.userId}});
            if(!student) return res.status(403).json({message: "Học sinh không tồn tại"});
            let conds = [];
            if(fromDate) {
                conds.push({
                    date: {
                        [Op.gte]: fromDate
                    }
                })
            }
            if(toDate) {
                conds.push({
                    date: {
                        [Op.lte]: toDate
                    }
                })
            }
            let studentClass = await StudentClass.findOne({
                where: {
                    studentId: student.id,
                    classId: classId
                }
            });
            if(!studentClass) return res.status(403).json({message: "Bạn không phải học sinh lớp này"});
            if(user.role != UserRole.Student) return res.status(403).json({message: "Chức năng chỉ dành cho học sinh"});
            if(isJoin) {
                conds.push({
                    studentIds: {
                        [Op.contains]: [student.id]
                    }
                })
            }
            let data = await Attendance.findAll(
                {
                    where: {
                        [Op.and]: [
                            {classId: classId},
                            ...conds
                        ]
                    },
                    order: [["date", "asc"]]
                }
            );

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getAttendanceByParent = async(req, res, next) => {
        try {
            let classId = req.query.classId ? parseInt(req.query.classId) : null;
            let studentId = req.query.studentId ? parseInt(req.query.studentId) : null;
            let fromDate = req.query.fromDate || null;
            let toDate = req.query.toDate || null;
            let isJoin = req.query.isJoin?.trim() === "true" ? true : false;
            let user = req.user;
            if(!classId || !studentId) throw InputInfoEmpty;
            let parent = await Parent.findOne({where: {userId: user.userId}});
            let student = await Student.findByPk(studentId);
            if(!parent) return res.status(403).json({message: "Phụ huynh không tồn tại"})
            if(!student) return res.status(403).json({message: "Học sinh không tồn tại"})
            if(!await new ParentStudentService().checkConnect(parent.id, studentId)) return res.status(403).json({message: "Đây không phải con của bạn"});
            let conds = [];
            if(fromDate) {
                conds.push({
                    date: {
                        [Op.gte]: fromDate
                    }
                })
            }
            if(toDate) {
                conds.push({
                    date: {
                        [Op.lte]: toDate
                    }
                })
            }
            if(isJoin) {
                conds.push({
                    studentIds: {
                        [Op.contains]: [studentId]
                    }
                })
            }
            let data = await Attendance.findAll(
                {
                    where: {
                        [Op.and]: [
                            {classId: classId},
                            ...conds
                        ],
                    },
                    order: [["date", "asc"]]
                }
            );

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new AttendanceController();