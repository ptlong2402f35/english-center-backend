const Cost = require("../../models").Cost;
const Attendance = require("../../models").Attendance;
const TeacherClass = require("../../models").TeacherClass;
const Class = require("../../models").Class;
const Teacher = require("../../models").Teacher;
const { Op } = require("sequelize");
const {TimeHandle} = require("../../utils/timeHandle");
const { CostHandler } = require("./costHandler");
const { CostType } = require("../../constants/type");
const { CostStatus } = require("../../constants/status");

class CostTeacherCreateService {
    costHandler;
    constructor() {
        this.costHandler = new CostHandler();
    }
    async createCost(teacherId, month, year, name) {
        try {
            let {
                teacher,
                teacherClass, 
                attendances
            } = await this.prepare(teacherId, year, month);
            let salary = await this.costHandler.handleProcessTeacherSalary(teacherClass, attendances);
            let builtData = await this.build(
                {
                    teacherId: teacherId,
                    salary: salary,
                    userId: 1
                },
                month, 
                year,
                name
            );
            console.log(builtData);
            // await this.createCostInstances(builtData);

            return;
        }
        catch (err) {
            throw err;
        }
    }

    async prepare(teacherId, year, month) {
        try {
            let {first, last} = TimeHandle.getStartAndEndDayOfMonth(year, month);
            let [teacher, teacherClass] = await Promise.all([
                Teacher.findOne(
                    {
                        where: {
                            id: teacherId
                        },
                    }
                ),
                TeacherClass.findAll(
                    {
                        where: {
                            teacherId: teacherId
                        },
                    }
                )
            ]);

            let classIds = [... new Set(teacherClass.map(item => item.classId).filter(val => val))];

            let attendances = await Attendance.findAll(
                {
                    where: {
                        classId: {
                            [Op.in]: classIds
                        },
                        day: {
                            [Op.gte]: first
                        },
                        date: {
                            [Op.lte]: last
                        }
                    }
                }
            );

            return {
                teacher,
                teacherClass,
                attendances
            }
        }
        catch (err) {
            throw err;
        }
    }

    async createCostInstances(data) {
        try {
            await Cost.create(
                data
            );
        }
        catch (err) {
            throw err;
        }
    }

    async build(data, month, year, name) {
        try {
            return ({
                name: name,
                referenceId: data.teacherId,
                type: CostType.TeacherSalary,
                status: CostStatus.Pending,
                totalMoney: data.salary,
                forMonth: month,
                forYear: year,
                forUserId: data.userId,
                debtMoney: 0,
                paidMoney: 0
            });
        }
        catch (err) {
            throw err;
        }
    }

    
}

module.exports = {
    CostTeacherCreateService
}