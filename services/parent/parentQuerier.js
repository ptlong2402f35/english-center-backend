const { Op } = require("sequelize");
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Class = require("../../models").Class;
const User = require("../../models").User;

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
            // "gender",
            // "birthday",
            // "age",
            // "address",
            // "phone",
            // "email",
            "createdAt",
            "updatedAt",
            "userId",
            "active",
            "en_name",
            "en_gender",
            "en_birthday",
            "en_age",
            "en_address",
            "en_phone",
            "en_email"
        ]);
    }

    buildInclude(
        {
            includeStudent,
            includeUser
        }
    ) {
        let include = [];

        if(includeStudent) {
            include = [
                ...include,
                {
                    model: Student,
                    as: "childs",
                    // attributes: ["id", "name", "gender", "userId", "age", "address", "phone", "email", "active"] 
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
    ParentQuerier
}