const { Op } = require("sequelize");
const { UserNotFound, NotEnoughPermission, InputInfoEmpty, AdminOnly } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { RequestStatus } = require("../constants/status");
const { ConnectionService } = require("../services/connection/connectionService");
const { ErrorService } = require("../services/errorService");
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
                        order: [["id", "desc"]]
                    }
                );

                return res.status(200).json(requests);
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
                        order: [["id", "desc"]]

                    }
                );

                return res.status(200).json(requests);
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

                return res.status(200).json(requests);
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

                return res.status(200).json(requests);
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

                return res.status(200).json({message: "Thành công"})
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

                return res.status(200).json({message: "Thành công"})
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
                if(!request) return res.status(403).json({message: "Yêu cầu không tồn tại"});
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
                    }
                }

                return res.status(200).json({message: "Thành công"});
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
                if(!request) return res.status(403).json({message: "Yêu cầu không tồn tại"});
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
                    }
                }

                return res.status(200).json({message: "Thành công"});
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
            let connectId = req.params.id ? parseInt(req.params.id) : null;
            let user = req.user;
            if(!connectId) throw InputInfoEmpty;
            if(user.role === UserRole.Parent) {
                let roleObj = await Parent.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                await ParentStudent.destroy(
                    {
                        where: {
                            parentId: roleObj.id,
                            id: connectId
                        }
                    }
                );

                return res.status(200).json({message: "Thành công"});
            }
            if(user.role === UserRole.Student) {
                let roleObj = await Student.findOne(
                    {
                        where: {
                            userId: user.userId,
                        }
                    }
                );
                await ParentStudent.destroy(
                    {
                        where: {
                            studentId: roleObj.id,
                            id: connectId
                        }
                    }
                );

                return res.status(200).json({message: "Thành công"});
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

            return res.status(200).json(data);
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
            if(!studentId || !parentId) throw InputInfoEmpty;

            if(await new ConnectionService().checkStudentParentConnect(studentId, parentId)) return res.status(200).json({message: "Thành công"});

            let count = await Request.create(
                {
                    studentId,
                    parentId,
                    status: RequestStatus.Accept,
                    requestByRoleId: UserRole.Admin
                }
            );

            await ParentStudent.create(
                {
                    studentId,
                    parentId
                }
            );

            return res.status(200).json({message: "Thành công"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    adminRemoveConnect = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty

            let count = await ParentStudent.destroy(
                {
                    where: {
                        id : id
                    }
                }
            )

            return res.status(200).json({message: "Thành công"})
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new RequestController();