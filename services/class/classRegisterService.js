const { ClassStatusInvalid, ClassHasOpened, ClassHasEnoughStudent, ClassNotFound } = require("../../constants/message");
const { ClassStatus } = require("../../constants/status");
const { sequelize } = require("../../models");

const Class = require("../../models").Class;
const StudentClass = require("../../models").StudentClass;
const Program = require("../../models").Program;

class ClassRegisterService {
    constructor () {}
    
    
    async register(classId, studentId) {
        try {
            let data = await this.fetch(classId);
            if(!data) throw ClassNotFound;
            if(!await this.validate(data)) return;

            //update class register
            let transaction = await sequelize.transaction();
            try {
                await this.updateStudentClass(
                    {
                        classId,
                        studentId,
                        ...data.dataValues
                    },
                    transaction
                );

                await this.updateClass(data, classId, transaction);

                await transaction.commit();
            }
            catch (err1) {
                await transaction.rollback();
                throw err1;
            }

        }
        catch (err) {
            throw err;
        }
    }

    async unRegister(classId, studentId) {
        try {
            let data = await this.fetch(classId);
            if(!data) throw ClassNotFound;
            // if(!await this.validate(data)) return;

            //update class unregister
            let transaction = await sequelize.transaction();
            try {
                await this.updateStudentClass(
                    {
                        classId,
                        studentId,
                        ...data
                    },
                    transaction,
                    {
                        isRemove: true
                    }
                );

                await this.updateClass(data, classId, transaction, {isRemove: true});

                await transaction.commit();
            }
            catch (err1) {
                await transaction.rollback();
                throw err1;
            }

        }
        catch (err) {
            throw err;
        }
    }

    async fetch (classId) {
        try {
            let classInfo = await Class.findByPk(
                classId,
                {
                    include: [
                        {
                            model: Program,
                            as: "program"
                        }
                    ]
                }
            );

            return classInfo;
        }
        catch (err) {
            throw err;
        }
    }

    async validate(data) {
        try {
            if(data.status != ClassStatus.UnOpen) throw ClassStatusInvalid;
            if(data.startAt < new Date()) throw ClassHasOpened;
            if(data.studentQuantity >= data.maxQuantity) throw ClassHasEnoughStudent;
            return true;
        }
        catch (err) {
            throw err;
        }
    }

    async updateStudentClass(data, transaction, {isRemove} = {}) {
        let initTrans = false;
        if(!transaction) {
            transaction = await sequelize.transaction();
            initTrans = true;
        }
        try {
            if(isRemove) {
                await StudentClass.destroy(
                    {
                        where: {
                            studentId: data?.studentId,
                            classId: data?.classId,
                        }
                    },
                    {
                        transaction: transaction
                    }
                );
                return;
            }
            let reduceFee = 0;
            console.log("conds1", data?.program?.reduceValue);
            console.log("conds2", data?.program?.reducePercent);
            console.log("conds3", data?.fee);
            if(data?.program?.startAt <= new Date() && data?.program?.endAt >= new Date()) {
                reduceFee = data?.program?.reduceValue || (data?.program?.reducePercent * data?.fee / 100) || 0
            }
            console.log("reduce", reduceFee);
            await StudentClass.create(
                {
                    studentId: data?.studentId,
                    classId: data?.classId,
                    offSession: 0,
                    reduceFee: reduceFee
                },
                {
                    transaction: transaction
                }
            );

            if(initTrans) {
                await transaction.commit();
            }
        }
        catch (err) {
            if(initTrans) {
                await transaction.rollback();
            }
            throw err;
        }
    }

    async updateClass(data, classId, transaction, {isRemove} = {}) {
        let initTrans = false;
        if(!transaction) {
            transaction = await sequelize.transaction();
            initTrans = true;
        }
        try {
            await Class.update(
                {
                    studentQuantity: isRemove ? data.studentQuantity -1 : data.studentQuantity + 1,
                    updatedAt: new Date()
                },
                {
                    where: {
                        id: classId
                    },
                    transaction: transaction
                }
            );

            if(initTrans) {
                await transaction.commit();
            }
        }
        catch (err) {
            if(initTrans) {
                await transaction.rollback();
            }
            throw err;
        }
    }
}
module.exports = {
    ClassRegisterService
}