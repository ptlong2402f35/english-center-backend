const { LoginLimiter } = require("./rateLimiter");
const { AesService, AesTransferKeyApi } = require("./security/AesService");

class Middleware {
    constructor() {}
    async loginLimit(req, res, next) {
        try {
            let ip = req?.headers?.["x-forwarded-for"] || req?.connection?.remoteAddress;
            let {allow} = await new LoginLimiter().exec(ip);
            if(allow) {
                console.log(`xxx ${new Date().toISOString()} accept login for ip ${ip}`);
                next();
            }
            else {
                return res.status(429).json({message: "Server busy"});
            }
        }
        catch (err) {
            console.error(err);
            next();
        }
    }

    async processData(req, res, next) {
        try {
            let {data} = req.body;
            // let encode = await new AesService().encrypt(JSON.stringify(req.body), AesTransferKeyApi);
            let decode = await new AesService().decrypt(data, AesTransferKeyApi);
            req.body = JSON.parse(decode);
            next();
        }
        catch (err) {
            console.error(err);
            return res.status(403).json({message: "Decode data failed"});
        }
    }
}

module.exports = new Middleware();