
class CostHandler {
    constructor() {}

    async handleGetStudentAttendance(attendances, studentClasses, fee) {
        let studentData = [];
        for(let attendance of attendances) {
            for(let item of attendance.studentIds) {
                let fItem = studentData.find(data => data.studentId === item);
                if(fItem) {
                    fItem.count +=1;
                    continue;
                }
                let fStudent = studentClasses.find(student => student.studentId === item);
                studentData.push({
                    studentId: item,
                    count: 1,
                    fee: 0,
                    originFee: 0,
                    reduceFee: 0,
                    userId: fStudent?.student?.userId || 0,
                    classId: fStudent.classId
                });
            }
        }

        for (let item of studentData) {
            let fItem = studentClasses.find(student => student.studentId === item.studentId);
            if(!fItem) continue;
            let totalFee = (fee - (fItem?.reduceFee || 0)) * item.count;
            item.fee = totalFee;
            item.originFee = fee * item.count;
            item.reduceFee = item.originFee - totalFee;
        }

        return studentData.filter(item => item.userId);
    }

    async handleProcessTeacherSalary(teacherClass, attendances) {
        let ret = [];
        for(let attendance of attendances) {
            let fItem = ret.find(item => item.classId === attendance.classId);
            if(fItem) {
                fItem.count +=1;
                continue;
            }
            let tc = teacherClass.find(item => item.classId === attendance.classId);
            ret.push(
                {
                    classId: attendance.classId,
                    count: 1,
                    fee: tc.salary
                }
            );
        }

        let totalMoney = 0;
        console.log(ret);
        for(let item of ret) {
            totalMoney += item.count * item.fee;
        }

        return totalMoney;
    }
}

module.exports = {
    CostHandler
}