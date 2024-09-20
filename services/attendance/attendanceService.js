const { NotEnoughPermission } = require("../../constants/message");
const { UserRole } = require("../../constants/roles");

const Teacher = require("../../models").Teacher;
const TeacherClass = require("../../models").TeacherClass;


class AttendanceService {
    async permissionChecker(user, classId) {
        try {
            if(user.role === UserRole.Admin) return true;
            if(!user || !classId) return false;
            if(user.role === UserRole.Teacher) {
                let teacher = await Teacher.findOne(
                    {
                        where: {
                            userId: user.id
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
}

module.exports = {
    AttendanceService
}