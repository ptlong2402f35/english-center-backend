const { InputInfoEmpty } = require("../constants/message");
const { ErrorService } = require("../services/errorService");
const { TimeHandle } = require("../utils/timeHandle");

const Schedule = require("../models").Schedule;
const ClassSchedule = require("../models").ClassSchedule;

class ScheduleController {
    getSchedule = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;

            let data = await Schedule.paginate({
                page: page,
                paginate: perPage,
                order: [["id", "desc"]]
            });

            data.currentPage = page;

            for (let item of data.docs) {
                TimeHandle.attachDayLabel(item);
            }

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getScheduleDetail = async (req, res, next) => {
        try {
            let id = req.params.id ? parseInt(req.params.id) : null;
            if(!id) throw InputInfoEmpty;
            
            let data = await Schedule.findByPk(id);

            TimeHandle.attachDayLabel(data);

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createSchedule = async (req, res, next) => {
        try {
            let data = req.body;

            if(!data.date || !data.startAt || !data.endAt) throw InputInfoEmpty;

            await Schedule.create(data);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateSchedule = async (req, res, next) => {

    }

    deactiveSchedule = async (req, res, next) => {

    }

    applyScheduleToClass = async (req, res, next) => {
        try {
            let scheduleId = req.body.scheduleId ? parseInt(req.body.scheduleId) : null;
            let classId = req.body.classId ? parseInt(req.body.classId) : null;
            if(!scheduleId || !classId) throw InputInfoEmpty;
            let data = req.body;

            await ClassSchedule.create(data);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    removeScheduleFromClass = async (req, res, next) => {
        try {
            let scheduleId = req.body.scheduleId ? parseInt(req.body.scheduleId) : null;
            let classId = req.body.classId ? parseInt(req.body.classId) : null;
            if(!scheduleId || !classId) throw InputInfoEmpty;

            await Schedule.destroy({
                where: {
                  scheduleId: scheduleId,
                  classId: classId
                },
            });

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new ScheduleController();