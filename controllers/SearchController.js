const { Op } = require("sequelize");
const { TimeHandle } = require("../utils/timeHandle");
const { ClassStatus } = require("../constants/status");
const { AesService } = require("../services/security/AesService");

const Student = require("../models").Student;
const Parent = require("../models").Parent;
const Teacher = require("../models").Teacher;
const Class = require("../models").Class;
const Center = require("../models").Center;
const Attendance = require("../models").Attendance;
const TeacherClass = require("../models").TeacherClass;
const Schedule = require("../models").Schedule;
const Program = require("../models").Program;


class SearchController {
    searchStudent = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Student.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "userId"],
                limit: 20
            });

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchParent = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Parent.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "userId"],
                limit: 20
            });

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchTeacher = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Teacher.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "userId"],
                limit: 20
            });

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchClass = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Class.findAll({
                where: {
                    code: {
                        [Op.iLike]: `%${keyword}%`
                    },
                    status: {
                        [Op.ne]: ClassStatus.Disable
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "code"],
                limit: 20
            });

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchCenter = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Center.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${keyword}%`
                    }
                },
                order: [["id", "desc"]],
                attributes: ["id", "name", "address"],
                limit: 20
            });

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchSchedule = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Schedule.findAll({
                order: [["id", "desc"]],
                limit: 50
            });

            for(let schedule of (data || [])) {
                TimeHandle.attachDayLabel(schedule);
            }

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchProgram = async (req, res ,next) => {
        try {
            let keyword = req.query.keyword || "";
            
            let data = await Program.findAll({
                order: [["id", "desc"]],
                limit: 50
            });

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchTeacherWork = async (req, res ,next) => {
        try {
            let month = req.query.month ? parseInt(req.query.month) : null;
            let year = req.query.year ? parseInt(req.query.year) : null;
            let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, year);
            let attendances = await Attendance.findAll(
                {
                    where: {
                        [Op.and]: [
                            {date: {
                                [Op.gte]: first
                            }},
                            {date: {
                                [Op.lte]: last
                            }},
                        ]
                    },
                    attributes: ["id", "classId"]
                }
            );

            let classIds = [...new Set(attendances.map(item => item.classId).filter(val => val))];
            let teacherClass = await TeacherClass.findAll({
                where: {
                    classId: {
                        [Op.in]: classIds
                    }
                },
                attributes: ["id", "teacherId"]
            });
            let teacherIds = [...new Set(teacherClass.map(item => item.teacherId).filter(val => val))];

            let teachers = await Teacher.findAll({
                where: {
                    id: {
                        [Op.in]: teacherIds
                    }
                },
                attributes: ["id", "name", "userId"]
            })

            return res.status(200).json(await new AesService().getTransferResponse(teachers));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchClassWork = async (req, res ,next) => {
        try {
            let month = req.query.month ? parseInt(req.query.month) : null;
            let year = req.query.year ? parseInt(req.query.year) : null;
            let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, year);
            let attendances = await Attendance.findAll(
                {
                    where: {
                        [Op.and]: [
                            {date: {
                                [Op.gte]: first
                            }},
                            {date: {
                                [Op.lte]: last
                            }},
                        ]
                    },
                    attributes: ["id", "classId"]
                }
            );

            console.log(attendances);

            let classIds = [...new Set(attendances.map(item => item.classId).filter(val => val))];
            let data = await Class.findAll({
                where: {
                    id: {
                        [Op.in]: classIds
                    }
                },
                attributes: ["id", "name", "code"]
            })

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }

    searchStudentWork = async (req, res ,next) => {
        try {
            let month = req.query.month ? parseInt(req.query.month) : null;
            let year = req.query.year ? parseInt(req.query.year) : null;
            let classId = req.query.classId ? parseInt(req.query.classId) : null;
            let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, year);
            let attendances = await Attendance.findAll(
                {
                    where: {
                        [Op.and]: [
                            {date: {
                                [Op.gte]: first
                            }},
                            {date: {
                                [Op.lte]: last
                            }},
                            {
                                classId: classId
                            },
                        ]
                    },
                    attributes: ["id", "classId", "studentIds"],
                    logging: true
                }
            );

            let studentIds = [];
            for(let item of attendances) {
                studentIds.push(...item.studentIds);
            }
            studentIds = [... new Set(studentIds)];

            let data = await Student.findAll({
                where: {
                    id: {
                        [Op.in]: studentIds
                    }
                },
                attributes: ["id", "name", "userId"]
            })

            return res.status(200).json(await new AesService().getTransferResponse(data));
        }
        catch (err) {
            console.error(err);
            return res.status(200).json(await new AesService().getTransferResponse([]))
        }
    }
}

module.exports = new SearchController();