const { Op } = require("sequelize");
const { NotEnoughPermission } = require("../../constants/message");
const { UserRole } = require("../../constants/roles");
const { TimeHandle } = require("../../utils/timeHandle");

const Teacher = require("../../models").Teacher;
const TeacherClass = require("../../models").TeacherClass;
const Attendance = require("../../models").Attendance;
const Class = require("../../models").Class;


class AttendanceService {
    async permissionChecker(user, classId) {
        try {
            if(user.role === UserRole.Admin) return true;
            if(!user || !classId) return false;
            if(user.role === UserRole.Teacher) {
                let teacher = await Teacher.findOne(
                    {
                        where: {
                            userId: user.userId
                        }
                    }
                );
                if(!teacher.active) return false;
                let permission = await TeacherClass.findOne({
                    where: {
                        classId: classId,
                        teacherId: teacher.id
                    }
                });
                if(!permission) return false;
                return true;
            }
        }
        catch (err) {
            console.error(err);
            return true;
        }
    }

    async getTeacherAttendanceDependOnTime(teacherId, month, year) {
        try {
            let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, year);
            let teacherClasses = await TeacherClass.findAll({
                where: {
                    teacherId: teacherId
                }
            });
            let classIds = [...new Set(teacherClasses.map(item => item.classId).filter(val => val))];
            let attendances = await Attendance.findAll({
                where: {
                    [Op.and]: [
                        {classId: {
                            [Op.in]: classIds
                        }},
                        {date: {
                            [Op.gte]: first
                        }},
                        {date: {
                            [Op.lte]: last
                        }}
                    ]
                },
                logging: true
            });

            return {
                attendances,
                classIds
            }
        }
        catch (err) {
            console.error(err);
            return [];
        }
    }

    async groupAttendanceByClass(attendances, classes) {
        try {
            if(!classes.length || !attendances.length) return;
            for(let info of classes) {
                let fAtt = attendances.filter(att => att.classId === info.id);
                if(!fAtt) {
                    info.classes = [];
                    info.setDataValue("classes", []);
                    info.teachedSession = 0;
                    info.setDataValue("teachedSession", 0);
                    continue;
                }
                info.classes = fAtt;
                info.setDataValue("classes", fAtt);
                info.teachedSession = fAtt.length;
                info.setDataValue("teachedSession", fAtt.length);
            }
        }
        catch (err) {
            return
        }
    }
}

module.exports = {
    AttendanceService
}