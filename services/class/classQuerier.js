const { Op } = require("sequelize");
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Program = require("../../models").Program;
const Center = require("../../models").Center;
const Class = require("../../models").Class;

class ClassQuerier {
    
    buildWhere(
        {
            forAge,
            fromDate,
            toDate,
            centerId,
            status
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
                    [Op.gte]: `%${fromDate}%`
                }
            });
        }

        if(toDate) {
            conds.push({
                startAt: {
                    [Op.lte]: `%${toDate}%`
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

        return conds;
    }

    buildAttributes(
        {

        }
    ) {
        return ([
            "id",
            "name",
            "fromtAge",
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
            "createdAt",
            "updatedAt",
        ]);
    }

    buildInclude(
        {
            includeProgram,
            includeCenter,
            includeTeacher,
            includeStudent
        }
    ) {
        let include = [];

        if(includeProgram) {
            include = [
                ...include,
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "reducePercent", "reduceValue", "startAt", "endAt", "createdAt", "updatedAt", "status"] 
                }
            ]
        }

        if(includeCenter) {
            include = [
                ...include,
                {
                    model: Center,
                    as: "center",
                    attributes: ["id", "name", "address", "phone", "email", "active", "images"] 
                }
            ]
        }

        if(includeTeacher) {
            include = [
                ...include,
                {
                    model: Teacher,
                    as: "teacher",
                    attributes: ["id", "name", "gender", "userId", "age", "address", "phone", "email", "active", "level"] 
                }
            ]
        }

        if(includeStudent) {
            include = [
                ...include,
                {
                    model: Student,
                    as: "student",
                    attributes: ["id", "name", "gender", "userId", "age", "address", "phone", "email", "active"] 
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