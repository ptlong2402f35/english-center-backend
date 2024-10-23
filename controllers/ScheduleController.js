const { InputInfoEmpty } = require("../constants/message");
const { sequelize } = require("../models");
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
        try {
            let data = req.body;
            let scheduleId = req.params.id ? parseInt(req.params.id) : null;
            if(!data.date || !data.startAt || !data.endAt || !scheduleId) throw InputInfoEmpty;

            await Schedule.update(data,
                {
                    where: {
                        id: scheduleId
                    }
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

    updateScheduleClass = async (req, res, next) => {
        try {
            let scheduleIds = req.body.scheduleIds || null;
            let classId = req.body.classId ? parseInt(req.body.classId) : null;
            if(!scheduleIds || !classId) throw InputInfoEmpty;
            let t = await sequelize.transaction();
            try {
                await ClassSchedule.destroy({
                    where: {
                      classId: classId
                    },
                    transaction: t
                });
    
                await ClassSchedule.bulkCreate(
                    scheduleIds.map(item => ({
                        classId,
                        scheduleId: item
                    })),
                    {
                        transaction: t
                    }
                );
                await t.commit();
            }
            catch (err1) {
                await t.rollback();
                throw err1;
            }

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