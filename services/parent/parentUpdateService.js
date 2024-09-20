const Parent = require("../../models").Parent;

class parentUpdateService {
    constructor() {}

    async updateParentDetail(data, parentId, {forAdmin} = {}) {
        try {
            let bData = await this.build(data, {forAdmin});
            await Parent.update(
                bData,
                {
                    where: {
                        id: parentId
                    }
                }
            );
        }
        catch (err) {
            throw err;
        }
    }

    async build(data, {forAdmin} = {}) {
        try {
            if(forAdmin) {
                return ({
                    name: data.name,
                    gender: data.gender,
                    birthday: data.birthday,
                    age: data.age,
                    address: data.address,
                    phone: data.phone,
                    email: data.email
                });
            }
            return ({
                name: data.name,
                gender: data.gender,
                birthday: data.birthday,
                age: data.age,
                address: data.address,
                phone: data.phone,
                email: data.email
            });
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    parentUpdateService
}