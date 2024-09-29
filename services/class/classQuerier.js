const { Op } = require("sequelize");
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Program = require("../../models").Program;
const Center = require("../../models").Center;
const Class = require("../../models").Class;
const Teacher = require("../../models").Teacher;
const Schedule = require("../../models").Schedule;

class ClassQuerier {
    
    buildWhere(
        {
            forAge,
            fromDate,
            toDate,
            centerId,
            status,
            code
        }
    ) {
        let conds = [];

        if(forAge) {
            conds.push({
                fromAge: {
                    [Op.gte]: forAge
                },
                toAge: {
                    [Op.lte]: forAge
                }
            });
        }

        if(fromDate) {
            conds.push({
                startAt: {
                    [Op.gte]: fromDate
                }
            });
        }

        if(toDate) {
            conds.push({
                startAt: {
                    [Op.lte]: toDate
                }
            });
        }

        if(centerId) {
            conds.push({
                centerId: centerId
            });
        }

        if(status) {
            conds.push({
                status: status
            });
        }

        if(code) {
            conds.push({
                code: {
                    [Op.iLike]: `%${code}%`
                }
            });
        }

        return conds;
    }

    buildAttributes(
        {

        }
    ) {
        return ([
            "id",
            "name",
            "fromAge",
            "toAge",
            "startAt",
            "endAt",
            "studentQuantity",
            "maxQuantity",
            "totalSession",
            "teachedSession",
            "status",
            "programId",
            "centerId",
            "code",
            "fee",
            "createdAt",
            "updatedAt",
        ]);
    }

    buildInclude(
        {
            includeProgram,
            includeCenter,
            includeTeacher,
            includeStudent,
            includeSchedule
        }
    ) {
        let include = [];

        if(includeProgram) {
            include = [
                ...include,
                {
                    model: Program,
                    as: "program",
                }
            ]
        }

        if(includeCenter) {
            include = [
                ...include,
                {
                    model: Center,
                    as: "center",
                }
            ]
        }

        if(includeTeacher) {
            include = [
                ...include,
                {
                    model: Teacher,
                    as: "teachers",
                    through: { attributes: ["classId", "teacherId", "salary"] } 
                }
            ]
        }

        if(includeStudent) {
            include = [
                ...include,
                {
                    model: Student,
                    as: "students",
                }
            ]
        }

        if(includeSchedule) {
            include = [
                ...include,
                {
                    model: Schedule,
                    as: "schedules",
                    through: { attributes: [] } 
                }
            ]
        }

        return include;
    }

    buildSort({}) {
        let orderBy = [["id", "desc"]];

        return orderBy;
    }
}

module.exports = {
    ClassQuerier
}