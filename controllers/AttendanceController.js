const { Op, where } = require("sequelize");
const { InputInfoEmpty } = require("../constants/message");
const { AttendanceService } = require("../services/attendance/attendanceService");
const { ErrorService } = require("../services/errorService");
const { ClassStatus } = require("../constants/status");
const { TimeHandle } = require("../utils/timeHandle");
const Attendance = require("../models").Attendance;
const StudentClass = require("../models").StudentClass;
const Class = require("../models").Class;
const Student = require("../models").Student;
const Schedule = require("../models").Schedule;
const Center = require("../models").Center;

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

            let convertData = {
                classId: data.classId,
                date: data.date,
                studentIds: data.studentIds || [],
            }

            await Attendance.create(convertData);

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
            let attendanceId = req.query.id ? parseInt(req.query.id) : null;
            let user = req.user;
            let attendance = await Attendance.findByPk(attendanceId);
            if(!attendance) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            if(!await new AttendanceService().permissionChecker(user, attendance.classId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});

            await Attendance.destroy(
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
}

module.exports = new AttendanceController();