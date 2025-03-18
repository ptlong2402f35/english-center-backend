const { Op } = require("sequelize");
const { UserNotFound, NotEnoughPermission, InputInfoEmpty, AdminOnly } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { RequestStatus } = require("../constants/status");
const { ConnectionService } = require("../services/connection/connectionService");
const { ErrorService } = require("../services/errorService");
const { RequestService } = require("../services/request/requestService");
const { CommunicationService } = require("../services/communication/communicationService");
const { NotificationType } = require("../constants/type");
const { UserService } = require("../services/user/userService");
const { AesService } = require("../services/security/AesService");
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Request = require("../models").Request;
const ParentStudent = require("../models").ParentStudent;

class RequestController {
    getMyRequest = async (req, res, next) => {
        try {
            let userId = req.user.userId;
            let roleId = req.user.role;
            let status = req.query.status ? parseInt(req.query.status) : null;
            let roleObj;
            if(roleId === UserRole.Student) {
                roleObj = await Student.findOne(
                    {
                        where: {
                            userId: userId,
                        }
                    }
                );
                let requests = await Request.findAll(
                    {
                        where: {
                            studentId: roleObj.id,
                            ...(status ? {
                                status: status
                            } : {})
                        },
                        order: [["id", "desc"]],
                        include: [
                            {
                                model: Student,
                                as: "requestByStudent"
                            },
                            {
                                model: Parent,
                                as: "requestByParent"
                            }
                        ]
                    }
                );
                await new RequestService().attachRequestUser(requests);
                for(let rq of requests) {
                    await new UserService().handleHidenInfo(rq.requestByStudent);
                    await new UserService().handleHidenInfo(rq.requestByParent);
                    await new UserService().handleHidenInfo(rq.requestUser);

                }

                return res.status(200).json(await new AesService().getTransferResponse(requests));
            }
            if(roleId === UserRole.Parent) {
                roleObj = await Parent.findOne(
                    {
                        where: {
                            userId: userId,
                        }
                    }
                );
                let requests = await Request.findAll(
                    {
                        where: {
                            parentId: roleObj.id,
                            ...(status ? {
                                status: status
                            } : {})
                        },
                        order: [["id", "desc"]],
                        include: [
                            {
                                model: Student,
                                as: "requestByStudent"
                            },
                            {
                                model: Parent,
                                as: "requestByParent"
                            }
                        ]

                    }
                );

                await new RequestService().attachRequestUser(requests);
                for(let rq of requests) {
                    await new UserService().handleHidenInfo(rq.requestByStudent);
                    await new UserService().handleHidenInfo(rq.requestByParent);
                    await new UserService().handleHidenInfo(rq.requestUser);

                }

                return res.status(200).json(await new AesService().getTransferResponse(requests));
            }
            
            return res.status(403).json({message: "Chức năng chỉ dành cho học sinh và phụ huynh"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getRequestDetail = async (req, res, next) => {
        try {
            let requestId = req.params.id ? parseInt(req.params.id) : null;
            let userId = req.user.userId;
            let roleId = req.user.role;
            let roleObj;
            if(roleId === UserRole.Student) {
                roleObj = await Student.findOne(
                    {
                        where: {
                            userId: userId,
                        }
                    }
                );
                let requests = await Request.findOne(
                    {
                        where: {
                            studentId: roleObj.id,
                            id: requestId
                        }
                    }
                );

                return res.status(200).json(await new AesService().getTransferResponse(requests));
            }
            if(roleId === UserRole.Parent) {
                roleObj = await Parent.findOne(
                    {
                        where: {
                            userId: userId,
                        }
                    }
                );
                let requests = await Request.findOne(
                    {
                        where: {
                            parentId: roleObj.id,
                            id: requestId
                        }
                    }
                );

                return res.status(200).json(await new AesService().getTransferResponse(requests));
            }

            return res.status(403).json({message: "Chức năng chỉ dành cho học sinh và phụ huynh"})

        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createConnect = async (req, res, next) => {
        try {
            let user = req.user;
            let targetId = req.body.targetId;
            let communicationService = new CommunicationService();
            if(user.role === UserRole.Parent) {
                let roleObj = await Parent.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                let student = await Student.findByPk(targetId);
                if(!student) return res.status(403).json({message: "Học sinh không tồn tại"});
                let request = await Request.findOne(
                    {
                        where: {
                            studentId: targetId,
                            parentId: roleObj.id,
                            status: {
                                [Op.in]: [RequestStatus.Pending]
                            }
                        }
                    }
                );
                if(request) return res.status(403).json({message: "Yêu cầu này đã tồn tại"});
                let connect = await ParentStudent.findOne(
                    {
                        where: {
                            studentId: targetId,
                            parentId: roleObj.id
                        }
                    }
                );
                if(connect) return res.status(403).json({message: "Liên kết đã tồn tại"});

                await Request.create(
                    {
                        studentId: targetId,
                        parentId: roleObj.id,
                        status: RequestStatus.Pending,
                        requestByRoleId: UserRole.Parent
                    }
                );

                communicationService.sendNotificationToUserId(
                    student.userId,
                    "Phụ huynh gửi lời mời kết nối",
                    `Phụ huynh ${roleObj.name || roleObj.phone} gửi bạn lời mời kết nối, vui lòng kiểm tra`,
                    NotificationType.Request
                );

                communicationService.sendMobileNotification(
                    student.userId,
                    "Phụ huynh gửi lời mời kết nối",
                    `Phụ huynh ${roleObj.name || roleObj.phone} gửi bạn lời mời kết nối, vui lòng kiểm tra`,
                );

                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}))
            }
            if(user.role === UserRole.Student) {
                let roleObj = await Student.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                let parent = await Parent.findByPk(targetId);
                if(!parent) return res.status(403).json({message: "Phụ huynh không tồn tại"});
                let request = await Request.findOne(
                    {
                        where: {
                            studentId: roleObj.id,
                            parentId: targetId,
                            status: {
                                [Op.in]: [RequestStatus.Pending]
                            }
                        }
                    }
                );
                if(request) return res.status(403).json({message: "Yêu cầu này đã tồn tại"});
                let connect = await ParentStudent.findOne(
                    {
                        where: {
                            studentId: roleObj.id,
                            parentId: targetId
                        }
                    }
                );
                if(connect) return res.status(403).json({message: "Liên kết đã tồn tại"});
                await Request.create(
                    {
                        studentId: roleObj.id,
                        parentId: targetId,
                        status: RequestStatus.Pending,
                        requestByRoleId: UserRole.Student
                    }
                );

                communicationService.sendNotificationToUserId(
                    parent.userId,
                    "Học sinh gửi lời mời kết nối",
                    `Học sinh ${roleObj.name || roleObj.phone} gửi bạn lời mời kết nối, vui lòng kiểm tra`,
                    NotificationType.Request
                );

                communicationService.sendMobileNotification(
                    parent.userId,
                    "Học sinh gửi lời mời kết nối",
                    `Học sinh ${roleObj.name || roleObj.phone} gửi bạn lời mời kết nối, vui lòng kiểm tra`,
                );

                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}))
            }

            return res.status(403).json({message: "Chức năng chỉ dành cho học sinh và phụ huynh"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateRequestStatus = async (req, res, next) => {
        try {
            let requestId = req.params.id ? parseInt(req.params.id) : null;
            let status = req.body.status;
            let communicationService = new CommunicationService();
            if(!requestId || !status) throw InputInfoEmpty;
            let user = req.user
            if(user.role === UserRole.Parent) {
                let roleObj = await Parent.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                let request = await Request.findOne(
                    {
                        where: {
                            parentId: roleObj.id,
                            id: requestId
                        }
                    }
                );
                let student = await Student.findOne({
                    where: {
                        id: request.studentId
                    }
                });
                if(!student) return res.status(403).json({message: "Học sinh không tồn tại"});
                if(!request) return res.status(403).json({message: "Yêu cầu không tồn tại"});
                if(request.requestByRoleId === user.role) return res.status(403).json({message: "Bạn là người đưa ra yêu cầu, không thể thay đổi trạng thái"});
                await request.update(
                    {
                        status: status,
                        createdAt: new Date()
                    }
                );

                if(status === RequestStatus.Accept) {
                    if(!await new ConnectionService().checkStudentParentConnect(request.studentId, roleObj.id)) {
                        await ParentStudent.create(
                            {
                                studentId: request.studentId,
                                parentId: roleObj.id
                            }
                        );
                        communicationService.sendNotificationToUserId(
                            student.userId,
                            "Phụ huynh chấp nhận lời mời kết nối",
                            `Phụ huynh ${roleObj.name || roleObj.phone} chấp nhận lời mời kết nối, vui lòng kiểm tra`,
                            NotificationType.Request
                        );

                        communicationService.sendMobileNotification(
                            student.userId,
                            "Phụ huynh chấp nhận lời mời kết nối",
                            `Phụ huynh ${roleObj.name || roleObj.phone} chấp nhận lời mời kết nối, vui lòng kiểm tra`,
                        );
                    }
                }

                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
            }
            if(user.role === UserRole.Student) {
                let roleObj = await Student.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                let request = await Request.findOne(
                    {
                        where: {
                            studentId: roleObj.id,
                            id: requestId
                        }
                    }
                );
                let parent = await Parent.findOne({
                    where: {
                        id: request.parentId
                    }
                });
                if(!parent) return res.status(403).json({message: "Phụ huynh không tồn tại"});
                if(!request) return res.status(403).json({message: "Yêu cầu không tồn tại"});
                if(request.requestByRoleId === user.role) return res.status(403).json({message: "Bạn là người đưa ra yêu cầu"});
                await request.update(
                    {
                        status: status,
                        createdAt: new Date()
                    }
                );
                if(status === RequestStatus.Accept) {
                    if(!await new ConnectionService().checkStudentParentConnect(roleObj.id, request.parentId)) {
                        await ParentStudent.create(
                            {
                                studentId: request.studentId,
                                parentId: request.parentId
                            }
                        );
                        communicationService.sendNotificationToUserId(
                            parent.userId,
                            "Học sinh chấp nhận lời mời kết nối",
                            `Học sinh ${roleObj.name || roleObj.phone} chấp nhận lời mời kết nối, vui lòng kiểm tra`,
                            NotificationType.Request
                        );
                        communicationService.sendMobileNotification(
                            parent.userId,
                            "Học sinh chấp nhận lời mời kết nối",
                            `Học sinh ${roleObj.name || roleObj.phone} chấp nhận lời mời kết nối, vui lòng kiểm tra`,
                        );
                    }
                }

                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
            }

            return res.status(403).json({message: "Chức năng chỉ dành cho học sinh và phụ huynh"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    removeConnect = async (req, res, next) => {
        try {
            let targetId = req.body.targetId;
            let user = req.user;
            if(!targetId) throw InputInfoEmpty;
            if(user.role === UserRole.Parent) {
                let roleObj = await Parent.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                let student = await Student.findByPk(targetId);
                if(!student) return res.status(200).json(await new AesService().getTransferResponse({message: "Học sinh không tồn tại"}));
                await ParentStudent.destroy(
                    {
                        where: {
                            parentId: roleObj.id,
                            studentId: student.id
                        }
                    }
                );

                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
            }
            if(user.role === UserRole.Student) {
                let roleObj = await Student.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                let parent = await Parent.findByPk(targetId);
                if(!parent) return res.status(200).json(await new AesService().getTransferResponse({message: "Phụ huynh không tồn tại"}));
                await ParentStudent.destroy(
                    {
                        where: {
                            studentId: roleObj.id,
                            parentd: targetId
                        }
                    }
                );

                return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
            }

            return res.status(403).json({message: "Chức năng chỉ dành cho học sinh và phụ huynh"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminGetRequest = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let status = req.query.status || null;
            let parentId = req.query.parentId ? parseInt(req.query.parentId) : null;
            let studentId = req.query.studentId ? parseInt(req.query.studentId) : null;

            let conds = [];
            if(status) {
                conds.push({status: status});
            }
            if(parentId) {
                conds.push({parentId: parentId});
            }
            if(studentId) {
                conds.push({studentId: studentId});
            }

            let data = await Request.paginate({
                page: page,
                paginate: perPage,
                where: {
                    [Op.and]: conds
                },
                order: [["id", "desc"]]
            });

            data.currentPage = page;

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminCreateConnect = async (req, res, next) => {
        try {
            let studentId = req.body.studentId;
            let parentId = req.body.parentId;
            let communicationService = new CommunicationService();
            if(!studentId || !parentId) throw InputInfoEmpty;

            if(await new ConnectionService().checkStudentParentConnect(studentId, parentId)) return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));

            // let count = await Request.create(
            //     {
            //         studentId,
            //         parentId,
            //         status: RequestStatus.Accept,
            //         requestByRoleId: UserRole.Admin
            //     }
            // );

            await ParentStudent.create(
                {
                    studentId,
                    parentId
                }
            );

            let noti = async () => {
                let student = await Student.findByPk(studentId);
                let parent = await Parent.findByPk(parentId);
                communicationService.sendNotificationToUserId(
                    student.userId,
                    "Bạn đã liên kết với phụ huynh",
                    `Bạn đã liên kết với phụ huynh ${parent.name || parent.phone}`,
                    NotificationType.Request
                );
                communicationService.sendNotificationToUserId(
                    parent.userId,
                    "Bạn đã liên kết với học sinh",
                    `Bạn đã liên kết với học sinh ${student.name || student.phone}`,
                    NotificationType.Request
                );
                communicationService.sendMobileNotification(
                    student.userId,
                    "Bạn đã liên kết với phụ huynh",
                    `Bạn đã liên kết với phụ huynh ${parent.name || parent.phone}`,
                );
                communicationService.sendMobileNotification(
                    parent.userId,
                    "Bạn đã liên kết với học sinh",
                    `Bạn đã liên kết với học sinh ${student.name || student.phone}`,
                );
            }

            noti().catch(err => console.error(err));

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}))
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminRemoveConnect = async (req, res, next) => {
        try {
            let studentId = req.body.studentId || null;
            let parentId = req.body.parentId || null;
            if(!studentId || !parentId) throw InputInfoEmpty;

            let count = await ParentStudent.destroy(
                {
                    where: {
                        studentId,
                        parentId
                    }
                }
            );

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}))
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new RequestController();