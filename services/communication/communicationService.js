const { EmailService } = require("./emailService");
const Notification = require("../../models").Notification;
let FireBaseProjectId = process.env.FIREBASE_PROJECT_ID || "english-center-1e883";
let FCMPushNotiUrl = `https://fcm.googleapis.com/v1/projects/${FireBaseProjectId}/messages:send`

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
    
    //fire base noti
    async sendMobileNotification() {
        try {

        }
        catch (err) {
            console.error(err);
        }
    }

    // async getToken() {
    //     try {
    //         return new Promise(function(resolve, reject) {
    //             const key = require('../placeholders/service-account.json');
    //             const jwtClient = new google.auth.JWT(
    //               key.client_email,
    //               null,
    //               key.private_key,
    //               SCOPES,
    //               null
    //             );
    //             jwtClient.authorize(function(err, tokens) {
    //               if (err) {
    //                 reject(err);
    //                 return;
    //               }
    //               resolve(tokens.access_token);
    //             });
    //           });
    //     }
    //     catch (err) {
    //         console.error(err);
    //     }
    // }
}

module.exports = {
    CommunicationService
}