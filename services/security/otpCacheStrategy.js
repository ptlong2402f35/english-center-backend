const { GeneralRedisClient } = require("../generalRedisClient");

class OtpCacheStrategy {
    redisClient;
    pattern;
    constructor() {
        this.redisClient = new GeneralRedisClient().getInstance();
        this.pattern = "otp_cache";
    }

    async get(userId) {
        let key = this.pattern + `:${userId}`;
        let client = await this.redisClient.getClient();
        let data = await client.GET(key);
        if(!data) return null;
        console.log(`=== get OTP for user ${userId}: ${data}`);
        return data;
    }

    async set(data, userId) {
        if(!data) {
            console.log(`=== set OTP failed for user ${userId}: ${data}`);
            return;
        }
        let key = this.pattern + `:${userId}`;
        let client = await this.redisClient.getClient();
        await client.SET(key, data, {EX: 300});
        console.log(`=== set OTP for user ${userId}: ${data}`);

    }
}

module.exports = {
    OtpCacheStrategy
}