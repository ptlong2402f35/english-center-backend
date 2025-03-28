const { Op } = require("sequelize");
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Teacher = require("../../models").Teacher;

class UserQuerier {
    
    buildWhere(
        {
            active,
        }
    ) {
        let conds = [];

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
            "role",
            "active",
            "createdAt",
            "updatedAt",
            "en_userName",
            "en_role",
            "en_email"
        ]);
    }

    buildInclude(
        {
            includeParent,
            includeTeacher,
            includeStudent
        }
    ) {
        let include = [];

        if(includeParent) {
            include = [
                ...include,
                {
                    model: Parent,
                    as: "parent",
                    attributes: ["id", "name", "gender", "userId", "age", "address", "phone", "email", "active"] 
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
    UserQuerier
}