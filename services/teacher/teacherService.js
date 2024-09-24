const { Op } = require("sequelize");

const TeacherClass = require("../../models").TeacherClass;

class TeacherService {
    constructor() {}

    async attachTeacherSalary(classes, teacherId) {
        try {
            let classIds = classes.map(item => item.id).filter(val => val);
            let teacherClass = await TeacherClass.findAll({
                where: {
                    teacherId: teacherId,
                    classId: {
                        [Op.in]: classIds
                    }
                }
            });

            for (let item of classes) {
                let fItem = teacherClass.find(el => el.classId === item.id);
                if(fItem) {
                    item.salary = fItem.salary;
                    item?.setDataValue("salary", fItem.salary);
                    continue;
                }
                item.salary = 0;
                item?.setDataValue("salary", 0);
            }

            return;
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    TeacherService
}