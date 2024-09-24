const Cost = require("../../models").Cost;
const Attendance = require("../../models").Attendance;
const StudentClass = require("../../models").StudentClass;
const Class = require("../../models").Class;
const Student = require("../../models").Student;
const { Op } = require("sequelize");
const {TimeHandle} = require("../../utils/timeHandle");
const { CostHandler } = require("./costHandler");
const { CostType } = require("../../constants/type");
const { CostStatus } = require("../../constants/status");

class CostCreateService {
    costHandler;
    constructor() {
        this.costHandler = new CostHandler();
    }
    async createCostByClass(classId, month, year, name) {
        try {
            let {
                classInfo,
                studentClasses, 
                attendances
            } = await this.prepare(classId, year, month);
            let convertData = await this.costHandler.handleGetStudentAttendance(attendances, studentClasses, classInfo.fee);
            let builtData = await this.build(convertData, month, year, name);
            console.log(builtData);
            // await this.createCostInstances(builtData);

            return;
        }
        catch (err) {
            throw err;
        }
    }

    async prepare(classId, year, month) {
        try {
            let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, year);
            let [classInfo, studentClasses, attendances] = await Promise.all([
                Class.findOne(
                    {
                        where: {
                            id: classId
                        }
                    }
                ),
                StudentClass.findAll(
                    {
                        where: {
                            classId: classId
                        },
                        include: [
                            {
                                model: Student,
                                as: "student",
                                attributes: ["id", "userId"]
                            }
                        ]
                    }
                ),
                Attendance.findAll(
                    {
                        where: {
                            classId: classId,
                            date: {
                                [Op.gte]: first
                            },
                            date: {
                                [Op.lte]: last
                            }
                        }
                    }
                ),
            ]);

            return {
                classInfo,
                studentClasses,
                attendances
            }
        }
        catch (err) {
            throw err;
        }
    }

    async createCostInstances(data) {
        try {
            await Cost.bulkCreate(
                data
            );
        }
        catch (err) {
            throw err;
        }
    }

    async build(data, month, year, name) {
        try {
            return data.map(item => ({
                name: name,
                referenceId: item.classId,
                type: CostType.StudentFee,
                status: CostStatus.Pending,
                totalMoney: item.fee,
                forMonth: month,
                forYear: year,
                forUserId: item.userId,
                debtMoney: 0,
                paidMoney: 0
            }));
        }
        catch (err) {
            throw err;
        }
    }

    
}

module.exports = {
    CostCreateService
}