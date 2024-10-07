const Attendance = require("../../models").Attendance; 

class ClassHandler {
    constructor() {}

    async attachAttendancesExtendInfo(students, classId) {
        try {
            let attendances = await Attendance.findAll({
                where: {
                    classId: classId
                }
            });
            for(let student of students) {
                let joinGrp = attendances.filter(item => item.studentIds?.includes(student.id));
                let count = joinGrp.length || 0;
                student.joinCount = count;
                student.setDataValue("joinCount", count);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    ClassHandler
}