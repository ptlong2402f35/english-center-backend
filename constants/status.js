const ClassStatus = {
    UnOpen: 1,
    Opening: 2,
    Finish: 3,
    Disable: 4
}

const CenterStatus = {
    Active: 1,
    Close: 2
}

const ObjectStatus = {
    Active: 1,
    Disable: 2
}

const RequestStatus = {
    Pending: 1,
    Accept: 2,
    Denied: 3,
    Terminated: 4
}

const CostStatus = {
    Pending: 1,
    Done: 2,
    Debt: 3
}

const ProgramStatus = {
    Active: 1,
    Disable: 2
}

const TransactionStatus = {
    Pending: 1,
    Done: 2,
    Terminated: 3
}

module.exports = {
    ClassStatus,
    CenterStatus,
    ObjectStatus,
    TransactionStatus,
    RequestStatus,
    CostStatus,
    ProgramStatus
}