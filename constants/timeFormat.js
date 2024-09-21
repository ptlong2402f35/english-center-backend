const DayIds = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0
};

const DayIdConfigs = {
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7,
    Sunday: 8
};

const DayConvertIdsMap = new Map([
    [DayIdConfigs.Monday, DayIds.Monday],
    [DayIdConfigs.Tuesday, DayIds.Tuesday],
    [DayIdConfigs.Wednesday, DayIds.Wednesday],
    [DayIdConfigs.Thursday, DayIds.Thursday],
    [DayIdConfigs.Friday, DayIds.Friday],
    [DayIdConfigs.Saturday, DayIds.Saturday],
    [DayIdConfigs.Sunday, DayIds.Sunday],
]);

const DayLabel = {
    Monday: "Thứ hai",
    Tuesday: "Thứ ba",
    Wednesday: "Thứ tư",
    Thursday: "Thứ năm",
    Friday: "Thứ sáu",
    Saturday: "Thứ bảy",
    Sunday: "Chủ nhật"
};

const DayLabelsMap = new Map([
    [DayIdConfigs.Monday, DayLabel.Monday],
    [DayIdConfigs.Tuesday, DayLabel.Tuesday],
    [DayIdConfigs.Wednesday, DayLabel.Wednesday],
    [DayIdConfigs.Thursday, DayLabel.Thursday],
    [DayIdConfigs.Friday, DayLabel.Friday],
    [DayIdConfigs.Saturday, DayLabel.Saturday],
    [DayIdConfigs.Sunday, DayLabel.Sunday],
]);

const DayLabelsConvertMap = new Map([
    [DayIds.Monday, DayLabel.Monday],
    [DayIds.Tuesday, DayLabel.Tuesday],
    [DayIds.Wednesday, DayLabel.Wednesday],
    [DayIds.Thursday, DayLabel.Thursday],
    [DayIds.Friday, DayLabel.Friday],
    [DayIds.Saturday, DayLabel.Saturday],
    [DayIds.Sunday, DayLabel.Sunday],
]);

module.exports = {
    DayIds,
    DayIdConfigs,
    DayConvertIdsMap,
    DayLabel,
    DayLabelsMap,
    DayLabelsConvertMap
}