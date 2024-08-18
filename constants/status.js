const OrderStatus = {
    Pending: 1,
    Paid: 2,
    Finish: 3,
    Cancel: 4,
    Terminated: 5
}

const OrderRefundStatus = {
    Idle: 1,
    Begin: 2,
    Done: 3,
    Terminated: 4
}

const FormStatus = {
    Pending: 1,
    Accept: 2,
    Denied: 3
}

const TransactionStatus = {
    Pending: 1,
    Done: 2,
    Terminated: 3
}

module.exports = {
    OrderStatus,
    OrderRefundStatus,
    FormStatus,
    TransactionStatus
}