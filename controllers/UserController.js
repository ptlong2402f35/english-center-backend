const { UserNotFound, ConfirmPasswordNotMatch, EmailEmpty, InputInfoEmpty } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { UserService } = require("../services/user/userService");
const User = require("../models").User;

class UserController {
    getMyDetail = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            
            let user = await User.findByPk();
            if(!user) throw UserNotFound
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

            if(!oldPassword || !data.password || !data.confirmPassword) throw InputInfoEmpty;
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
}

module.exports = new UserController();