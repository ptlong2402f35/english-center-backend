const { UpdateFailMessage, UserNotFound, PasswordNotMatch, StudentNotFound, UserNameEmpty } = require("../../constants/message");
var bcrypt = require("bcryptjs");
const { UserRole } = require("../../constants/roles");
const { sequelize } = require("../../models");
const { Op } = require("sequelize");
const { DataMasking } = require("../dataMasking");
const { AesService } = require("../security/AesService");

const User = require("../../models").User;
const Parent = require("../../models").Parent;
const Student = require("../../models").Student;
const Teacher = require("../../models").Teacher;
const Class = require("../../models").Class;
const ParentStudent = require("../../models").ParentStudent;
const Request = require("../../models").Request;
const StudentClass = require("../../models").StudentClass;
const TeacherClass = require("../../models").TeacherClass;
const Attendance = require("../../models").Attendance;

class UserService {
    dataMasking;
    aesService;
    constructor() {
        this.dataMasking = new DataMasking();
        this.aesService = new AesService();
    }

    async attachRoleInfo(user) {
        try {
            if(!user) return user;
            let student = user?.student;
            let parent = user?.parent;
            let teacher = user?.teacher;
            
            let name = student?.name || parent?.name || teacher?.name || null;
            let gender = student?.gender || parent?.gender || teacher?.gender || null;
            let birthday = student?.birthday || parent?.birthday || teacher?.birthday || null;
            let age = student?.age || parent?.age || teacher?.age || null;
            let address = student?.address || parent?.address || teacher?.address || null;
            let phone = student?.phone || parent?.phone || teacher?.phone || null;
            let email = student?.email || parent?.email || teacher?.email || null;
            let roleActive = student?.active || parent?.active || teacher?.active || null;
            user.userEmail = user.email;
            user?.setDataValue("userEmail", user.email);
            user.name = name;
            user?.setDataValue("name", name);
            user.gender = gender;
            user?.setDataValue("gender", gender);
            user.birthday = birthday;
            user?.setDataValue("birthday", birthday);
            user.age = age;
            user?.setDataValue("age", age);
            user.address = address;
            user?.setDataValue("address", address);
            user.phone = phone;
            user?.setDataValue("phone", phone);
            user.email = email;
            user?.setDataValue("email", email);
            user.roleActive = roleActive;
            user?.setDataValue("roleActive", roleActive);
        }
        catch (err) {
            console.error(err);
            return user;
        }
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
        catch (err) {
            throw err;
        }
    }

