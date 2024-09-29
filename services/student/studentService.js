
class StudentService {
    constructor() {}

    async attachUnJoinClassCount(classes, studentId) {
        for(let item of classes) {
            if(!item.attendances || !item.attendances.length) {
                item.unJoinCount = item.teachedSession || 0;
                continue;
            }
            let count = 0;
            for(let att of item.attendances) {
                if(!(att.studentIds || [])?.includes(studentId)) count+=1;
            }
            item.unJoinCount = count;
            item?.setDataValue("unJoinCount", count);
        }
    }
}

module.exports = {
    StudentService
}