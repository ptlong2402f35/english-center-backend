const { Op } = require("sequelize");
const { sequelize } = require("../../models");
const User = require("../models").User;
const { AuthService } = require("../services/auth/authService");
const {AuthLogin} = require("../services/auth/authLogin"); 
const { EmailEmpty, PasswordEmpty, InputInfoEmpty, ConfirmPasswordNotMatch, ExistedEmail, ExistedPhone, UserNotFound, EmailFormatNotValid, PhoneFormatNotValid } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { Validation } = require("../utils/validation");
const { TranslateService } = require("../services/translateService");
const SuccessRespMessage = require("../resources/translation.json").message.done;

class AuthController {
    login = async (req, res, next) => {
        try {
            let data = req.body;
            data.userName = data.userName?.trim()?.toLowerCase();
            if(!data.userName) {
                throw EmailEmpty;
            }
            if(!data.password) {
                throw PasswordEmpty;
            }
            let {action, accessToken, refreshToken, expiredIn, userId} = await new AuthLogin().handleLogin(data);
            if(action) {
                return res.status(200).json({
                    message: new TranslateService(req).translateMessage(SuccessRespMessage, true),
                    accessToken,
                    expiredIn,
                    userId,
                    refreshToken,
                })
            }
            throw "";
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

            if(userByUserName) throw ExistedEmail;

            let resp = await new AuthService().handleCustomerSignup(data);

            return res.status(200).json({
                message: new TranslateService(req).translateMessage(SuccessRespMessage, true),
                ...resp,
            })
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    me = async (req, res, next) => {
        try {
            let lang = req.header("lang");
            let userId = req.user.userId ? parseInt(req.user.userId) : null;
            if(!userId) throw UserNotFound;
            let user = await User.findByPk(userId);
            if(!user) throw UserNotFound;
            
            return res.status(200).json(user);
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
            return res.status(200).json({message: new TranslateService(req).translateMessage(SuccessRespMessage, true)});
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
            
            return res.status(200).json({message: new TranslateService(req).translateMessage(SuccessRespMessage, true)});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

}

module.exports = new AuthController();