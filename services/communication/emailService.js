const {createTransport} = require("nodemailer");
const EmailSmtpServer = process.env.SMTP_SERVER || "smtp.gmail.com";
const EmailSmtpPort = process.env.SMTP_PORT || 587;
const EmailSmtpUsername = process.env.SMTP_USERNAME || "ptlong2402@gmail.com";
const EmailSmtpPassword = process.env.SMTP_PASSWORD || "hkmk rawk nmmx yifs";
const EmailFromAddress = process.env.EMAIL_FROM_ADDRESS || "ptlong2402@gmail.com";
const ContentExpression = "{{content}}";
const StandardEmailTemplate = `
    <html>
        <body>
            ${ContentExpression}
        </body>
    </html>
`;

class EmailService {
    constructor() {}

    async setup() {
        return await createTransport({
            host: EmailSmtpServer,
            port: EmailSmtpPort,
            secure: false,
            auth: {
                user: EmailSmtpUsername,
                pass: EmailSmtpPassword
            },
        });
    }

    async sendEmailToAddress(emailAddresses, title, content) {
        try {
            if(!emailAddresses) return;
    
            let transporter = await this.setup();
            await transporter.sendMail({
                from: EmailFromAddress,
                to: emailAddresses.join(","),
                subject: title,
                html: StandardEmailTemplate.replace(ContentExpression, content)
            });
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
}

module.exports = {
    EmailService
}