    async updateMessageToken(userId, messageToken) {
        try {
            await User.update(
                {
                    messageToken,
                    updatedAt: new Date()
                },
                {
                    where: {
                        id: userId
                    }
                }
            );
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

    async autoGenerateUserAccount(role) {
        try {
            let last = null;
            let prefix ="";
            switch(role) {
                case UserRole.Student: {
                    prefix = "hocsinhthu";
                    last = await Student.findOne({
                        order: [["id", "desc"]],
                        limit: 1
                    });
                    break;
                }
                case UserRole.Parent: {
                    prefix = "phuhuynhthu";
                    last = await Parent.findOne({
                        order: [["id", "desc"]],
                        limit: 1
                    });
                    break;
                }
                case UserRole.Teacher: {
                    prefix = "giaovienthu";
                    last = await Teacher.findOne({
                        order: [["id", "desc"]],
                        limit: 1
                    });
                    break;
                }
                default: {
                    prefix = "hocsinhthu";
                    last = await Student.findOne({
                        order: [["id", "desc"]],
                        limit: 1
                    });
                    break;
                }
            }
            let id = (last.id + 1) || 0;
            return {
                userName: `${prefix}${id}`,
                password: "123456"
            }
        }
        catch (err) {
            throw err;
        }
    }

    async handleHidenInfo(user) {
        try {
            if(!user) return;
            let hidePhone = this.dataMasking.process(user.phone);
            let hideEmail = this.dataMasking.process(user.email);
            user.phone = hidePhone;
            user.email = hideEmail;
            user?.setDataValue("phone", hidePhone);
            user?.setDataValue("email", hideEmail);
        }
        catch (err) {
            console.error(err);
        }
    }

    async decodeField(data) {
        try {
            return {
                ...(data.en_userName ? {userName: await this.aesService.getStoreDecryptData(data.en_userName)} : {}),
                ...(data.en_name ? {name: await this.aesService.getStoreDecryptData(data.en_name)} : {}),
                ...(data.en_gender ? {gender: await this.aesService.getStoreDecryptData(data.en_gender)} : {}),
                ...(data.en_age ? {age: await this.aesService.getStoreDecryptData(data.en_age)} : {}),
                ...(data.en_address ? {address: await this.aesService.getStoreDecryptData(data.en_address)} : {}),
                ...(data.en_phone ? {phone: await this.aesService.getStoreDecryptData(data.en_phone)} : {}),
                ...(data.en_email ? {email: await this.aesService.getStoreDecryptData(data.en_email)} : {}),
                ...(data.en_role ? {role: await this.aesService.getStoreDecryptData(data.en_role)} : {}),
                ...(data.en_referenceId ? {referenceId: await this.aesService.getStoreDecryptData(data.en_referenceId)} : {}),
                ...(data.en_type ? {type: await this.aesService.getStoreDecryptData(data.en_type)} : {}),
                ...(data.en_birthday ? {birthday: await this.aesService.getStoreDecryptData(data.en_birthday)} : {}),
            }
        }
        catch (err) {
            console.error(err);
            return data;
        }
    }

    async attachDecodeField(data) {
        try {
            if(!data) return;
            let enData = await this.decodeField(data);
            console.log("enData", enData);
            if(data.en_userName && enData.userName) {
                data.userName = enData.userName;
                data.setDataValue("userName", enData.userName);
            }
            if(data.en_name && enData.name) {
                data.name = enData.name;
                data.setDataValue("name", enData.name);
            }
            if(data.en_gender && enData.gender) {
                data.gender = enData.gender;
                data.setDataValue("gender", enData.gender);
            }
            if(data.en_age && enData.age) {
                data.age = enData.age;
                data.setDataValue("age", enData.age);
            }
            if(data.en_address && enData.address) {
                data.address = enData.address;
                data.setDataValue("address", enData.address);
            }
            if(data.en_phone && enData.phone) {
                data.phone = enData.phone;
                data.setDataValue("phone", enData.phone);
            }
            if(data.en_email && enData.email) {
                data.email = enData.email;
                data.setDataValue("email", enData.email);
            }
            if(data.en_birthday && enData.birthday) {
                data.birthday = enData.birthday;
                data.setDataValue("birthday", enData.birthday);
            }
            if(data.en_role && enData.role) {
                data.role = enData.role;
                data.setDataValue("role", enData.role);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    async removeEncodeField(data) {
        try {
            if(!data) return;
            if(data.en_userName) {
                data.en_userName = null;
                data.setDataValue("en_userName", null);
            }
            if(data.en_name) {
                data.en_name = null;
                data.setDataValue("en_name", null);
            }
            if(data.en_gender) {
                data.en_gender = null;
                data.setDataValue("en_gender", null);
            }
            if(data.en_age) {
                data.en_age = null;
                data.setDataValue("en_age", null);
            }
            if(data.en_address) {
                data.address = null;
                data.setDataValue("address", null);
            }
            if(data.en_phone) {
                data.en_phone = null;
                data.setDataValue("en_phone", null);
            }
            if(data.en_email) {
                data.en_email = null;
                data.setDataValue("en_email", null);
            }
            if(data.en_birthday) {
                data.en_birthday = null;
                data.setDataValue("en_birthday", null);
            }
            if(data.en_role) {
                data.en_role = null;
                data.setDataValue("en_role", null);
            }
            if(data.en_address) {
                data.en_address = null;
                data.setDataValue("en_address", null);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    UserService
}