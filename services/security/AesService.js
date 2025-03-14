const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const AesTransferKeyApi = process.env.AES_TRANSFER_KEY_API || "english_lohuhi";
const AesKeyApi = process.env.AES_KEY_API || "english_lohuhi_be";

class AesService {
    constructor() {

    }

    async getStoreEncryptData(data) {
        return await this.encrypt(data, AesKeyApi);
    }

    async getStoreDecryptData(data) {
        return await this.decrypt(data, AesKeyApi);
    }

    async encrypt(data, key) {
        try {
            const cipherText = CryptoJS.AES.encrypt(data, key).toString();
            return cipherText;
        }
        catch (err) {
            throw(err);
        }
    }

    async decrypt(text, key) {
        try {
            const bytes = CryptoJS.AES.decrypt(text, key);
            if(bytes.sigBytes > 0) {
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                return decrypted;
            }

            return null;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = { 
    AesService,
    AesTransferKeyApi,
    AesKeyApi
};