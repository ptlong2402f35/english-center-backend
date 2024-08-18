const User = require("../../models").User;
const Student = require("../../models").Student;
const Parent = require("../../models").Parent;
const Teacher = require("../../models").Teacher;
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var uuid = require("uuid");
const { sequelize } = require("../../models");
const JWT_CONFIG = require("../../config/jwt");
const { CommunicationService } = require("../communication/communicationService");
const { UserRole } = require("../../constants/roles");
const { UserNotFound, UpdateFailMessage, ExpiredResetKey, UpdateDoneMessage } = require("../../constants/message");
const { CommunicationType } = require("../../constants/type");
const DefaultPartnerPassword = process.env.DEFAULT_PARTNER_PASSWORD?.trim() || "";
const DefaultServiceFee = process.env.DEFAULT_SERVICE_FEE ? parseFloat(process.env.DEFAULT_SERVICE_FEE) : 5.5;
class AuthService {
    constructor() {

    }

    async generateToken(user) {
        try {
            const accessToken = jwt.sign(
                {
                    user_id: user.id,
                    userName: user.userName,
                    role: user.role,
                },
                JWT_CONFIG.SECRET_KEY,
                {
                    expiresIn: JWT_CONFIG.AccessTokenTime
                }
            );

            return {
                accessToken,
                expiredIn: JWT_CONFIG.AccessTokenTime * 1000 + new Date().getTime(),
            }
        }
        catch(err) {
            console.log(err);
            return {};
        }
    }

    async initForgotPassword(email) {
        try {
            let user = await this.checkEmailExist(email);
            if(!user) throw UserNotFound;

            await new CommunicationService().sendForgetPasswordEmail(email, user);
        }
        catch (err) {
            throw err;
        }
    }

    async updateForgetPassword(resetKey, password) {
        try {
            let user = await User.findOne({
                where: {
                    resetKey: resetKey
                }
            });
            if(user?.resetKeyExpiredAt && user.resetKeyExpiredAt <= new Date()) throw ExpiredResetKey;
            if(!user) throw UserNotFound;
            let passHashed = bcrypt.hashSync(password, 10);
            let newResetKey = uuid.v4();
            await user.update({
                password: passHashed,
                resetKey: newResetKey,
                updatedAt: new Date()
            });
        }
        catch (err) {
            throw err;
        }
    }

    async handleCustomerSignup(data) {
        try {
			let passHashed = bcrypt.hashSync(data.password, 10);
            let user;
            let transaction = await sequelize.transaction();
            try {
                user = await User.create(
                    {
                        userName: data.userName,
                        email: data.email,
                        password: passHashed,
                        name: data.name,
                        gender: data.gender,
                        birthday: data.birthday,
                        phone: data.phone,
                        email: data.email,
                        role: data.role,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        transaction: transaction
                    }
                );
                if(!user) throw UpdateFailMessage;
                if(data.role === UserRole.Student) {
                    const student = await Student.create(
                        {
                            userId: user.id,
                            active: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        {
                            transaction: transaction
                        }
                    );
                }
                if(data.role === UserRole.Parent) {
                    const parent = await Parent.create(
                        {
                            userId: user.id,
                            active: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        {
                            transaction: transaction
                        }
                    );
                }
                if(data.role === UserRole.Teacher) {
                    const teacher = await Teacher.create(
                        {
                            userId: user.id,
                            active: true,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        {
                            transaction: transaction
                        }
                    );
                }
                await transaction.commit();
            }
            catch (err1) {
                await transaction.rollback();
                throw err1;
            }
            let resp = {
                userId: user.id,
            };
            const {accessToken, refreshToken, expiredIn} = await this.generateToken(user);
            if(accessToken && refreshToken) {
                resp.accessToken = accessToken;
                resp.refreshToken = refreshToken;
                resp.expiredIn = expiredIn;
            }
            return resp;
        }
        catch (err) {
            throw err;
        }
    }

    async checkUserNameExist(userName) {
        try {
            if(!userName) return null;
    
            return await User.findOne({
                where: {
                    userName: userName
                }
            });
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    async checkEmailExist(email) {
        try {
            if(!email) return null;
    
            return await User.findOne({
                where: {
                    email: email
                }
            });
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }
}

module.exports = {
    AuthService,
}