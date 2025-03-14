const { EmailService } = require("../communication/emailService");
var crypto = require('crypto');
const { OtpCacheStrategy } = require("./otpCacheStrategy");
const { AuthService } = require("../auth/authService");
const User = require("../../models").User;

class OtpService {
    emailService;
    strategy;
    constructor() {
        this.emailService = new EmailService();
        this.strategy = new OtpCacheStrategy();
    }

    async sendOtpToEmail(user) {
        try {
            let otp = crypto.randomInt(100000, 999999);

            let content = `Mã đăng nhập của bạn là: ${otp}`;

            await this.strategy.set(otp, user.id);
            await this.emailService.sendEmailToAddress([user.email], "Get OTP in LOHUHI", content);
        }
        catch (err) {
            throw err;
        }
    }

    async verifyOtp(user, otp) {
        try {
            if(!user) return null;
            let data = await this.strategy.get(user.id);
            if(!data) return {
                success: false,
                expired: false,
                accessToken: undefined,
                refreshToken: undefined,
                expiredIn: undefined,
            }
            if(data != otp) return {
                success: false,
                expired: true,
                accessToken: undefined,
                refreshToken: undefined,
                expiredIn: undefined,
            }
            if(data === otp) {
                let token = await new AuthService().generateToken(user);

                return {
                    success: true,
                    expired: true,
                    ...token,
                    userId: user.id
                }
            }

            return null;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    OtpService
}