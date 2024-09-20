const { ErrorService } = require("../services/errorService");

const Notification = require("../models").Notification;

class NotificationController {
    getMyNoti = async (req, res, next) => {
        try {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            let perPage = req.query.perPage ? parseInt(req.query.perPage) : 50;
            let userId = req.user.userId;

            let data = await Notification.paginate(
                {
                    page: page,
                    paginate: perPage,
                    where: {
                        toUserId: userId
                    },
                    order: [["id", "desc"]]
                }
            );

            data.currentPage = page;

            return res.status(200).json(data);
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }

    updateNotiStatus = async (req, res, next) => {
        try {
            let notiId = req.params.id ? parseInt(req.params.id) : null;
            if(!notiId) return res.status(403).json({message: "Noti không tồn tại"}); 

            let data = await Notification.update(
                {
                    seen: true,
                    seenAt: new Date()
                },
                {
                    where: {
                        id: notiId
                    }
                }
            );

            return res.status(200).json({message : "Thành công"});
        }
        catch (err) {
            console.error(err);
            let {code, message} = new ErrorService(req).getErrorResponse(err);
            return res.status(code).json({message});
        }
    }
}

module.exports = new NotificationController();