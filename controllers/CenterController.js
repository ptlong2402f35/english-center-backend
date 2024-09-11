const { InputInfoEmpty, CenterNotFound } = require("../constants/message");
const { CenterQuerier } = require("../services/center/centerQuerier");
const { CenterUpdateService } = require("../services/center/centerUpdateService");
const { ErrorService } = require("../services/errorService");

const Center = require("../models").Center;

class CenterController {
    getCenter = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let name = req.query.name;
            let address = req.query.address;
            let phone = req.query.phone;
            let status = req.query.status ? parseInt(req.query.status) : null;
            let includeClass = req.query.includeClass?.trim() === "true" || null;

            const centerQuerier = new CenterQuerier();
            
            let conds = centerQuerier.buildWhere(
                {
                    name, 
                    address,
                    phone,
                    status
                }
            );
            let attributes = centerQuerier.buildAttributes({});
            let include = centerQuerier.buildInclude({
                includeClass
            });
            let orderBy = centerQuerier.buildSort({});

            let data = await Center.paginate({
                page: page,
                paginate: perPage,
                where: {
                    [Op.and]: conds
                },
                attributes: attributes,
                include: include,
                orderBy: orderBy
            });

            data.currentPage = page;

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    getCenterDetail = async (req, res, next) => {
        try {
            const centerQuerier = new CenterQuerier();
            let centerId = req.params.id ? parseInt(req.params.id) : null;
            if(!centerId) throw InputInfoEmpty;

            let includeClass = req.query.includeClass?.trim() === "true" || null;

            let attributes = centerQuerier.buildAttributes({});
            let include = centerQuerier.buildInclude({
                includeClass
            });

            let data = await Center.findByPk(centerId,
                {
                    attributes: attributes,
                    include: include,
                }
            );
            if(!data) throw CenterNotFound;
            
            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    createCenter = async (req, res, next) => {
        try {
            let data = req.body;

            let builtData = await new CenterUpdateService().build(data);
            await Center.create(builtData);

            return res.status(200).json({message: "Thành công"});

        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateCenter = async (req, res, next) => {
        try {
            let centerId = req.params.id ? parseInt(req.params.id) : null;
            let data = req.body;

            await new CenterUpdateService().handleUpdateCenterInfo(data, centerId);

            return res.status(200).json({message: "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
    
}

module.exports = new CenterController();