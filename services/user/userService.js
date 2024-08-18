const { UpdateFailMessage, UserNotFound, PasswordNotMatch } = require("../../constants/message");
var bcrypt = require("bcryptjs");

const User = require("../../models").User;

class UserService {
    constructor() {

    }

    async updateDetail(data, userId) {
        try {
            let allowData = {
                ...(data?.allowName ? {name: data.name} : {}),
                ...(data?.allowGender ? {gender: data.gender} : {}),
                ...(data?.allowBirthDay ? {birthday: data.birthday} : {}),
                ...(data?.allowAge ? {age: data.age} : {}),
                ...(data?.allowAddress ? {address: data.address} : {}),
                ...(data?.allowPhone ? {phone: data.phone} : {}),
                ...(data?.allowEmail ? {email: data.email} : {}),
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

    async updatePassword(data, userId) {
        try {
            let user = await this.fetchUser(userId);
            if(!user) throw UserNotFound;
            let checkPass = bcrypt.compareSync(data.password, user.password);
            if(checkPass) {
                let passHashed = bcrypt.hashSync(data.password, 10);
                let [count] = await User.update(
                    {
                        password: passHashed,
                        updatedAt: new Date()
                    },
                    {
                        where: {
                            id: userId
                        }
                    }
                );
                if(!count) throw UpdateFailMessage;
            }
            throw PasswordNotMatch;
        }
        catch (err) {
            throw err;
        }
    }

    async fetchUser(userId) {
        try {
            return await User.findByPk(userId);
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    UserService
}