const { InputInfoEmpty } = require("../constants/message");
const { AttendanceService } = require("../services/attendance/attendanceService");
const { ErrorService } = require("../services/errorService");
const Attendance = require("../models").Attendance;

class AttendanceController {
    getAttendance = async(req, res, next) => {
        try {
            let classId = req.query.classId ? parseInt(req.query.classId) : null;
            let date = req.query.date || null;
            let user = req.user;
            if(!classId || !date) throw InputInfoEmpty;
            if(!await new AttendanceService().permissionChecker(user, classId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});
            let data = await Attendance.findAll(
                {
                    where: {
                        classId,
                        date
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
                staffIds: data.staffIds,
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
            let attendanceId = req.query.id ? parseInt(req.query.id) : null;
            let data = req.body;
            let user = req.user;
            if(!await new AttendanceService().permissionChecker(user, attendanceId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});

            let convertData = {
                date: data.date,
                staffIds: data.staffIds,
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
            if(!await new AttendanceService().permissionChecker(user, attendanceId)) return res.status(403).json({message: "Bạn không là giáo viên của lớp này"});

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
            let attendanceId = req.query.id ? parseInt(req.query.id) : null;
            

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new AttendanceController();