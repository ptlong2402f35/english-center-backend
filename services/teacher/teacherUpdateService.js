const Student = require("../../models").Teacher;

class TeacherUpdateService {
    constructor() {}

    async updateDetail(data, teacherId, {forAdmin} = {}) {
        try {
            let bData = await this.build(data, {forAdmin});
            await Student.update(
                bData,
                {
                    where: {
                        id: teacherId
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
                    email: data.email,
                    level: data.level
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
    TeacherUpdateService
}