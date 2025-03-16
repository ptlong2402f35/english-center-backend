const { AesService } = require("../security/AesService");

const Parent = require("../../models").Parent;
const User = require("../../models").User;

class parentUpdateService {
    aesService;
    constructor() {
        this.aesService = new AesService();
    }

    async updateParentDetail(data, parentId, {forAdmin} = {}) {
        try {
            let bData = await this.build(data, {forAdmin});
            let enData = await this.enbuild(data);
            let parent = await Parent.findByPk(parentId);
            await parent.update(
                {
                    ...bData,
                    ...enData
                },
                {
                    where: {
                        id: parentId
                    }
                }
            );

            if(data.email) {
                await User.update(
                    {
                        email: data.email
                    },
                    {
                        where: {
                            id: parent.userId
                        }
                    }
                );
            }
        }
        catch (err) {
            throw err;
        }
    }

    async build(data, {forAdmin} = {}) {
        try {
            if(forAdmin) {
                return ({
                    name: data.name,
                    gender: data.gender,
                    birthday: data.birthday,
                    age: data.age,
                    address: data.address,
                    phone: data.phone,
                    email: data.email
                });
            }
            return ({
                name: data.name,
                gender: data.gender,
                birthday: data.birthday,
                age: data.age,
                address: data.address,
                phone: data.phone,
                email: data.email
            });
        }
        catch (err) {
            throw err;
        }
    }

    async enbuild(data) {
        try {
            return ({
                en_name: await this.aesService.getStoreEncryptData(JSON.stringify(data.name)),
                en_gender: await this.aesService.getStoreEncryptData(JSON.stringify(data.gender)),
                en_birthday: await this.aesService.getStoreEncryptData(JSON.stringify(data.birthday)),
                en_age: await this.aesService.getStoreEncryptData(JSON.stringify(data.age)),
                en_address: await this.aesService.getStoreEncryptData(JSON.stringify(data.address)),
                en_phone: await this.aesService.getStoreEncryptData(JSON.stringify(data.phone)),
                en_email: await this.aesService.getStoreEncryptData(JSON.stringify(data.email))
            });
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    parentUpdateService
}