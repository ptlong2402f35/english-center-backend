const { AesService } = require("../security/AesService");

const Student = require("../../models").Student;
const User = require("../../models").User;

class StudentUpdateService {
    aesService;
    constructor() {
        this.aesService = new AesService();
    }

    async updateStudentDetail(data, studentId, {forAdmin} = {}) {
        try {
            let bData = await this.build(data, {forAdmin});
            let eData = await this.enbuild(data);
            let student = await Student.findByPk(studentId);
            await Student.update(
                {
                    ...bData,
                    ...eData
                },
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

    async enbuild(data) {
        try {
            return ({
                en_name: await this.aesService.getStoreEncryptData(data.name),
                en_gender: await this.aesService.getStoreEncryptData(data.gender),
                en_birthday: await this.aesService.getStoreEncryptData(data.birthday),
                en_age: await this.aesService.getStoreEncryptData(data.age),
                en_address: await this.aesService.getStoreEncryptData(data.address),
                en_phone: await this.aesService.getStoreEncryptData(data.phone),
                en_email: await this.aesService.getStoreEncryptData(data.email)
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