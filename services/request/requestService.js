const { UserRole } = require("../../constants/roles");

class RequestService {

    async attachRequestUser(requests) {
        try {
            for(let rq of requests) {
                if(rq.requestByRoleId === UserRole.Parent) {
                    // rq.requestByStudent = null;
                    // rq?.setDataValue("requestByStudent", null);
                    rq.requestUser = rq?.requestByStudent;
                    rq?.setDataValue("requestUser", rq?.requestByStudent);
                    continue;
                }
                // rq.requestByParent = null;
                // rq?.setDataValue("requestByParent", null);
                rq.requestUser = rq?.requestByParent;
                rq?.setDataValue("requestUser", rq?.requestByParent);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    RequestService
}