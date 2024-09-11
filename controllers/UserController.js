const { UserNotFound, ConfirmPasswordNotMatch, EmailEmpty, InputInfoEmpty, ExistedEmail } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { AuthService } = require("../services/auth/authService");
const { ErrorService } = require("../services/errorService");
const { UserQuerier } = require("../services/user/userQuerier");
const { UserService } = require("../services/user/userService");
const { UserUpdateService } = require("../services/user/userUpdateService");
const User = require("../models").User;
const Student = require("../models").Student;

class UserController {
    getMyDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
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

    updateDetail = async (req, res, next) => {
        try {
            let data = req.body;
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;

            let user = await User.findByPk();
            if(!user) throw UserNotFound

            await new UserService().updateDetail(data, userId);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updatePassword = async (req, res, next) => {
        try {
            let data = req.body;
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;

            if(!data.oldPassword || !data.password || !data.confirmPassword) throw InputInfoEmpty;
            if(data.password != data.confirmPassword) throw ConfirmPasswordNotMatch;

            await new UserService().updatePassword(data, userId);

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetUsers = async (req, res, next) => {
        try {
            const userQuerier = new UserQuerier();
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let active = req.query.active ? (req.query.active?.trim() === "true" ? true : false) : null;

            let conds = userQuerier.buildWhere({active});
            let attributes = userQuerier.buildAttributes({});
            let include = userQuerier.buildInclude({
                includeParent: true,
                includeStudent: true, 
                includeTeacher: true
            });
            let orderBy = userQuerier.buildSort({});

            let data = await User.paginate({
                page: page,
                paginate: perPage,
                where: {
                    [Op.and]: conds
                },
                attributes: attributes,
                include: include,
                orderBy: orderBy
            });

            data.currentPage = page;

            return res.status(200).json(data)
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetUserDetail = async (req, res, next) => {
        try {
            let userId = req.params.id ? parseInt(req.params.id) : null;
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

    adminCreateUser = async (req, res, next) => {
        try {
            let data = req.body;
            const authSerivce = new AuthService();
            if(!data.userName || !data.password) throw InputInfoEmpty;

            if(!await authSerivce.checkUserNameExist(data.userName)) throw ExistedEmail;

            let resp = await authSerivce.handleCustomerSignup(
                {
                    ...data,
                   
                }
            );

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateUserDetail = async (req, res, next) => {
        try {
            let userId = req.params.id ? parseInt(req.params.id) : null;
            if(!userId) throw UserNotFound;
            let data = req.body;
            await new UserUpdateService().updateDetail(data, userId);

            return res.status(200).json({message: "Thành Công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminDeactiveUser = async (req, res, next) => {
        try {
            let userId = req.params.id ? parseInt(req.params.id) : null;
            if(!userId) throw UserNotFound;
            let active = req.query.active ? (req.query.active?.trim() === "true" ? true : false) : null;
            if(!active && active != false) throw InputInfoEmpty;

            await User.update(
                {
                    active: active,
                    updatedAt: new Date()
                },
                {
                    where: {
                        id: userId
                    }
                }
            );

            return res.status(200).json({message: "Thành Công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new UserController();