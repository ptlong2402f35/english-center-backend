const {CronJob} = require("cron");
const { ClassStatus } = require("../../constants/status");
const { Op } = require("sequelize");
const { TimeHandle } = require("../../utils/timeHandle");
const { CommunicationService } = require("../communication/communicationService");
const { NotificationType } = require("../../constants/type");
const ScheduleNotiJobTimer = process.env.SCHEDULE_NOTI_JOB_TIMER || "0 6 * * *";
const Schedule = require("../../models").Schedule;
const ClassSchedule = require("../../models").ClassSchedule;
const Class = require("../../models").Class;
const Student = require("../../models").Student;
const Teacher = require("../../models").Teacher;
const util = require("util");
const EnableAvgReviewStaff = true;
const job = CronJob.from({
	cronTime: ScheduleNotiJobTimer,
	onTick: async () => {
		if (EnableAvgReviewStaff) {
			console.log(`==== [${new Date().toLocaleString("en-GB")}] perform Schedule noti job`);
			await noti();
			console.log(`==== [${new Date().toLocaleString("en-GB")}] done Schedule noti job`);
		}
	},
	start: true,
	timeZone: "Asia/Ho_Chi_Minh",
});

async function noti() {
    try {
        let activeClasses = await Class.findAll({
            where: {
                status: ClassStatus.Opening,
                startAt: {
                    [Op.lte]: new Date()
                }
            },
            include: [
                {
                    model: Student,
                    as: "students",
                    attributes: ["id", "userId"]
                },
                {
                    model: Schedule,
                    as: "schedules",
                }
            ],
        });
        let data = [];
        for(let item of activeClasses) {
            if(!item.students || !item.students.length) continue;
            let current = new Date().toISOString().slice(0, 10);
            let classSchedules = TimeHandle.getAllScheduleDayOfClass(item.startAt, item.endAt, item.totalSession, item.schedules, item) || [];
            let schedule = [];
            classSchedules.forEach(sche => {
                let findKey = sche.key === current;
                if(findKey) {
                    schedule = [...schedule, current];
                }
            })
            
            if(schedule && schedule.length) {
                for(let student of item.students) {
                    let fStudent = data.find(el => el.id === student.userId);
                    if(fStudent) {
                        data.value= [...data.value, ...schedule];
                    }
                    else {
                        data.push(
                            {
                                id: student.userId,
                                value: [...schedule]
                            }
                        )
                    }
                }
            }
        }

        if(!data || !data.length) return;
        let userIds = data.map(item => item.id);
        await new CommunicationService().sendBulkNotificationToUserId(
            userIds,
            `Hôm nay bạn có lịch học vui lòng kiểm tra`,
            `Hôm nay bạn có lịch học vui lòng kiểm tra`,
            NotificationType.Schedule
        );

        await new CommunicationService().sendBulkMobileNotification(
            userIds,
            `Hôm nay bạn có lịch học vui lòng kiểm tra`,
            `Hôm nay bạn có lịch học vui lòng kiểm tra`
        );
        
    }
    catch (err) {
        console.error(err);
    }
}

module.exports = job;