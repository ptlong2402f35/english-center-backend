const { Op } = require("sequelize");
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Class = require("../../models").Class;
const User = require("../../models").User;
const Teacher = require("../../models").Teacher;
const Attendance = require("../../models").Attendance;

class StudentQuerier {
    
    buildWhere(
        {
            name,
            age,
            active,
        }
    ) {
        let conds = [];

        if(name) {
            conds.push({
                name: {
                    [Op.iLike]: `%${name}%`
                }
            });
        }

        if(age) {
            conds.push({
                age: age
            });
        }

        if(active || active === false) {
            conds.push({
                active: active
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
            "gender",
            "birthday",
            "age",
            "address",
            "phone",
            "email",
            "createdAt",
            "updatedAt",
            "userId",
            "active"
        ]);
    }

    buildInclude(
        {
            includeParent,
            includeClass,
            includeUser,
        }
    ) {
        let include = [];

        if(includeParent) {
            include = [
                ...include,
                {
                    model: Parent,
                    as: "parents",
                    // attributes: ["id", "name", "gender", "userId", "age", "address", "phone", "email", "active"] 
                }
            ]
        }

        if(includeClass) {
            include = [
                ...include,
                {
                    model: Class,
                    as: "classes",
                    through: { attributes: ["id", "classId", "studentId", "reduceFee", "reducePercent"] },
                    include: [
                        {
                            model: Attendance,
                            as: "attendances"
                        },
                        {
                            model: Teacher,
                            as: "teachers"
                        }
                    ]
                }
            ]
        }

        if(includeUser) {
            include = [
                ...include,
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "userName"]
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
    StudentQuerier
}