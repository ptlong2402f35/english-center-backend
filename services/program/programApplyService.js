const { Op } = require("sequelize");
const { ClassNotFound, ClassStatusInvalid, ProgramNotFound } = require("../../constants/message");
const { ClassStatus } = require("../../constants/status");

const Class = require("../../models").Class;
const Program = require("../../models").Program;
const StudentClass = require("../../models").StudentClass;

class ProgramApplyService {
    async handleApplyProgram(classId, programId, isRemove) {
        try {
            console.log(programId);
            let {program, classInfo} = await this.prepare(programId, classId);
            if(!classInfo) throw ClassNotFound;
            if(!program) throw ProgramNotFound;
            if(classInfo.status != ClassStatus.UnOpen) throw ClassStatusInvalid;

            await this.updateClass(classInfo, programId, isRemove);
            await this.updateStudentRegisted(program, classInfo);
        }
        catch (err) {
            throw err;
        }
    }

    async updateClass(classInfo, programId, isRemove) {
        try {
                await classInfo.update(
                    {
                        programId: isRemove ? null : programId,
                        updatedAt: new Date()
                    }
                );
                return;
        }

        catch (err) {
            throw err;
        }
    }

    async updateStudentRegisted(program, classInfo) {
        try {
            if(!classInfo.programId) {
                await StudentClass.update(
                    {
                        reduceFee: 0,
                        updatedAt: new Date()
                    },
                    {
                        where: {
                            classId: classInfo.id,
                            createdAt: {
                                [Op.gte] : program.startAt
                            },
                            createdAt: {
                                [Op.lte] : program.endAt
                            }
                        }
                    }
                );
                return;
            }
            let reduceFee = program.reduceValue ? program.reduceValue : (program.reducePercent * classInfo.fee / 100);
            await StudentClass.update(
                {
                    reduceFee: reduceFee,
                    updatedAt: new Date()
                },
                {
                    where: {
                        classId: classInfo.id,
                        createdAt: {
                            [Op.gte] : program.startAt
                        },
                        createdAt: {
                            [Op.lte] : program.endAt
                        }
                    }
                }
            );
        }
        catch (err) {
            throw err;
        }
    }

    async prepare(programId, classId) {
        try {
            let classInfo = await Class.findByPk(classId);
            let program = await Program.findByPk(programId);

            return {
                classInfo,
                program
            }
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    ProgramApplyService
}