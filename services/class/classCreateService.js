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
            let builtData = await this.build(data);
            //update class register
            let resp = null;
            let transaction = await sequelize.transaction();
            try {
                resp = await this.createClassInstance(builtData);
                await transaction.commit();
            }
            catch (err1) {
                await transaction.rollback();
                throw err1;
            }
            return resp;
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
            let resp = await Class.create(
                data,
                {
                    transaction: transaction
                }
            );

            if(initTrans) {
                await transaction.commit();
            }
            return resp;
        }
        catch (err) {
            if(initTrans) {
                await transaction.rollback();
            }
            throw err;
        }
    }

    async build(data) {
        try {
            return (
                {
                    name: data.name,
                    fromAge: data.fromAge,
                    toAge: data.toAge,
                    startAt: data.startAt,
                    endAt: data.endAt,
                    studentQuantity: data.studentQuantity,
                    maxQuantity: data.maxQuantity,
                    fee: data.fee,
                    totalSession: data.totalSession,
                    teachedSession: data.teachedSession,
                    status: data.status,
                    programId: data.programId,
                    centerId: data.centerId,
                    code: data.code
                }
            );
        }
        catch (err) {
            throw err;
        }
    }
}
module.exports = {
    ClassCreateService
}