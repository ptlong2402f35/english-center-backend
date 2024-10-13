const { Op } = require("sequelize");
const { ClassStatus } = require("../constants/status");
const { TimeHandle } = require("../utils/timeHandle");
const { CostType } = require("../constants/type");

const User = require("../models").User;
const Parent = require("../models").Parent;
const Student = require("../models").Student;
const Teacher = require("../models").Teacher;
const ParentStudent = require("../models").ParentStudent;
const Class = require("../models").Class;
const Attendance = require("../models").Attendance;
const StudentClass = require("../models").StudentClass;
const Center = require("../models").Center;
const TeacherClass = require("../models").TeacherClass;
const Cost = require("../models").Cost;



class AnalyticController {
    getUserAnalytic = async (req, res, next) => {
        try {
            let classForYear = req.query.classForYear ? parseInt(req.query.classForYear) : 2024;
            let studentClassForYear = req.query.studentClassForYear ? parseInt(req.query.studentClassForYear) : 2024;
            let financeMonthOfYear = req.query.financeMonthOfYear ? parseInt(req.query.financeMonthOfYear) : 2024;
            let financeYear = req.query.financeYear ? parseInt(req.query.financeYear) : 2024;
            let resp = {};
            // user
            let [teacherNumber, parentNumber, studentNumber] = await Promise.all([
                Teacher.count(
                    
                ),
                Parent.count(

                ),
                Student.count(
                    
                ),
            ]);
            resp.teacherNumber = teacherNumber;
            resp.parentNumber = parentNumber;
            resp.studentNumber = studentNumber;
            resp.totalUser = teacherNumber + parentNumber + studentNumber;
            resp.teacherPercent = teacherNumber / resp.totalUser * 100;
            resp.parentPercent = parentNumber / resp.totalUser * 100;
            resp.studentPercent = studentNumber / resp.totalUser * 100;
            
            let centers = await Center.findAll({
                include: {
                    model: Class,
                    as: "classes",
                    attributes: ["id", "name", "startAt", "studentQuantity"],
                    include: [
                        {
                            model: Student,
                            as: "students",
                            attributes: ["id"]
                        }
                    ],
                    order: [["id", "asc"]]
                }
            });

            let allStudents = await Student.findAll({
                order: [["id", "asc"]],
                attributes: ["id", "name", "age"]
            })

            let parentStudent = await ParentStudent.findAll(); 
            let teacherClasses = await TeacherClass.findAll(); 
            let studentClasses = await StudentClass.findAll(); 
            let costs = await Cost.findAll(
                {
                    attributes: ["type", "totalMoney", "timerTime"]
                }
            )

            let numberUserByCenter = [];
            let studentConnect = [];
            let studentAges = [];
            let studentJoinByMonth = [];
            let studentJoinAttendances = [];
            let profitByMonths = [];
            let profitByYears = [];

            for(let item of centers) {
                let curItem = {
                    centerID: item.id,
                    centerName: item.name,
                    studentNumber: 0,
                    parentNumber: 0,
                    teacherNumber: 0
                }

                let studentConnectItem = {
                    centerID: item.id,
                    centerName: item.name,
                    hocsinhlienket: 0,
                    hocsinhkolienket: 0,
                }

                let studentAgeItem = {
                    centerID: item.id,
                    centerName: item.name,
                    studentAges: []
                }

                let studentIds = item.classes.reduce((acc ,cur) => [...new Set([...acc, ...cur.students.map(el => el.id).filter(val => val)])], []);
                let classIds = item.classes.map(el => el.id).filter(val => val);
                let parentStudents = parentStudent.filter(el => studentIds.includes(el.studentId));
                let parentIds = [...new Set(parentStudents.map(el => el.parentId).filter(val => val))];
                let connectStudentIds = [...new Set(parentStudents.map(el => el.studentId).filter(val => val))];
                let teacherClass = teacherClasses.filter(el => classIds.includes(el.classId));
                let teacherIds = [...new Set(teacherClass.map(el => el.teacherId).filter(val => val))];

                //attach
                curItem.studentNumber = studentIds.length;
                curItem.parentNumber = parentIds.length;
                curItem.teacherNumber = teacherIds.length;
                numberUserByCenter.push(curItem);
                // student connect
                studentConnectItem.hocsinhlienket = connectStudentIds.length;
                studentConnectItem.hocsinhkolienket = curItem.studentNumber - connectStudentIds.length;
                studentConnect.push(studentConnectItem)
                // student ages
                let filterStudents = allStudents.filter(stu => studentIds.includes(stu.id) && stu.age);
                let ages = [];
                for(let stu of filterStudents) {
                    let findItem = ages.find(age => age.age === stu.age);
                    if(findItem) {
                        findItem.count += 1;
                    }
                    else {
                        ages.push({
                            age: stu.age,
                            count: 1
                        })
                    }
                }
                let ageRetItem = [];
                for(let index = 5; index <=18; index++) {
                    let fItem = ages.find(age => age.age === index);
                    if(fItem) {
                        ageRetItem.push(
                            {
                                ...fItem
                            }
                        );
                        continue;
                    }
                    ageRetItem.push(
                        {
                            age: index,
                            count: 0
                        }
                    )
                }
                studentAgeItem.studentAges = [...ageRetItem];
                studentAges.push(studentAgeItem)

                //student join
                let studentJoinItem = {
                    centerID: item.id,
                    centerName: item.name,
                    number: []
                }

                let classRegisters = studentClasses.filter(el => classIds.includes(el.classId));
                let joinClassProcess = [];
                for(let month=1; month <= 12; month++) {
                    let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, studentClassForYear);
                    let tmp = {
                        month: month,
                        year: studentClassForYear,
                        totalStudent: studentIds.length,
                        joinClassStudent: 0,
                        unJoinClassStudent: 0
                    }
                    let joinStudentIds = [];
                    for(let element of classRegisters) {
                        if(element.createdAt <= last && element.createdAt >= first && !joinStudentIds.includes(element.studentId)) {
                            tmp.joinClassStudent+=1;
                            joinStudentIds.push(element.studentId)
                        }
                    }
                    tmp.unJoinClassStudent = studentIds.length - tmp.joinClassStudent;
                    joinClassProcess.push(tmp);
                }
                studentJoinItem.number = [...joinClassProcess];
                studentJoinByMonth.push(studentJoinItem);

                //ty le diem danh
                let attendances = await Attendance.findAll(
                    {
                        where: {
                            classId: {
                                [Op.in]: classIds
                            }
                        }
                    }
                );
                let goWork = 0, offWork = 0;
                let totalAtt = 0;
                for(let classInfo of item.classes) {
                    let classAttens = attendances.filter(att => att.classId === classInfo.id);
                    if(classAttens.length) {
                        let joinCount = classAttens.reduce((acc, cur) => acc + (cur.studentIds.length || 0), 0);
                        goWork += joinCount;
                        totalAtt += classInfo.studentQuantity * classAttens.length;
                    }
                }
                offWork = totalAtt - goWork;
                let attendanceItem = {
                    centerID: item.id,
                    centerName: item.name,
                    joinCount: goWork,
                    unJoinCount: offWork,
                }
                studentJoinAttendances.push(attendanceItem);

                //thu chi theo thang
                let profitItem = [];

                for(let month=1; month <= 12; month++) {
                    let {first, last} = TimeHandle.getStartAndEndDayOfMonth(month, financeMonthOfYear);
                    let tmp = {
                        month: month,
                        year: financeMonthOfYear,
                        income: 0,
                        expend: 0,
                        profit: 0
                    }
                    for(let cost of costs) {
                        if(cost.timerTime <= last && cost.timerTime >= first) {
                            if(cost.type === CostType.StudentFee) tmp.income+=cost.totalMoney;
                            else tmp.expend += cost.totalMoney;
                        }
                    }
                    tmp.profit = tmp.income - tmp.expend;
                    profitItem.push(tmp);
                }
                profitByMonths = [{
                    centerID: item.id,
                    centerName: item.name,
                    data: [...profitItem]
                }];

                //thu chi theo nam
                let profitByYearItem = [];

                for(let year=2020; year <= 2030; year++) {
                   let first = new Date(year, 0 ,1);
                   let last = new Date(year, 11 ,31);
                    let tmp = {
                        year: year,
                        income: 0,
                        expend: 0,
                        profit: 0
                    }
                    for(let cost of costs) {
                        if(cost.timerTime <= last && cost.timerTime >= first) {
                            if(cost.type === CostType.StudentFee) tmp.income+=cost.totalMoney;
                            else tmp.expend += cost.totalMoney;
                        }
                    }
                    tmp.profit = tmp.income - tmp.expend;
                    profitByYearItem.push(tmp);
                }
                profitByYears = [{
                    centerID: item.id,
                    centerName: item.name,
                    data: [...profitByYearItem]
                }];
            }

            resp.numberUserByCenter = [...numberUserByCenter];
            resp.studentConnect = [...studentConnect];
            resp.studentAges = [...studentAges];
            resp.studentJoinByMonth = [...studentJoinByMonth];
            resp.studentJoinAttendances = [...studentJoinAttendances];
            resp.profitByMonths = [...profitByMonths];
            resp.profitByYears = [...profitByYears];
            
            return res.status(200).json(resp);
        }
        catch (err) {
            next(err);
        }
    }
}

module.exports = new AnalyticController();