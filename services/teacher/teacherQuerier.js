const Class = require("../../models").Class;

class TeacherQuerier {
    
    buildWhere(
        {
            name,
            phone,
            email,
            level,
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

        if(level) {
            conds.push({
                level: level
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
            "active",
            "level"
        ]);
    }

    buildInclude(
        {
            includeClass,
        }
    ) {
        let include = [];

        if(includeClass) {
            include = [
                ...include,
                {
                    model: Class,
                    as: "classes",
                    attributes: [
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
                        "fee",
                        "status",
                        "programId",
                        "centerId",
                        "createdAt",
                        "updatedAt",
                    ] 
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
    TeacherQuerier
}