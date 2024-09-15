const { ClassStatusInvalid, ClassHasOpened, ClassHasEnoughStudent, ClassNotFound } = require("../../constants/message");
const { ClassStatus } = require("../../constants/status");
const { sequelize } = require("../../models");

const Class = require("../../models").Class;
const StudentClass = require("../../models").StudentClass;

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
                        studentId
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

    async fetch (classId) {
        try {
            return Class.findByPk(classId); 
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

    async updateStudentClass(data, transaction) {
        let initTrans = false;
        if(!transaction) {
            transaction = await sequelize.transaction();
            initTrans = true;
        }
        try {
            await StudentClass.create(
                {
                    studentId: data.studentId,
                    classId: data.classId,
                    offSession: 0,
                    reduceFee: 0
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

    async updateClass(data, classId, transaction) {
        let initTrans = false;
        if(!transaction) {
            transaction = await sequelize.transaction();
            initTrans = true;
        }
        try {
            await Class.update(
                {
                    studentQuantity: data.studentQuantity + 1,
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