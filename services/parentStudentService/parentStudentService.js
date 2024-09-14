const { NotConnectParent } = require("../../constants/message");

const ParentStudent = require("../../models").ParentStudent;

class ParentStudentService {
    constructor () {

    }

    async checkConnect(parentId, studentId) {
        try {
            let check = await ParentStudent.findOne(
                {
                    where: {
                        parentId,
                        studentId
                    }
                }
            );
            if(!check) throw NotConnectParent;
        }
        catch (err) {
            console.error(err)
            throw err;
        }
    }

}

module.exports = {
    ParentStudentService
}