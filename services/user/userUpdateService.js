const { UpdateFailMessage } = require("../../constants/message");
const User = require("../../models").User;

class UserUpdateService {
    constructor() {}

    async updateDetail(data, userId) {
        try {
            let allowData = {
                name: data.name,
                gender: data.gender,
                birthday: data.birthday,
                age: data.age,
                address: data.address,
                phone: data.phone,
                email: data.email,
            };

            let [count] = await User.update(allowData, {
                where: {
                    id: userId
                }
            });
            if(!count) throw UpdateFailMessage;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    UserUpdateService
}