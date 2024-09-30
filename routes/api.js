var express = require("express");
const AuthController = require("../controllers/AuthController");
const Auth = require("../services/auth/auth");
const UserController = require("../controllers/UserController");
const StudentController = require("../controllers/StudentController");
const ParentController = require("../controllers/ParentController");
const CenterController = require("../controllers/CenterController");
const ClassController = require("../controllers/ClassController");
const TeacherController = require("../controllers/TeacherController");
const ScheduleController = require("../controllers/ScheduleController");
const RequestController = require("../controllers/RequestController");
const AttendanceController = require("../controllers/AttendanceController");
const ProgramController = require("../controllers/ProgramController");
const NotificationController= require("../controllers/NotificationController");
const TransactionController = require("../controllers/TransactionController");
const CostController = require("../controllers/CostController");
const SearchController = require("../controllers/SearchController");
const ReviewController = require("../controllers/ReviewController");
var router = express.Router();

//test connect
router.get("/test", AuthController.test);

/* Auth Controllers */
router.post("/auth/login", AuthController.login);
router.post("/auth/login-dev", AuthController.loginForDev);
router.post("/auth/signup", AuthController.signup);
router.get("/auth/me", Auth.auth, AuthController.me);
router.post("/auth/refresh", AuthController.refresh);
// wait for upd
router.post("/auth/init-forget-password", AuthController.initForgetPassword);
router.post("/auth/update-forget-password", AuthController.updateForgetPassword);

/* User Controller */
router.get("/my-user-detail", Auth.auth, UserController.getMyDetail);
router.put("/my-user-detail", Auth.auth, UserController.updateDetail);
router.put("/user-password", Auth.auth, UserController.updatePassword);
router.get("/users", Auth.onlyAdmin, UserController.adminGetUsers);
router.post("/user", Auth.onlyAdmin, UserController.adminCreateUser);
router.get("/user-detail/:id", Auth.onlyAdmin, UserController.adminGetUserDetail);
router.put("/user-detail-by-admin/:id", Auth.onlyAdmin, UserController.adminUpdateUserDetail);
router.put("/user-password-by-admin/:id", Auth.onlyAdmin, UserController.adminUpdateUserPassword);

/* Student Controller */
// router.get("/my-student-detail", Auth.auth, StudentController.getMyDetail);
// router.put("/my-student-detail", Auth.auth, StudentController.updateMyDetail);
router.get("/student-connected", Auth.auth, StudentController.parentGetStudentConennected);
router.get("/student-detail-by-parent/:id", Auth.auth, StudentController.parentGetStudentDetail);
router.get("/students", Auth.onlyAdmin, StudentController.adminGetStudents);
router.post("/student", Auth.onlyAdmin, StudentController.adminCreateStudent);
router.get("/student-detail-by-admin/:id", Auth.onlyAdmin, StudentController.adminGetStudentDetail);
router.put("/student-detail-by-admin/:id", Auth.onlyAdmin, StudentController.adminUpdateStudentDetail);
router.put("/student-deactive", Auth.onlyAdmin, StudentController.adminDeactiveStudent);

/* Parent Controller */
// router.get("/my-parent-detail", Auth.auth, ParentController.getMyDetail);
// router.put("/my-parent-detail", Auth.auth, ParentController.updateMyDetail);
router.get("/parent-connected", Auth.auth, ParentController.studentGetParentConennected);
router.get("/parents", Auth.onlyAdmin, ParentController.adminGetParents);
router.get("/parent-detail-by-admin/:id", Auth.onlyAdmin, ParentController.adminGetParentDetail);
router.post("/parent", Auth.onlyAdmin, ParentController.adminCreateParent);
router.put("/parent-detail-by-admin/:id", Auth.onlyAdmin, ParentController.adminUpdateParentDetail);
router.put("/parent-deactive", Auth.onlyAdmin, ParentController.adminDeactiveParent);

/* Center Controller */
router.get("/centers", CenterController.getCenter);
router.get("/center/:id", CenterController.getCenterDetail);
router.post("/center", Auth.onlyAdmin, CenterController.createCenter);
router.put("/center/:id", Auth.onlyAdmin, CenterController.updateCenter);


/* Class Controller */
router.get("/class", ClassController.getClasses);
router.get("/class/:id", ClassController.getClassDetail);
router.get("/my-class", Auth.auth, ClassController.getMyClass);
router.get("/class-by-teacher", Auth.auth, ClassController.teacherGetClass);
router.get("/class-by-parent/:studentId", Auth.auth, ClassController.parentGetStudentClass);
router.post("/class", Auth.onlyAdmin, ClassController.createClass);
router.put("/class/:id", Auth.onlyAdmin, ClassController.updateClass);
router.put("/class-deactive/:id", Auth.onlyAdmin, ClassController.deactiveClass);
router.post("/register-by-student", Auth.auth, ClassController.studentRegisterClass);
router.post("/register-by-parent", Auth.auth, ClassController.parentRegisterClass);
router.post("/register-by-admin", Auth.onlyAdmin, ClassController.adminRegisterClass);
router.get("/registed-checker", ClassController.studentCheckRegisted);
router.get("/registed-checker-by-parent", ClassController.parentCheckStudentsRegisted);

//unregist
router.post("/unregister-by-student", Auth.auth, ClassController.studentUnRegisterClass);
router.post("/unregister-by-parent", Auth.auth, ClassController.parentUnRegisterClass);
router.post("/unregister-by-admin", Auth.onlyAdmin, ClassController.adminUnRegisterClass);

