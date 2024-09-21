const { Op } = require("sequelize");
const { ErrorService } = require("../services/errorService");
const { InputInfoEmpty, ClassNotFound, ClassStatusInvalid } = require("../constants/message");
const { ClassStatus, ProgramStatus } = require("../constants/status");
const { ProgramApplyService } = require("../services/program/programApplyService");
const { ProgramUpdateService } = require("../services/program/programUpdateService");

const Program = require("../models").Program;
const Class = require("../models").Class;

class ProgramController {
    getProgram = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let status = req.query.status ? (req.query.status === "true" ? true: false) : null;
            let fromDate = req.query.fromDate || null;
            let toDate = req.query.toDate || null;

            let conds = []
            if(status || status === false) {
                conds.push(
                    {status: status}
                )
            }
            if(fromDate) {
                conds.push(
                    {startAt: {
                        [Op.gte]: fromDate
                    }}
                )
            }
            if(toDate) {
                conds.push(
                    {endAt: {
                        [Op.lte]: toDate
                    }}
                )
            }

            let data = await Program.paginate({
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

    getProgramDetail = async (req, res, next) => {
        try {
            let programId = req.params.id ? parseInt(req.params.id) : null;
            if(!programId) throw InputInfoEmpty;

            let program = await Program.findByPk(programId);

            return res.status(200).json(program);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createProgram = async (req, res, next) => {
        try {
            let data = req.body;

            let builtData = {
                reducePercent: data.reducePercent,
                reduceValue: data.reduceValue,
                startAt: data.startAt,
                endAt: data.endAt,
                status: ProgramStatus.Active,
            }

            let program = await Program.create(builtData);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateProgram = async (req, res, next) => {
        try {
            let data = req.body;
            let programId = req.params.id ? parseInt(req.params.id) : null;
            if(!programId) throw InputInfoEmpty;
            let builtData = {
                reducePercent: data.reducePercent,
                reduceValue: data.reduceValue,
                startAt: data.startAt,
                endAt: data.endAt,
                status: data.status,
                updatedAt: new Date()
            }

            let program = await Program.findByPk(programId);
            if(!program) return res.status(403).json({message: "Chương trình giảm giá không tồn tại"});

            await Program.update(
                builtData,
                {
                    where: {
                        id: programId
                    }
                }
            );
            //change program status
            if(program.status != data.status) {
                await new ProgramUpdateService().doUpdateProgramStatusHandler(programId, data.status);
            }

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    deactiveProgram = async (req, res, next) => {
        try {
            let data = req.body;
            let programId = req.params.id ? parseInt(req.params.id) : null;
            if(!programId) throw InputInfoEmpty;
            let status = data.status

            let program = await Program.update(
                {
                    status: status,
                    updatedAt: new Date()
                },
                {
                    where: {
                        id: programId
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

    applyProgram = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.programId || !data.classId) throw InputInfoEmpty;

            await new ProgramApplyService().handleApplyProgram(data.classId, data.programId);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    removeProgram = async (req, res, next) => {
        try {
            let data = req.body;
            if(!data.programId || !data.classId) throw InputInfoEmpty;

            new ProgramApplyService().handleApplyProgram(data.classId, data.programId, true);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
    
}

module.exports = new ProgramController();