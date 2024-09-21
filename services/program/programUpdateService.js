const { Op } = require("sequelize");
const { ProgramStatus, ClassStatus } = require("../../constants/status");

const StudentClass = require("../../models").StudentClass;
const Program = require("../../models").Program;
const Class = require("../../models").Class;

class ProgramUpdateService {
    constructor() {}

    async doUpdateProgramStatusHandler(programId, status) {
        try {
            let program = await this.prepare(programId);
            if(program.status === status && status === ProgramStatus.Disable) {
                let {classes} = await this.fetchRelation(programId);
                let classIds = classes.map(item => item.id).filter(val => val);
                console.log("classIds", classIds);
                await Class.update(
                    {
                        programId: null,
                        createdAt: new Date()
                    },
                    {
                        where: {
                            id: {
                                [Op.in]: classIds
                            }
                        }
                    }
                )
                await StudentClass.update(
                    {
                        reduceFee: 0
                    },
                    {
                        where: {
                            classId: {
                                [Op.in]: classIds
                            }
                        }
                    }
                )
                
                return;
            }
        }
        catch (err) {
            throw err;
        }
    }

    async prepare(programId) {
        try {
            return await Program.findByPk(programId);
        }
        catch (err) {
            throw err;
        }
    }

    async fetchRelation(programId) {
        try {
            let classes = await Class.findAll({
                where: {
                    [Op.and]: [
                        {programId: programId},
                        {
                            [Op.or]: [
                                {status: ClassStatus.Opening},
                                {status: ClassStatus.UnOpen},
                            ]
                        }
                    ]
                }
            });

            return {
                classes,
            }
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    ProgramUpdateService
}