const { DayLabelsMap } = require("../constants/timeFormat");

class TimeHandle {
    constructor() {}

    static convertTimeZone(time, timeZone) {
        if(!time) return new Date(new Date().toLocaleString("en-US", { timeZone: timeZone || "Asia/Ho_Chi_Minh" }));

        return new Date(new Date(time).toLocaleString("en-US", { timeZone: timeZone || "Asia/Ho_Chi_Minh" }));
    }

    static getDaysOfMonthWithTimeZone(time, timeZone) {
        let date = new Date(new Date(time).toLocaleString("en-US", { timeZone: timeZone || "Asia/Ho_Chi_Minh" }));
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        return new Date(year, month, 0).getDate();
    }

    static getDayLabelByIdConfig(dayId) {
        return DayLabelsMap.get(dayId);
    }

    static attachDayLabel(data) {
        let label = this.getDayLabelByIdConfig(data.date) || "";
        data.dayLabel = label;
        data?.setDataValue("dayLabel", label);
    }
}

module.exports = {
    TimeHandle
}