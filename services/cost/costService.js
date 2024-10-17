const { Op } = require("sequelize");
const { UserRole } = require("../../constants/roles");
const { NotificationType, CostType } = require("../../constants/type");
const { CommunicationService } = require("../communication/communicationService");
const { CostTeacherCreateService } = require("./costTeacherCreateService");
const { TimeHandle } = require("../../utils/timeHandle");
const ParentStudent = require("../../models").ParentStudent;
const Student = require("../../models").Student;
const Parent = require("../../models").Parent;
const Teacher = require("../../models").Teacher;
const Class = require("../../models").Class;
const StudentClass = require("../../models").StudentClass;
const TeacherClass = require("../../models").TeacherClass;
const Attendance = require("../../models").Attendance;
const User = require("../../models").User;
const Program = require("../../models").Program;
const Center = require("../../models").Center;

class CostService {
    communicationService;
    constructor() {
        this.communicationService = new CommunicationService();
    }
    async onCreateNotiTransToUser(cost) {
        try {
            if(!cost || !cost?.user?.id) return;
            this.communicationService.sendNotificationToUserId(
                cost.user.id,
                "Thanh toán thành công",
                `Thanh toán thành công cho hóa đơn ${cost?.name || cost.id || ""}`,
                NotificationType.Transaction
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async createNewCostNoti(userIds, month, year) {
        try {
            let students = await Student.findAll({
                where: {
                    userId: {
                        [Op.in]: userIds
                    }
                },
                include: [
                    {
                        model: Parent,
                        as: "parents"
                    }
                ]
            });
            for(let item of students) {
                if(!item.parents || !item.parents.length) continue;
                let parentUserIds = item.parents.map(parent => parent.userId).filter(val => val);
                if(!parentUserIds || !parentUserIds.length) continue;
                await this.communicationService.sendBulkNotificationToUserId(
                    parentUserIds,
                    `Đã có hóa đơn học phí tháng ${month} năm ${year}`,
                    `Đã có hóa đơn học phí tháng ${month} năm ${year} cho con ${item.name || item.phone}`,
                    NotificationType.Transaction
                );
            }
            await this.communicationService.sendBulkNotificationToUserId(
                userIds,
                `Đã có hóa đơn học phí tháng ${month} năm ${year}`,
                `Đã có hóa đơn học phí tháng ${month} năm ${year}, vui lòng thanh toán`,
                NotificationType.Transaction
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async onCreateNotiTransToTeacher(teacherId, month, year) {
        try {
            if(!teacherId) return;
            let teacher = await Teacher.findByPk(teacherId);
            if(!teacher) return;
            this.communicationService.sendNotificationToUserId(
                teacher.userId,
                `Đã có hóa đơn lương tháng ${month}`,
                `Đã có hóa đơn lương tháng ${month}/${year} xin vui lòng kiểm tra, nếu có thắc mắc xin liên lạc với ban quản trị trung tâm`,
                NotificationType.Transaction
            );
        }
        catch (err) {
            console.error(err);
        }
    }

    async attachExtendInfoToCost(cost) {
        try {
            if(!cost || !cost.type) return;
            switch(cost.type) {
                case CostType.StudentFee: {
                    let student = await Student.findOne({
                        where: {
                            userId: cost.forUserId
                        }
                    });
                    let user = await User.findByPk(cost.
                        forUserId,
                        {
                            attributes: ["id", "role", "userName"] 
                        }
                    );
                    user.student = student;
                    user.setDataValue("student", student);
                    if(!student) return;
                    let {first, last} = TimeHandle.getStartAndEndDayOfMonth(cost.forMonth, cost.forYear);
                    let [classInfo, attendances, studentClass] = await Promise.all(
                        [
                            Class.findOne(
                                {
                                    where: 
                                    {
                                        id: cost.referenceId
                                    },
                                    include: [
                                        {
                                            model: Program,
                                            as: "program"
                                        }
                                    ]
                                },
                                
                            ),
                            Attendance.findAll(
                                {
                                    where: {
                                        [Op.and]: [
                                            {classId: cost.referenceId},
                                            {date: {
                                                [Op.gte]: first
                                            }},
                                            {date: {
                                                [Op.lte]: last
                                            }},
                                            {studentIds: {
                                                [Op.contains]: [student.id]
                                            }}
                                        ]
                                    },
                                }
                            ),
                            StudentClass.findOne({
                                where: {
                                    studentId: student.id,
                                    classId: cost.referenceId
                                }
                            })
                        ]
                    );
                    if(!classInfo || !attendances) return;
                    classInfo.joinCount = attendances.length || 0;
                    classInfo?.setDataValue("joinCount", attendances.length);
                    cost.class = classInfo;
                    cost?.setDataValue("class", classInfo);
                    cost.studentClass = studentClass;
                    cost?.setDataValue("studentClass", studentClass);
                    cost.user = user;
                    cost?.setDataValue("user", user);
                    return;
                }
                case CostType.TeacherSalary: {
                    let {
                        teacher,
                        teacherClass,
                        attendances
                    } = await new CostTeacherCreateService().prepare(cost.referenceId, cost.forYear, cost.forMonth);
                    if(!attendances || !attendances.length) return;
                    let ret = teacherClass.map(item => ({
                        ...item.dataValues,
                        teachedCount: (attendances.filter(el => el.classId === item.classId).length || 0)
                    })).filter(item => item.teachedCount);

                    let user = await User.findByPk(
                        teacher.userId,
                        {
                            attributes: ["id", "role", "userName"]
                        }
                    );
                    user.teacher = teacher;
                    user.setDataValue("teacher", teacher);
                    cost.user = user;
                    cost.setDataValue("user", user);
                    cost.teachedInfo = ret;
                    cost?.setDataValue("teachedInfo", ret);
                    return;
                }
                default: {
                    cost.centerId = cost.referenceId;
                    cost?.setDataValue("centerId", cost.referenceId);

                    return;
                }
            }

        }
        catch (err) {
            console.error(err);
        }
    }

    async attachCenterInfo(cost) {
        try {
            if(![CostType.ElecFee, CostType.OtherFee, CostType.WaterFee].includes(cost.type)) {
                cost.center = null;
                cost?.setDataValue("center", null);
                return;
            };
            let center = await Center.findByPk(cost.referenceId);
            if(!center) {
                cost.center = null;
                cost?.setDataValue("center", null);
                return;
            }
            cost.center = center;
            cost?.setDataValue("center", center);
        }
        catch (err) {
            console.error(err);
        }
    }

    async attachTeacherInfo(cost) {
        try {
            if(![CostType.Bonus, CostType.TeacherSalary].includes(cost.type)) {
                cost.teacher = null;
                cost?.setDataValue("teacher", null);
                return;
            };
            let teacher = await Teacher.findByPk(cost.referenceId);
            if(!teacher) {
                cost.teacher = null;
                cost?.setDataValue("teacher", null);
                return;
            }
            cost.teacher = teacher;
            cost?.setDataValue("teacher", teacher);
        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    CostService
}