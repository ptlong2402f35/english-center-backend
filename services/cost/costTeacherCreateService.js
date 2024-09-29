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
            if(!attendances || !attendances.length) return {
                create: false
            }
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
            await this.createCostInstances(builtData);

            return {
                create: true
            };
        }
        catch (err) {
            throw err;
        }
    }

    async prepare(teacherId, year, month) {
        try {
            let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, year);
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
            let timerTime = new Date(year, month - 1, 1);
            return ({
                name: name,
                referenceId: data.teacherId,
                type: CostType.TeacherSalary,
                status: CostStatus.Pending,
                totalMoney: data.salary,
                forMonth: month,
                forYear: year,
                forUserId: data.userId,
                debtMoney: data.salary,
                paidMoney: 0,
                timerTime: timerTime
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