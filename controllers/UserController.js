const { UserNotFound, ConfirmPasswordNotMatch, EmailEmpty, InputInfoEmpty, ExistedEmail } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { FirebaseConfig } = require("../firebase/firebaseConfig");
const { AuthService } = require("../services/auth/authService");
const { ErrorService } = require("../services/errorService");
const { AesService } = require("../services/security/AesService");
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
            await new UserService().attachDecodeField(user);
            await new UserService().removeEncodeField(user);
            return res.status(200).json(await new AesService().getTransferResponse(user));

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

            let user = await User.findByPk(userId);
            if(!user) throw UserNotFound;

            await new UserUpdateService().updateDetail(data, userId);

            return res.status(200).json(await new AesService().getTransferResponse({message: "DONE"}));
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

            if(!data.password || !data.confirmPassword) throw InputInfoEmpty;
            // if(data.password != data.confirmPassword) throw ConfirmPasswordNotMatch;

            await new UserService().updatePassword(data, userId);

            return res.status(200).json(await new AesService().getTransferResponse({message: "DONE"}));
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
                order: orderBy
            });

            data.currentPage = page;
            for (let item of data.docs) {
                await new UserService().attachDecodeField(item);
                await new UserService().attachDecodeField(item?.parent);
                await new UserService().attachDecodeField(item?.student);
                await new UserService().attachDecodeField(item?.teacher);
                await new UserService().removeEncodeField(item);
                await new UserService().removeEncodeField(item?.parent);
                await new UserService().removeEncodeField(item?.student);
                await new UserService().removeEncodeField(item?.teacher);
            }

            return res.status(200).json(await new AesService().getTransferResponse(data))
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
            await new UserService().attachDecodeField(user);
            await new UserService().removeEncodeField(user);


            return res.status(200).json(await new AesService().getTransferResponse(user));
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
            let {userName, password} = await new UserService().autoGenerateUserAccount(UserRole.Student);
            if(await authSerivce.checkUserNameExist(userName)) throw ExistedEmail;

            let resp = await authSerivce.handleCustomerSignup(
                {
                    ...data,
                    userName,
                    password
                }
            );

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
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

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminUpdateUserPassword = async (req, res, next) => {
        try {
            let userId = req.params.id ? parseInt(req.params.id) : null;
            if(!userId) throw UserNotFound;
            let data = req.body;
            await new UserService().updatePassword(data, userId);

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateUserMessageToken = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            let data = req.body;
            await new UserService().updateMessageToken(userId, data.messageToken);

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    removeUserMessageToken = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            if(!userId) throw UserNotFound;
            let data = req.body;
            await new UserService().updateMessageToken(userId, null);

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành Công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    testNoti = async (req, res, next) => {
        try {
            let firebaseConfig = new FirebaseConfig().getInstance();
            // let token = await firebaseConfig.getAccessToken();
            // console.log("token ===", token);

            let userId = 13;
            //ya29.c.c0ASRK0GYMUzaPG9tbreyzct0Evdofwk2ieNo4WUJ2BHTg86nlnzr_scgmYnTLc91TWh1US48XVlVFqgvmX8AICN_pQjwZJ4vTmXl9GbpC7cUc-Z9Fr3cBgRRV-WB6QscDMmDPpJ2K6XIFKfdVzO_B0JmE0DwwYfyLWU_vLGbDV_kca_46indtRTxZC_7wflHBim2wQnMwTCzBPs-e1ASaPHmg-QrHeci_TqAhpjvdBRIn1EiVFo1mBlPSbYUhAo4pyd5YvF5W_xNxT687VeQ5J1FN-hlaH1fchmX7p2ZLamgAFJUBBO1jFnBzhH-kDuqDKRX0aD6f6iJ_VNyFDpFqft8aRZDNw4ipN_pwZZe5s3DxScpp3VGytINwG385A8XMRvzryd69vf-bVMM4yj6Shc-kFORdQ6sWVcuskkuW3k0u6Ylv7zU3vr17ISq0xsiQ-ubbsu8vdOBx-iW_dOpk899rhzBgyfQd-mj3RdBSXWb4B7afIhMY0jb8Icn-6WOc5owzwxcd1bUw4RXuZfjIat-lJ9tra1gZFaU34nt1eVtJlg3381JY8e5m_nyb_7ZJ2w0gcvh09BzQtOi_2sIvY3U9IapbW7l1Y3_ow1aZpZ63nFt6OZ6zZJXeve2F5YOb_fzepWmt6-b3SI1jr8a8uvw-WM_VmdgxFOcX9WaVg1SmdfreM7ZxkZFn6nBX9BYd5z3_tYgz3jca184gJrwhQqU6n4Jhgbeno21Oi0ZZy8WBza91w3kFm4-8O4OOfUzOlwz53UYxg4awc9Y4FMfpg5jeSIUxWjjkgZ1X-ej6SxeFxZ12Qe9Wy2ni4OXsX0vUI0cUdfcvyy09Wf4eWngzxQsQyzd-2m6tWt_uj1R3-klcI_rqkSVkgpy3Q5MzzhQRhedihO3glzbm9B4Vgmnqz-ZRnQ2Fj4d-t5-euXst7mWF76xkjMB-4arsp7I6jYhgtUjc9gi_JabusWRBU7Y2SFR7lXIMbvdoplixOMzOO1zl409S068hcef
            
            let user= await User.findByPk(userId);
            let msgToken = user.messageToken;

            let resp = await firebaseConfig.createMessage(msgToken, {title:"HIEU LON", body: "TEST body @@"});

            return res.status(200).json(await new AesService().getTransferResponse(resp));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new UserController();