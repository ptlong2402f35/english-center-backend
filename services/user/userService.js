const { UpdateFailMessage, UserNotFound, PasswordNotMatch, StudentNotFound, UserNameEmpty } = require("../../constants/message");
var bcrypt = require("bcryptjs");
const { UserRole } = require("../../constants/roles");
const { sequelize } = require("../../models");
const { Op } = require("sequelize");
const { DataMasking } = require("../dataMasking");

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
    constructor() {
        this.dataMasking = new DataMasking();
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
}

module.exports = {
    UserService
}