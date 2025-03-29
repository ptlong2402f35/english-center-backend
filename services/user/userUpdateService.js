const { UpdateFailMessage, UserNotFound, NotEnoughPermission } = require("../../constants/message");
const { UserRole } = require("../../constants/roles");
const { parentUpdateService } = require("../parent/parentUpdateService");
const User = require("../../models").User;
const Student = require("../../models").Student;
const Parent = require("../../models").Parent;
const Teacher = require("../../models").Teacher;

class UserUpdateService {
    constructor() {}

    async updateDetail(data, userId) {
        try {
            if(!userId) throw UserNotFound;
            let user = await User.findByPk(userId);

            let allowData = {
                name: data.name,
                gender: data.gender,
                birthday: data.birthday,
                age: data.age,
                address: data.address,
                phone: data.phone,
                email: data.email,
            };

            let enCode = await new parentUpdateService().enbuild(allowData);

            console.log("encode ===", enCode);

            if(data.email) {
                await User.update({
                    email: data.email,
                    ...(enCode.en_email ? {en_email: enCode.en_email} : {}), 
                },
                {
                    where: {
                        id: userId
                    }
                });
            }

            let count;
            switch(user.role) {
                case UserRole.Parent: {
                    [count] = await Parent.update(
                        {
                            ...allowData,
                            ...enCode
                        }, {
                        where: {
                            userId: userId
                        }
                    });
                    break;
                }
                case UserRole.Student: {
                    [count] = await Student.update(
                        {
                            ...allowData,
                            ...enCode
                        }, {
                        where: {
                            userId: userId
                        }
                    });
                    break;
                }
                case UserRole.Teacher: {
                    [count] = await Teacher.update(
                        {
                            ...allowData,
                            ...enCode,
                            level: data.level
                        }
                        , {
                        where: {
                            userId: userId
                        }
                    });
                    break;
                }
                default: {
                    throw NotEnoughPermission;
                }
            }
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