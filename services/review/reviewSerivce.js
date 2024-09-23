const { ReviewType } = require("../../constants/type");

class ReviewService {
    constructor() {}

    async attachSpecificReviewForStudentAttendance(attendances, studentId) {
        try {
            for(let attend of attendances) {
                let general = (attend.reviews || []).find(item => item.type === ReviewType.General) || null;
                let specific = (attend.reviews || []).find(item => item.type === ReviewType.StudentSpecific && item.referenceId === studentId) || null;
                attend.generalReview = general;
                attend?.setDataValue("generalReview", general);
                attend.specificReview = specific;
                attend?.setDataValue("specificReview", specific);
                attend.reviews = null;
                attend?.setDataValue("reviews", null);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    async splitUpdateData(data) {
        if(!data) return data;
        let ret = [
            {
                ...await this.build(data, ReviewType.General)
            }
        ];
        for(let spe of data.specificContent) {
            ret.push({
                ...await this.build(
                    {
                        ...data,
                        referenceId: spe.studentId,
                        specificContent: spe.content
                    },
                    ReviewType.StudentSpecific
                )
            });
        }

        return ret;
    }

    async build(data, type) {
        return {
            generalContent: data?.generalContent || "",
            specificContent: type === ReviewType.StudentSpecific ? (data?.specificContent || "") : "",
            type: type || ReviewType.General,
            referenceId: type === ReviewType.StudentSpecific ? data.referenceId : 0,
            title: data?.title || "",
            sessionContent: data?.sessionContent || "",
            attendanceId: data?.attendanceId,
            classId: data?.classId
        }
    }
}

module.exports = {
    ReviewService
}