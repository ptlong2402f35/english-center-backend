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
    WaterFee: 4
}

module.exports = {
    FormType,
    CommunicationType,
    PaymentMethod,
    CostType
}