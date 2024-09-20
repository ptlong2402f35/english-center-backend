const ParentStudent = require("../../models").ParentStudent;

class ConnectionService {
    constructor() {}

    async checkStudentParentConnect(studentId, parentId) {
        try {
            let connect = await ParentStudent.findOne({
                where: {
                    studentId: studentId,
                    parentId: parentId
                }
            });

            return connect;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    }

}

module.exports = {
    ConnectionService
}