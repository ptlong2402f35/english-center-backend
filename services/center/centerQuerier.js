const { Op } = require("sequelize");
const Class = require("../../models").Class;

class CenterQuerier {
    
    buildWhere(
        {
            name,
            address,
            phone,
            status
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

        if(address) {
            conds.push({
                address: {
                    [Op.iLike]: `%${address}%`
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
            "address",
            "phone",
            "images",
            "active",
            "createdAt",
            "updatedAt",
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
                    as: "class",
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
    CenterQuerier
}