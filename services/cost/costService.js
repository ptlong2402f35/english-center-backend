const { Op } = require("sequelize");
const { UserRole } = require("../../constants/roles");
const { NotificationType } = require("../../constants/type");
const { CommunicationService } = require("../communication/communicationService");
const ParentStudent = require("../../models").ParentStudent;
const Student = require("../../models").Student;
const Parent = require("../../models").Parent;
const Teacher = require("../../models").Teacher;

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
}

module.exports = {
    CostService
}