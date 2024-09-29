const { EmailService } = require("./emailService");
const Notification = require("../../models").Notification;

class CommunicationService {
    emailService;
    constructor() {
        this.emailService = new EmailService();
    }

    async sendNotificationToUserId(userId, title, content, type, {actionType} = {}) {
        try {
            await Notification.create({
                toUserId: userId,
                type: type,
                title,
                content,
                ...(actionType ? {actionType: actionType} : {}),
                seen: false,
                seenAt: null
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    async sendBulkNotificationToUserId(userIds, title, content, type, {actionType} = {}) {
        try {
            await Notification.bulkCreate(userIds.map(item => (
                {
                    toUserId: item,
                    type: type,
                    title,
                    content,
                    ...(actionType ? {actionType: actionType} : {}),
                    seen: false,
                    seenAt: null
                }
            )));
        }
        catch (err) {
            console.error(err);
        }
    }
    
    //one signal
    async sendMobileNotification() {
        try {

        }
        catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    CommunicationService
}