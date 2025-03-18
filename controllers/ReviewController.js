const { InputInfoEmpty } = require("../constants/message");
const { UserRole } = require("../constants/roles");
const { ReviewType } = require("../constants/type");
const { ErrorService } = require("../services/errorService");
const { ParentStudentService } = require("../services/parentStudentService/parentStudentService");
const { ReviewService } = require("../services/review/reviewSerivce");
const { AesService } = require("../services/security/AesService");
const Review = require("../models").Review;
const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;
const Attendance = require("../models").Attendance;
const TeacherClass = require("../models").TeacherClass;


class ReviewController {
    getAttendanceReviews = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let classId = req.query.classId ? parseInt(req.query.classId) : 0;
            let studentId = req.query.studentId ? parseInt(req.query.studentId) : 0;

            let user = req.user;
            if(!classId) throw InputInfoEmpty;
            let data = await Attendance.paginate({
                page: page,
                paginate: perPage,
                where: {
                    classId: classId,
                },
                order: [["id","desc"]],
                include: [
                    {
                        model: Review,
                        as: "reviews",
                        order: [["id", "asc"]]
                    }
                ]
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

    teacherGetAttendanceReviews = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let classId = req.query.classId ? parseInt(req.query.classId) : 0;
            let studentId = req.query.studentId ? parseInt(req.query.studentId) : 0;

            let user = req.user;
            if(!classId) throw InputInfoEmpty;
            let teacher = await Teacher.findOne({
                where: {
                    userId: user.userId
                }
            });
            let checkTeacher = await TeacherClass.findOne({where: {
                teacherId: teacher.id,
                classId: classId
            }});
            if(!checkTeacher) return res.status(403).json({message: 'Bạn không dạy lớp này'});
            let data = await Attendance.paginate({
                page: page,
                paginate: perPage,
                where: {
                    classId: classId,
                },
                order: [["id","desc"]],
                include: [
                    {
                        model: Review,
                        as: "reviews",
                        order: [["id", "asc"]]
                    }
                ]

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

    studentGetAttendanceReviews = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let classId = req.query.classId ? parseInt(req.query.classId) : 0;
            let studentId = req.query.studentId ? parseInt(req.query.studentId) : 0;

            let user = req.user;
            let conds = [];
            if(!classId) throw InputInfoEmpty;
            let student = await Student.findOne({
                where: {
                    userId: user.userId
                }
            });

            let data = await Attendance.paginate({
                page: page,
                paginate: perPage,
                where: {
                    classId: classId,
                },
                order: [["id","desc"]],
                include: [
                    {
                        model: Review,
                        as: "reviews",
                        order: [["id", "asc"]]
                    }
                ]
            });

            await new ReviewService().attachSpecificReviewForStudentAttendance(data.docs, student.id);

            data.currentPage = page;

            return res.status(200).json(await new AesService().getTransferResponse(data));

        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    parentGetAttendanceReviews = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let classId = req.query.classId ? parseInt(req.query.classId) : 0;
            let studentId = req.query.studentId ? parseInt(req.query.studentId) : 0;

            let user = req.user;
            let role = user.role;
            let conds = [];
            if(!classId || !studentId) throw InputInfoEmpty;
            let parent = await Parent.findOne({
                where: {
                    userId: user.userId
                }
            });
            if(!await new ParentStudentService().checkConnect(parent.id, studentId)) return res.status(403).json({message: "Đây không phải là con của bạn"});
            let data = await Attendance.paginate({
                page: page,
                paginate: perPage,
                where: {
                    classId: classId,
                },
                order: [["id","desc"]],
                include: [
                    {
                        model: Review,
                        as: "reviews",
                        order: [["id", "asc"]]
                    }
                ]
            });

            await new ReviewService().attachSpecificReviewForStudentAttendance(data.docs, studentId);

            data.currentPage = page;

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createReviews = async (req, res, next) => {
        try {
            let data = req.body;
            let user = req.user;
            if(user.role != UserRole.Teacher && user.role != UserRole.Admin) return res.status(433).json({message: "Bạn không đủ quyền thực hiện thao tác này"});
            if(!data.attendanceId) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            let attendance = await Attendance.findByPk(data.attendanceId);
            if(!attendance) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            if(user.role === UserRole.Teacher) {
                let teacher = await Teacher.findOne({
                    where: {
                        userId: user.userId
                    }
                });
                let checkTeacher = await TeacherClass.findOne({where: {
                    teacherId: teacher.id,
                    classId: attendance.classId
                }});
                if(!checkTeacher) return res.status(403).json({message: 'Bạn không dạy lớp này'});
            }
            let review = await Review.findOne({
                where: {
                    attendanceId: data.attendanceId
                }
            });
            if(review) return res.status(403).json({message: "Buổi điểm danh này đã có đánh giá"});
            let built = await new ReviewService().splitUpdateData({
                ...data,
                classId: attendance.classId
            });
            await Review.bulkCreate(built);

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateReviews = async (req, res, next) => {
        try {
            let data = req.body;
            let user = req.user;
            if(user.role != UserRole.Teacher && user.role != UserRole.Admin) return res.status(433).json({message: "Bạn không đủ quyền thực hiện thao tác này"});
            if(!data.attendanceId) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            let attendance = await Attendance.findByPk(data.attendanceId);
            if(!attendance) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            if(user.role === UserRole.Teacher) {
                let teacher = await Teacher.findOne({
                    where: {
                        userId: user.userId
                    }
                });
                let checkTeacher = await TeacherClass.findOne({where: {
                    teacherId: teacher.id,
                    classId: attendance.classId
                }});
                if(!checkTeacher) return res.status(403).json({message: 'Bạn không dạy lớp này'});
            }
            let review = await Review.findOne({
                where: {
                    attendanceId: data.attendanceId
                }
            });
            if(!review) return res.status(403).json({message: "Đánh giá không tồn tại"});
            let built = await new ReviewService().splitUpdateData({
                ...data,
                classId: attendance.classId
            });            
            await Review.destroy({
                where: {
                    attendanceId: data.attendanceId,
                    classId: attendance.classId
                }
            })

            await Review.bulkCreate(built);

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    deleteReviews = async (req, res, next) => {
        try {
            let attendanceId = req.params.id ? parseInt(req.params.id) : 0;
            let user = req.user;
            if(user.role != UserRole.Teacher && user.role != UserRole.Admin) return res.status(433).json({message: "Bạn không đủ quyền thực hiện thao tác này"});
            if(!attendanceId) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            let attendance = await Attendance.findByPk(attendanceId);
            if(!attendance) return res.status(403).json({message: "Buổi điểm danh không tồn tại"});
            if(user.role === UserRole.Teacher) {
                let teacher = await Teacher.findOne({
                    where: {
                        userId: user.userId
                    }
                });
                let checkTeacher = await TeacherClass.findOne({where: {
                    teacherId: teacher.id,
                    classId: attendance.classId
                }});
                if(!checkTeacher) return res.status(403).json({message: 'Bạn không dạy lớp này'});
            }
            
            await Review.destroy({
                where: {
                    attendanceId: data.attendanceId,
                    classId: data.classId
                }
            })

            return res.status(200).json(await new AesService().getTransferResponse({message: "Thành công"}));
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new ReviewController();