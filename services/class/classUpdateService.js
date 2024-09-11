const { UpdateFailMessage } = require("../../constants/message");
const Class = require("../../models").Class;

class classUpdateService {
    constructor() {}

    async updateDetail(data, classId) {
        try {
            let allowData = {
                name: data.name,
                fee: data.fee,
                totalSession: data.totalSession,
                status: data.status,
                programId: data.programId,
                centerId: data.centerId,
                fromAge: data.fromAge,
                toAge: data.toAge,
            };

            let [count] = await Class.update(allowData, {
                where: {
                    id: classId
                }
            });
            if(!count) throw UpdateFailMessage;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    classUpdateService
}