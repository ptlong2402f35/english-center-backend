const { Op } = require("sequelize");
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Class = require("../../models").Class;

class ParentQuerier {
    
    buildWhere(
        {
            name,
            phone,
            email,
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

        if(phone) {
            conds.push({
                phone: {
                    [Op.iLike]: `%${phone}%`
                }
            });
        }

        if(email) {
            conds.push({
                email: {
                    [Op.iLike]: `%${email}%`
                }
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
            includeStudent,
        }
    ) {
        let include = [];

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
    ParentQuerier
}