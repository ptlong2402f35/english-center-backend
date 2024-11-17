const { DayLabelsMap } = require("../constants/timeFormat");
const MaxLoop = 1000;

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

    static getStartAndEndDayOfMonth(m, y) {
        var first = new Date(y, m - 1, 1);
        var last = new Date(y, m, 0);
        return {
            first,
            last
        };
    }

    static getAllScheduleDayOfClass(start, end, total, data, info) {
        let ret = [];
        let count = 0
        let currentDate = new Date(start);
        let index = 0;
        let day = data.map(item => item.date).filter(val => val);
        if(!end) end = new Date(start.getTime() + 60*60*24*120*1000);
        while (1) {
            if(count >= total) break;
            let convertday = currentDate.getDay();
            if(convertday === 0 ) {
                convertday = 8
            }
            else {
                convertday +=1;
            }
            if (day?.includes(convertday)) {
                let fSchedule = data.filter(item => item.date === convertday).map(item => 
                    ({
                       startAt:  item.startAt,
                       endAt:  item.endAt,
                       classID: info.code || "",
                       className: info.name || "",
                       centerName: info.center?.name || ""
                    })
                );
                ret.push(
                    {
                        key: new Date(currentDate).toISOString().slice(0, 10),
                        value: fSchedule
                    }
                )
                count+=1;
            }
            currentDate.setDate(currentDate.getDate() + 1);
            index++;
            if(index >= MaxLoop) break;
        }
        return ret;
    }
}

module.exports = {
    TimeHandle
}