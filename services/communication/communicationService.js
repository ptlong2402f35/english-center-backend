const { forgetPasswordEmailTemplate, standardPaymentOrderEmailTemplate } = require("../../constants/emailFormat");
const { CustomerNotFound, PartnerNotFound } = require("../../constants/message");
const { EmailService } = require("./emailService");
const User = require("../../models").User;
const Partner = require("../../models").Partner;
const Order = require("../../models").Order;
var uuid = require("uuid");
const EmailAdminAddress = process.env.EMAIL_ADMIN_ADDRESS ? process.env.EMAIL_ADMIN_ADDRESS : "";
const ResetPasswordUrl = process.env.RESET_PASSWORD_URL || "";
const ForgetPasswordResetKeyDuration = process.env.FORGET_PASSWORD_RESETKEY_DURATION ? parseFloat(process.env.FORGET_PASSWORD_RESETKEY_DURATION) : "";

class CommunicationService {
    emailService;
    constructor() {
        this.emailService = new EmailService();
    }

    async sendForgetPasswordEmail(email, user) {
        try {
            let resetKey = user?.resetKey || null;
            if(!resetKey) {
                resetKey = uuid.v4();
                await user.update({
                    resetKey: resetKey,
                    resetKeyExpiredAt: new Date(new Date().getTime() + ForgetPasswordResetKeyDuration)
                });
            }
            if((user?.resetKeyExpiredAt && user.resetKeyExpiredAt <= new Date()) || !user.resetKeyExpiredAt) {
                await user.update({
                    resetKeyExpiredAt: new Date(new Date().getTime() + ForgetPasswordResetKeyDuration)
                });
            }
            let title = "Reset your password in Whalelo";
            await this.emailService.sendEmailToAddress([email], title, forgetPasswordEmailTemplate(user, resetKey));
        }
        catch (err) {
            throw err;
        }
    }

    async sendOrderPaidEmail(orderId) {
        try {
            let {
                order,
                customerUser,
                partnerUser,
                partner
            } = await this.prepare(orderId);

            let adminTitle = "Khách thanh toán đơn hàng thành công";
            let partnerTitle = "Khách đặt đơn hàng thành công";
            
            let customerTitle = " WhaleLO - Order Created";
            let cusEmailData = await this.buildPaidEmailData(order, customerUser, partner)
            let customerContent = standardPaymentOrderEmailTemplate(cusEmailData, {forCustomer: true});
            let adminContent = standardPaymentOrderEmailTemplate(cusEmailData, {forAdmin: true});
            let partnerContent = standardPaymentOrderEmailTemplate(cusEmailData, {forPartner: true});

            await Promise.all([
                this.emailService.sendEmailToAddress([customerUser.email], customerTitle, customerContent),
                this.emailService.sendEmailToAddress([partnerUser.email], partnerTitle, partnerContent),
                this.emailService.sendEmailToAddress([EmailAdminAddress], adminTitle, adminContent),
            ]);

            return;
        }
        catch (err) {
            console.error(err);
        }
    }

    async sendEmailToUnPaidOrders(email) {
        try {
            let title = "Thư take care khách hàng không trả xiền :D";
            let content = "Hôm nay khách hàng chưa xác nhận đơn hàng, có vấn đề gì không ạ?";
            await this.emailService.sendEmailToAddress(email, title, content);
        }
        catch (err) {
            console.error(err);
        }
    }

    async prepare(orderId) {
        try {
            let order = await Order.findOne( 
                {
                    where: {
                        id: orderId
                    },
                    include: [
                        {
                            model: User,
                            as: "customer",
                            attributes: ["id", "phone", "fullName", "email", "avatar", "communicationId"]
                        },
                        {
                            model: Partner,
                            as: "partner",
                        }
                    ]
            });
            let partnerUser = await User.findOne({
                where: {
                    id: order.partner.userId,
                }
            })
            return {
                order,
                customerUser: order.customer,
                partner: order.partner,
                partnerUser: partnerUser
            }
        }
        catch(err) {
            throw err;
        }
    }
    
    async buildPaidEmailData(order, customerUser, partner) {
        try {
            return ({
                name: customerUser.fullName,
                orderId: order.id,
                transactionId: order.paypalPaymentId || order.onepayPaymentId,
                email: customerUser.email,
                quantity: order.quantity,
                total: order.totalMoney,
                timeIn: order.timeIn,
                timeOut: order.timeOut,
                partnerName: partner.name,
                partnerAddress: partner.address
            })
        }
        catch (err) {
            console.log(err);
            return {}
        }
    }
}

module.exports = {
    CommunicationService
}