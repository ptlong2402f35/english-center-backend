const { ClassStatusInvalid, ClassHasOpened, ClassHasEnoughStudent, OpenClassCreateStartAtNotValid, CenterNotFound } = require("../../constants/message");
const { ClassStatus } = require("../../constants/status");
const { sequelize } = require("../../models");

const Class = require("../../models").Class;
const StudentClass = require("../../models").StudentClass;

class ClassCreateService {
    constructor () {}
    
    
    async createClass(data) {
        try {
            if(!await this.validate(data)) return;

            //update class register
            let transaction = await sequelize.transaction();
            try {
                await this.createClassInstance(data);
                await transaction.rollback();
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

    async validate(data) {
        try {
            if(data.startAt > new Date()) throw OpenClassCreateStartAtNotValid;
            if(!data.centerId) throw CenterNotFound;
            return true;
        }
        catch (err) {
            throw err;
        }
    }

    async createClassInstance(data, transaction) {
        let initTrans = false;
        if(!transaction) {
            transaction = await sequelize.transaction();
            initTrans = true;
        }
        try {
            await Class.create(
                data,
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
}
module.exports = {
    ClassCreateService
}