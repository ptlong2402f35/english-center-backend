const { Op } = require("sequelize");
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Class = require("../../models").Class;

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
        }
    ) {
        let include = [];

        if(includeParent) {
            include = [
                ...include,
                {
                    model: Parent,
                    as: "parents",
                    attributes: ["id", "name", "gender", "userId", "age", "address", "phone", "email", "active"] 
                }
            ]
        }

        if(includeClass) {
            include = [
                ...include,
                {
                    model: Class,
                    as: "classes",
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
    StudentQuerier
}