/* Teacher Controller */
router.get("/teacher", TeacherController.getTeachers);
router.get("/teacher/:id", TeacherController.getTeacherDetail);
// router.get("/my-teacher-detail", Auth.auth, TeacherController.getMyDetail);
// router.put("/my-teacher-detail", Auth.auth, TeacherController.updateMyDetail);
router.put("/teacher/:id", Auth.onlyAdmin, TeacherController.adminUpdateTeacherDetail);
router.post("/teacher", Auth.onlyAdmin, TeacherController.adminCreateTeacher);
router.post("/add-teacher-to-class", Auth.onlyAdmin, TeacherController.adminAssignTeacherToClass);
//need update
router.get("/teached-session", Auth.auth, TeacherController.getTeachedSessionInTime);
 
/* Request Controller */
router.get("/request", Auth.auth, RequestController.getMyRequest);
router.get("/request/:id", Auth.auth, RequestController.getRequestDetail);
router.post("/request", Auth.auth, RequestController.createConnect);
router.put("/request/:id", Auth.auth, RequestController.updateRequestStatus);
router.post("/request-remove", Auth.auth, RequestController.removeConnect);
router.get("/request-by-admin", Auth.onlyAdmin, RequestController.adminGetRequest);
router.post("/admin-create-connect", Auth.onlyAdmin, RequestController.adminCreateConnect);
router.post("/admin-remove-connect", Auth.onlyAdmin, RequestController.adminRemoveConnect);

/* Attendance Controller */
router.get("/attendances", Auth.auth, AttendanceController.getAttendance);
router.get("/attendance/:id", AttendanceController.getAttendanceDetail);
router.post("/attendance", Auth.auth, AttendanceController.createAttendance);
router.put("/attendance/:id", Auth.auth, AttendanceController.updateAttendance);
router.delete("/attendance/:id", Auth.auth, AttendanceController.removeAttendance);
router.get("/my-schedule", Auth.auth, AttendanceController.getMyScheduleAttendace);
router.get("/my-schedule-by-teacher", Auth.auth, AttendanceController.teacherGetMyScheduleAttendace);
router.get("/attendances-by-student", Auth.auth, AttendanceController.getAttendanceByStudent);
router.get("/attendances-by-parent", Auth.auth, AttendanceController.getAttendanceByParent);

/* Program Controller */
router.get("/programs", Auth.onlyAdmin, ProgramController.getProgram);
router.get("/program/:id", Auth.onlyAdmin, ProgramController.getProgramDetail);
router.post("/program", Auth.onlyAdmin, ProgramController.createProgram);
router.put("/program/:id", Auth.onlyAdmin, ProgramController.updateProgram);
router.post("/apply-program", Auth.onlyAdmin, ProgramController.applyProgram);
router.post("/remove-program", Auth.onlyAdmin, ProgramController.removeProgram);

/* Schedule Controller */
router.get("/schedules", Auth.onlyAdmin, ScheduleController.getSchedule);
router.get("/schedule/:id", Auth.onlyAdmin, ScheduleController.getScheduleDetail);
router.post("/schedule", Auth.onlyAdmin, ScheduleController.createSchedule);
router.put("/schedule/:id", Auth.onlyAdmin, ScheduleController.updateSchedule);
router.post("/apply-schedule", Auth.onlyAdmin, ScheduleController.applyScheduleToClass);
router.post("/remove-schedule", Auth.onlyAdmin, ScheduleController.removeScheduleFromClass);

/* Notification Controller */
router.get("/notifications", Auth.auth, NotificationController.getMyNoti);
router.post("/notification-seen/:id", Auth.auth, NotificationController.updateNotiStatus);

/* Transaction Controller */
router.get("/transactions", Auth.onlyAdmin, TransactionController.getTransactions);
router.get("/my-transactions", Auth.auth, TransactionController.getMyTransactions);
router.post("/transaction", Auth.onlyAdmin, TransactionController.adminCreateTransaction);
router.put("/transaction/:id", Auth.onlyAdmin, TransactionController.adminUpdateTransaction);
router.delete("/transaction/:id", Auth.onlyAdmin, TransactionController.adminDeleteTransaction);
router.get("/payment-success", Auth.auth, TransactionController.paymentSuccess);


/* Cost Controller */
router.get("/costs", Auth.onlyAdmin, CostController.getCosts);
router.get("/costs-by-parent", Auth.auth, CostController.parentGetCosts);
router.get("/costs-by-teacher", Auth.auth, CostController.teacherGetCosts);
router.get("/cost/:id", Auth.onlyAdmin, CostController.getCostDetail);
router.post("/cost-class", Auth.onlyAdmin, CostController.createClassCost);
router.post("/cost-teacher", Auth.onlyAdmin, CostController.createTeacherSalary);
router.post("/cost-other", Auth.onlyAdmin, CostController.createOtherCost);
router.put("/cost/:id", Auth.onlyAdmin, CostController.updateCost);
router.put("/cost-status/:id", Auth.onlyAdmin, CostController.adminUpdateCostStatus);

/* Search */
router.get("/search-student", SearchController.searchStudent);
router.get("/search-parent", SearchController.searchParent);
router.get("/search-teacher", SearchController.searchTeacher);
router.get("/search-class", SearchController.searchClass);
router.get("/search-center", SearchController.searchCenter);

/* Review */
router.get("/review-by-admin", Auth.onlyAdmin, ReviewController.getAttendanceReviews);
router.get("/review-by-teacher", Auth.auth, ReviewController.teacherGetAttendanceReviews);
router.get("/review-by-parent", Auth.auth, ReviewController.parentGetAttendanceReviews);
router.get("/review-by-student", Auth.auth, ReviewController.studentGetAttendanceReviews);
router.post("/review", Auth.auth, ReviewController.createReviews);
router.put("/review", Auth.auth, ReviewController.updateReviews);
router.delete("/review/:id", Auth.auth, ReviewController.deleteReviews);

module.exports = router;