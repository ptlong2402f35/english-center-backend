const Student = require("../../models").Student;
const User = require("../../models").User;

class StudentUpdateService {
    constructor() {}

    async updateStudentDetail(data, studentId, {forAdmin} = {}) {
        try {
            let bData = await this.build(data, {forAdmin});
            let student = await Student.findByPk(studentId);
            await Student.update(
                bData,
                {
                    where: {
                        id: studentId
                    }
                }
            );
            if(data.email) {
                await User.update(
                    {
                        email: data.email
                    },
                    {
                        where: {
                            id: student.userId
                        }
                    }
                );
            }
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
    StudentUpdateService
}