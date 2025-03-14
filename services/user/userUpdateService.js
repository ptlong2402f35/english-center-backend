const { UpdateFailMessage, UserNotFound, NotEnoughPermission } = require("../../constants/message");
const { UserRole } = require("../../constants/roles");
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

            if(data.email) {
                await User.update({
                    email: data.email
                },
                {
                    where: {
                        id: userId
                    }
                });
            }

            let allowData = {
                name: data.name,
                gender: data.gender,
                birthday: data.birthday,
                age: data.age,
                address: data.address,
                phone: data.phone,
                email: data.email,
            };
            let count;
            switch(user.role) {
                case UserRole.Parent: {
                    [count] = await Parent.update(allowData, {
                        where: {
                            userId: userId
                        }
                    });
                    break;
                }
                case UserRole.Student: {
                    [count] = await Student.update(allowData, {
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