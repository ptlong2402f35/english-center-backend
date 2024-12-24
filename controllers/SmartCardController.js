const { UserNotFound, ConfirmPasswordNotMatch, EmailEmpty, InputInfoEmpty, ExistedEmail } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { FirebaseConfig } = require("../firebase/firebaseConfig");
const { AuthService } = require("../services/auth/authService");
const { ErrorService } = require("../services/errorService");
const { UserQuerier } = require("../services/user/userQuerier");
const { UserService } = require("../services/user/userService");
const { UserUpdateService } = require("../services/user/userUpdateService");
const User = require("../models").User;
const Student = require("../models").Student;
const SmartCardUser = require("../models").SmartCardUser;

class SmartCardController {
    getUserDetail = async (req, res, next) => {
        try {
            let cardId = req.params.cardId ? parseInt(req.query.cardId) : null;
            if(!cardId) return res.status(200).json(null);
            
            let user = await SmartCardUser.findOne({
                where: {
                    cardId: cardId
                }
            });

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
            let cardId = data.cardId;
            if(!data || !data.cardId) throw UserNotFound;

            let user = await SmartCardUser.findOne({
                where: {
                    cardId: cardId
                }
            });
            if(!user) throw UserNotFound;

            await SmartCardUser.update(
                {
                    phone: data.phone,
                    name: data.name,
                    point: data.point,
                    publicKey: data.publicKey,
                    image: data.image,
                },
                {
                    where: {
                        cardId: data.cardId
                    }
                }
            );

            return res.status(200).json({message: "DONE"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createCardUser = async (req, res, next) => {
        try {
            let data = req.body;

            let user = await SmartCardUser.create(
                {
                    name: data.name || "",
                    phone: data.phone || "",
                    image: data.image || "",
                    point: data.point || 0,
                    cardId: ""
                }
            );

            await user.update(
                {
                    cardId: "CT" + (100000 + user.id).toString().substring(1),
                }
            );

            return res.status(200).json(user);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    estimatePointByFee = async (req, res, next) => {
        try {
            let data = req.body;
            let fee = data.fee;
            if(!fee || fee < 0) return res.status(200).json({point: 0}); 
            if(fee <= 1000000) {
                let point = fee / 1000 * 15 / 100;
                return res.status(200).json({point: Math.round(point)});
            }
            if(fee <= 5000000) {
                let point = fee / 1000 * 20 / 100;
                return res.status(200).json({point: Math.round(point)});
            }

            let point = fee / 1000 * 25 / 100;
            return res.status(200).json({point: Math.round(point)});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new SmartCardController();