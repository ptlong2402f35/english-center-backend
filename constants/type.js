const FormType = {
    Register: 1,
    Contact: 2
}

const PaymentMethod = {
    Onepay: 1,
    Paypal: 2
}

const CommunicationType = {
    WeChat: 1,
    Zalo: 2,
    Whatsapp: 3,
    Line: 4,
    Kakaotalk: 5,
    Viber: 6
}

const CostType = {
    TeacherSalary: 1,
    StudentFee: 2,
    ElecFee: 3,
    WaterFee: 4,
    OtherFee: 5,
    Bonus: 6,
}

const NotificationType = {
    Request: 1,
    Transaction: 2,
    Review: 3,
    Schedule: 4
}

const ReviewType = {
    General: 1,
    StudentSpecific: 2
}

module.exports = {
    FormType,
    CommunicationType,
    PaymentMethod,
    CostType,
    NotificationType,
    ReviewType
}