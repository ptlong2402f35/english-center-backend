const { EmailService } = require("./emailService");
const Notification = require("../../models").Notification;

class CommunicationService {
    emailService;
    constructor() {
        this.emailService = new EmailService();
    }

    async sendNotificationToUserId(userId, title, content, {actionType} = {}) {
        try {
            await Notification.create({
                toUserId: userId,
                title,
                content,
                ...(actionType ? {actionType: actionType} : {})
            });
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