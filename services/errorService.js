const { TranslateService } = require("./translateService");
const {
    UpdateFailMessage,
    EmailEmpty,
    PasswordEmpty,
    PasswordNotMatch,
    ConfirmPasswordNotMatch,
    InputInfoEmpty,
    ExistedEmail,
    ExistedPhone,
    UserNotFound,
    CustomerNotFound,
    PartnerNotFound,
    FormNotFound,
    OrderNotFound,
    FormStatusInvalid,
    OrderStatusInvalid,
    OrderTimerInvalid,
    EmailFormatNotValid,
    PhoneFormatNotValid,
    AdminOrderCannotPaid,
    TimeExpiredAction,
    NotEnoughPermission,
    NotOwnerOrder,
    ExpiredResetKey,
} = require("../constants/message");
const ErrorMessage = require("../resources/translation.json").message.error;

const ErrorCodeMap = new Map([
    [UpdateFailMessage, 400],
    [EmailEmpty, 422],
    [PasswordEmpty, 422],
    [PasswordNotMatch, 422],
    [ConfirmPasswordNotMatch, 422],
    [InputInfoEmpty, 422],
    [ExistedEmail, 422],
    [ExistedPhone, 422],
    [UserNotFound, 422],
    [CustomerNotFound, 422],
    [PartnerNotFound, 422],
    [FormNotFound, 422],
    [OrderNotFound, 422],
    [OrderStatusInvalid, 403],
    [FormStatusInvalid, 403],
    [OrderTimerInvalid, 403],
    [EmailFormatNotValid, 422],
    [PhoneFormatNotValid, 422],
    [AdminOrderCannotPaid, 400],
    [TimeExpiredAction, 422],
    [NotEnoughPermission, 422],
    [NotOwnerOrder, 403],
    [ExpiredResetKey, 422],
])

class ErrorService {
    translateService;
    constructor(req) {
        this.translateService = new TranslateService(req);
    }

    getErrorResponse(error) {
        let code = ErrorCodeMap.get(error) || 403;
        let message = this.translateService.translateMessage(ErrorMessage?.[error]);
        
        return ({
            code,
            message
        });
    }
}

module.exports = {
    ErrorService
}