const { InputInfoEmpty } = require("../../constants/message");

const Center = require("../../models").Center;

class CenterUpdateService {
    constructor() {}

    async handleUpdateCenterInfo(data, centerId) {
        try {
            if(!centerId) throw InputInfoEmpty;
            let builtData = await this.build(data);

            await Center.update(
                {
                    ...builtData
                },
                {
                    where: {
                        id: centerId
                    }
                }
            )
        }
        catch (err) {
            throw err;
        }
    }

    async build(data) {
        try {
            return ({
                name: data.name,
                address: data.address,
                phone: data.phone,
                images: data.images,
                status: data.status
            });
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    CenterUpdateService
}