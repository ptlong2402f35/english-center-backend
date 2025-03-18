const { Op } = require("sequelize");
const { sequelize } = require("../models");
const User = require("../models").User;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;
const Student = require("../models").Student;
const util = require("util");
const { AuthService } = require("../services/auth/authService");
const {AuthLogin} = require("../services/auth/authLogin"); 
const { EmailEmpty, PasswordEmpty, InputInfoEmpty, ConfirmPasswordNotMatch, ExistedEmail, ExistedPhone, UserNotFound, EmailFormatNotValid, PhoneFormatNotValid, UserNameEmpty } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { Validation } = require("../utils/validation");
const { TranslateService } = require("../services/translateService");
const SuccessRespMessage = require("../resources/translation.json").message.done;
const config = require("../config/config");
const { UserService } = require("../services/user/userService");
const { FirebaseConfig } = require("../firebase/firebaseConfig");
const { OtpService } = require("../services/security/otpService");
const { GoogleAuth } = require("../services/auth/googleAuth");
const { AesService } = require("../services/security/AesService");
class AuthController {
    login = async (req, res, next) => {
        try {
            let data = req.body;
            data.userName = data.userName?.trim()?.toLowerCase();
            if(!data.userName) {
                throw UserNameEmpty;
            }
            if(!data.password) {
                throw PasswordEmpty;
            }
            let {action, accessToken, refreshToken, expiredIn, userId, email} = await new AuthLogin().handleLogin(data);
            let user = await User.findByPk(userId);
            if(action) {
                await new OtpService().sendOtpToEmail(user);
                return res.status(200).json(await new AesService().getTransferResponse({
                    message: "Gửi mail thành công",
                    // accessToken,
                    // expiredIn,
                    userId,
                    // refreshToken,
                    email
                }))
            }
            return res.status(403).json({
                message: "Đăng nhập thất bại",
                accessToken: null,
                expiredIn: null,
                userId: null,
                refreshToken: null,
            });
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    loginForDev = async (req, res, next) => {
        try {
            let data = req.body;
            data.userName = data.userName?.trim()?.toLowerCase();
            if(!data.userName) {
                throw UserNameEmpty;
            }
            if(!data.password) {
                throw PasswordEmpty;
            }
            let {action, accessToken, refreshToken, expiredIn, userId} = await new AuthLogin().handleLogin(data, true);
            if(action) {
                return res.status(200).json(await new AesService().getTransferResponse({
                    message: "Đăng nhập thành công",
                    accessToken,
                    expiredIn,
                    userId,
                    refreshToken,
                }));
            }
            return res.status(403).json({
                message: "Đăng nhập thất bại",
                accessToken: null,
                expiredIn: null,
                userId: null,
                refreshToken: null,
            });
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    signup = async (req, res, next) => {
        try {
            let authService = new AuthService();
            let data = req.body;
            if(
                !data.userName || 
                !data.password || 
                !data.confirmPassword
            ) throw InputInfoEmpty;
            data.userName = data.userName?.trim()?.toLowerCase();

            if(data.password != data.confirmPassword) {
               throw ConfirmPasswordNotMatch;
            }

            let userByUserName = await authService.checkUserNameExist(data.userName);

            // if(userByUserName) throw ExistedEmail;

            let resp = await new AuthService().handleCustomerSignup(data);

            return res.status(200).json(await new AesService().getTransferResponse({
                message: "Thành công",
                ...resp,
            }))
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    refresh = async (req, res, next) => {
        try {
            let token = req.body.refreshToken || null;
            let {action, accessToken, refreshToken, expiredIn, userId} = await new AuthLogin().handleRefresh(token);
            if(action) {
                return res.status(200).json(await new AesService().getTransferResponse({
                    message: new TranslateService(req).translateMessage(SuccessRespMessage, true),
                    accessToken,
                    expiredIn,
                    userId,
                    refreshToken,
                }))
            }
            return res.status(403).json({message: "Hết phiên đăng nhập, Vui lòng đăng nhập lại"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    me = async (req, res, next) => {
        try {
            let userId = req.user.userId ? parseInt(req.user.userId) : null;
            if(!userId) throw UserNotFound;
            let user = await User.findOne({
                where: {
                    id: userId
                },
                include: [
                    {
                        model: Parent,
                        as: "parent",
                    },
                    {
                        model: Student,
                        as: "student",
                    },
                    {
                        model: Teacher,
                        as: "teacher",
                    }
                ],
                attributes: [
                    "id",
                    "userName",
                    "en_userName",
                    "en_email",
                    "password",
                    "role",
                    "active",
                    "createdAt",
                    "updatedAt",
                    "messageToken"
                ]
            });
            if(!user) throw UserNotFound;
            await new UserService().attachDecodeField(user);
            await new UserService().attachDecodeField(user.student);
            await new UserService().attachDecodeField(user.parent);
            await new UserService().attachDecodeField(user.teacher);
            // console.log("decode ===", user);
            await new UserService().attachRoleInfo(user);
            
            return res.status(200).json(await new AesService().getTransferResponse(user));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    initForgetPassword = async (req, res, next) => {
        try {
            let authService = new AuthService();
            let email = req.body.email || null;
            if(!email) throw EmailEmpty;
            if(!Validation.checkValidEmailFormat(email)) throw EmailFormatNotValid;

            await authService.initForgotPassword(email);
            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateForgetPassword = async (req, res, next) => {
        try {
            let authService = new AuthService();
            let resetKey = req.body.resetKey  || null;
            let password = req.body.password  || null;
            let confirmPassword = req.body.confirmPassword  || null;
            
            if(!password || !confirmPassword) throw PasswordEmpty;
            if(password != confirmPassword) throw ConfirmPasswordNotMatch;

            await authService.updateForgetPassword(resetKey, password);
            
            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    verifyOtp = async (req, res, next) => {
        try {
            let otp = req.body.otp;
            let email = req.body.email
            let user = await User.findOne(
                {
                    where: {
                        email: email,
                    }
                }
            );
            if(!user) return UserNotFound;
            let resp = await new OtpService().verifyOtp(user, otp);
            if(!resp.success && !resp.expired) return res.status(403).json({message: "OTP đã hết hạn", code: "otp_expired", ...resp});
            if(!resp.success && resp.expired) return res.status(403).json({message: "OTP không trùng khớp", code: "otp_not_correct", ...resp});

            if(resp.success && resp.expired) return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công", code: "success", ...resp}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    googleAuthentication = async (req, res, next) => {
        try {
            const { idToken } = req.body;
              
            // idToken = eyJhbGciOiJSUzI1NiIsImtpZCI6IjI1ZjgyMTE3MTM3ODhiNjE0NTQ3NGI1MDI5YjAxNDFiZDViM2RlOWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyNDU4OTEzNzI5MjgtZzE3NmVsZmZuaGE4ajJpZmNrNDVzNXJtNzFiNmQ0bmIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyNDU4OTEzNzI5MjgtZzE3NmVsZmZuaGE4ajJpZmNrNDVzNXJtNzFiNmQ0bmIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMzNzIzMjQxNzk0MjY3Njc3MzAiLCJlbWFpbCI6Im5ndXllbmhpZXUwMjExMTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiI5UlJiU3Fta0JtTDdEcVNUZl9IOVR3Iiwibm9uY2UiOiJJM3VvSGRjRGdJcmFSRzJKbENJUl9CWmx6YnNlaWFSclVEYlVlUW1DX1ZBIiwibmFtZSI6Ik5ndXnhu4VuIEhp4bq_dSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLWTQ1aVpNTHFJNlJxcktmanB1Tl9idGs5LURidmp1RkI5Y1o4X2FmUXFPYmEyREU0PXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Ik5ndXnhu4VuIiwiZmFtaWx5X25hbWUiOiJIaeG6v3UiLCJpYXQiOjE3NDExMDI0NDEsImV4cCI6MTc0MTEwNjA0MX0.t10_Q0mV0wtozj98MuzLOAOhuOjwOXoKcN1FkNg5jf0CSpCXufbpbXaLGVdmPmbH-fA1cC1wh8wO27xcq7QMB08QkHGlgLkpi4S7HilOV_xyz1QNIGvXmpb2AmShOP42uDrK41qlYvtEBL0BGF5ovFV8wcxDBCckEixhPp4WQBrwwWZINt0-DW4YgEc1KzRWfc3nllgjqYQ6TSSwfbCacbS9PhCutQiXkbWBSSukNH2LWqX9dE7uYZqLk51TJsvqWWJe8MKNJEjyETrV472GbdetsBISTJe2QV4y8Y9F0zsE0V_8sBLU-8eTL1rYlEEh5oS3GEI2EKUivESLSfZRdg
            const resp = await new GoogleAuth().googleLogin(idToken);
            if(!resp.action) return res.status(403).json({message: "Login Failed"});

            return res.status(200).json(await new AesService().getTransferResponse({
                ...resp,
                message: "Login Successfully"
            }));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    test = async (req, res, next) => {
        try {
            let env = process.env.NODE_ENV;
            let data = {
                environment: env,
                config: config[env]
            }
            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new AuthController();