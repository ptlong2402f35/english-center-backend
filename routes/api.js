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
const AnalyticController = require("../controllers/AnalyticController");
const SmartCardController = require("../controllers/SmartCardController");
const Middleware = require("../services/middleware");
var router = express.Router();

//test connect
router.get("/test", AuthController.test);

/* Auth Controllers */
router.post("/auth/login", Middleware.loginLimit,  Middleware.processData, AuthController.login);
router.post("/auth/login-dev", Middleware.processData , AuthController.loginForDev);
router.post("/auth/signup", Middleware.processData , AuthController.signup);
router.get("/auth/me", Middleware.processData , Auth.auth, AuthController.me);
router.post("/auth/refresh", Middleware.processData , AuthController.refresh);
// wait for upd
router.post("/auth/init-forget-password", Middleware.processData , AuthController.initForgetPassword);
router.post("/auth/update-forget-password", Middleware.processData , AuthController.updateForgetPassword);
//otp
router.post("/auth/verify-otp", Middleware.processData , AuthController.verifyOtp);
router.post("/auth/google-authentication", Middleware.processData , AuthController.googleAuthentication);

/* User Controller */
router.get("/my-user-detail", Middleware.processData , Auth.auth, UserController.getMyDetail);
router.put("/my-user-detail", Middleware.processData , Auth.auth, UserController.updateDetail);
router.put("/user-password", Middleware.processData , Auth.auth, UserController.updatePassword);
router.get("/users", Middleware.processData , Auth.onlyAdmin, UserController.adminGetUsers);
router.post("/user", Middleware.processData , Auth.onlyAdmin, UserController.adminCreateUser);
router.get("/user-detail/:id", Middleware.processData , Auth.onlyAdmin, UserController.adminGetUserDetail);
router.put("/user-detail-by-admin/:id", Middleware.processData , Auth.onlyAdmin, UserController.adminUpdateUserDetail);
router.put("/user-password-by-admin/:id", Middleware.processData , Auth.onlyAdmin, UserController.adminUpdateUserPassword);

/* Student Controller */
// router.get("/my-student-detail", Middleware.processData , Auth.auth, StudentController.getMyDetail);
// router.put("/my-student-detail", Middleware.processData , Auth.auth, StudentController.updateMyDetail);
router.get("/student-connected", Middleware.processData , Auth.auth, StudentController.parentGetStudentConennected);
router.get("/student-detail-by-parent/:id", Middleware.processData , Auth.auth, StudentController.parentGetStudentDetail);
router.get("/students", Middleware.processData , Auth.onlyAdmin, StudentController.adminGetStudents);
router.post("/student", Middleware.processData , Auth.onlyAdmin, StudentController.adminCreateStudent);
router.get("/student-detail-by-admin/:id", Middleware.processData , Auth.onlyAdmin, StudentController.adminGetStudentDetail);
router.put("/student-detail-by-admin/:id", Middleware.processData , Auth.onlyAdmin, StudentController.adminUpdateStudentDetail);
router.put("/student-deactive", Middleware.processData , Auth.onlyAdmin, StudentController.adminDeactiveStudent);
router.post("/student-reduce-value", Middleware.processData , Auth.onlyAdmin, StudentController.adminUpdateStudentReduceValue);


/* Parent Controller */
// router.get("/my-parent-detail", Middleware.processData , Auth.auth, ParentController.getMyDetail);
// router.put("/my-parent-detail", Middleware.processData , Auth.auth, ParentController.updateMyDetail);
router.get("/parent-connected", Middleware.processData , Auth.auth, ParentController.studentGetParentConennected);
router.get("/parents", Middleware.processData , Auth.onlyAdmin, ParentController.adminGetParents);
router.get("/parent-detail-by-admin/:id", Middleware.processData , Auth.onlyAdmin, ParentController.adminGetParentDetail);
router.post("/parent", Middleware.processData , Auth.onlyAdmin, ParentController.adminCreateParent);
router.put("/parent-detail-by-admin/:id", Middleware.processData , Auth.onlyAdmin, ParentController.adminUpdateParentDetail);
router.put("/parent-deactive", Middleware.processData , Auth.onlyAdmin, ParentController.adminDeactiveParent);

/* Center Controller */
router.get("/centers", Middleware.processData , CenterController.getCenter);
router.get("/center/:id", Middleware.processData , CenterController.getCenterDetail);
router.post("/center", Middleware.processData , Auth.onlyAdmin, CenterController.createCenter);
router.put("/center/:id", Middleware.processData , Auth.onlyAdmin, CenterController.updateCenter);
router.delete("/center/:id", Middleware.processData , Auth.onlyAdmin, CenterController.adminDeleteCenter);

/* Class Controller */
router.get("/class", Middleware.processData , ClassController.getClasses);
router.get("/class/:id", Middleware.processData , ClassController.getClassDetail);
router.get("/my-class", Middleware.processData , Auth.auth, ClassController.getMyClass);
router.get("/class-by-teacher", Middleware.processData , Auth.auth, ClassController.teacherGetClass);
router.get("/class-by-parent/:studentId", Middleware.processData , Auth.auth, ClassController.parentGetStudentClass);
router.post("/class", Middleware.processData , Auth.onlyAdmin, ClassController.createClass);
router.put("/class/:id", Middleware.processData , Auth.onlyAdmin, ClassController.updateClass);
router.put("/class-deactive/:id", Middleware.processData , Auth.onlyAdmin, ClassController.deactiveClass);
router.delete("/class/:id", Middleware.processData , Auth.onlyAdmin, ClassController.deleteClass);
router.post("/register-by-student", Middleware.processData , Auth.auth, ClassController.studentRegisterClass);
router.post("/register-by-parent", Middleware.processData , Auth.auth, ClassController.parentRegisterClass);
router.post("/register-by-admin", Middleware.processData , Auth.onlyAdmin, ClassController.adminRegisterClass);
router.get("/registed-checker", Middleware.processData , ClassController.studentCheckRegisted);
router.get("/registed-checker-by-parent", Middleware.processData , ClassController.parentCheckStudentsRegisted);

//unregist
router.post("/unregister-by-student", Middleware.processData , Auth.auth, ClassController.studentUnRegisterClass);
router.post("/unregister-by-parent", Middleware.processData , Auth.auth, ClassController.parentUnRegisterClass);
router.post("/unregister-by-admin", Middleware.processData , Auth.onlyAdmin, ClassController.adminUnRegisterClass);

/* Teacher Controller */
router.get("/teacher", Middleware.processData , TeacherController.getTeachers);
router.get("/teacher/:id", Middleware.processData , TeacherController.getTeacherDetail);
// router.get("/my-teacher-detail", Middleware.processData , Auth.auth, TeacherController.getMyDetail);
// router.put("/my-teacher-detail", Middleware.processData , Auth.auth, TeacherController.updateMyDetail);
router.put("/teacher/:id", Middleware.processData , Auth.onlyAdmin, TeacherController.adminUpdateTeacherDetail);
router.post("/teacher", Middleware.processData , Auth.onlyAdmin, TeacherController.adminCreateTeacher);
router.post("/add-teacher-to-class", Middleware.processData , Auth.onlyAdmin, TeacherController.adminAssignTeacherToClass);
router.put("/update-teacher-to-class", Middleware.processData , Auth.onlyAdmin, TeacherController.adminUpdateTeacherToClass);
//need update
router.get("/teached-session", Middleware.processData , Auth.auth, TeacherController.getTeachedSessionInTime);
 
/* Request Controller */
router.get("/request", Middleware.processData , Auth.auth, RequestController.getMyRequest);
router.get("/request/:id", Middleware.processData , Auth.auth, RequestController.getRequestDetail);
router.post("/request", Middleware.processData , Auth.auth, RequestController.createConnect);
router.put("/request/:id", Middleware.processData , Auth.auth, RequestController.updateRequestStatus);
router.post("/request-remove", Middleware.processData , Auth.auth, RequestController.removeConnect);
router.get("/request-by-admin", Middleware.processData , Auth.onlyAdmin, RequestController.adminGetRequest);
router.post("/admin-create-connect", Middleware.processData , Auth.onlyAdmin, RequestController.adminCreateConnect);
router.post("/admin-remove-connect", Middleware.processData , Auth.onlyAdmin, RequestController.adminRemoveConnect);

/* Attendance Controller */
router.get("/attendances", Middleware.processData , Auth.auth, AttendanceController.getAttendance);
router.get("/attendance/:id", Middleware.processData , AttendanceController.getAttendanceDetail);
router.post("/attendance", Middleware.processData , Auth.auth, AttendanceController.createAttendance);
router.put("/attendance/:id", Middleware.processData , Auth.auth, AttendanceController.updateAttendance);
router.delete("/attendance/:id", Middleware.processData , Auth.auth, AttendanceController.removeAttendance);
router.get("/my-schedule", Middleware.processData , Auth.auth, AttendanceController.getMyScheduleAttendace);
router.get("/my-schedule-by-teacher", Middleware.processData , Auth.auth, AttendanceController.teacherGetMyScheduleAttendace);
router.get("/attendances-by-student", Middleware.processData , Auth.auth, AttendanceController.getAttendanceByStudent);
router.get("/attendances-by-parent", Middleware.processData , Auth.auth, AttendanceController.getAttendanceByParent);

/* Program Controller */
router.get("/programs", Middleware.processData , Auth.onlyAdmin, ProgramController.getProgram);
router.get("/program/:id", Middleware.processData , Auth.onlyAdmin, ProgramController.getProgramDetail);
router.post("/program", Middleware.processData , Auth.onlyAdmin, ProgramController.createProgram);
router.put("/program/:id", Middleware.processData , Auth.onlyAdmin, ProgramController.updateProgram);
router.post("/apply-program", Middleware.processData , Auth.onlyAdmin, ProgramController.applyProgram);
router.post("/remove-program", Middleware.processData , Auth.onlyAdmin, ProgramController.removeProgram);

/* Schedule Controller */
router.get("/schedules", Middleware.processData , Auth.onlyAdmin, ScheduleController.getSchedule);
router.get("/schedule/:id", Middleware.processData , Auth.onlyAdmin, ScheduleController.getScheduleDetail);
router.post("/schedule", Middleware.processData , Auth.onlyAdmin, ScheduleController.createSchedule);
router.put("/schedule/:id", Middleware.processData , Auth.onlyAdmin, ScheduleController.updateSchedule);
router.post("/apply-schedule", Middleware.processData , Auth.onlyAdmin, ScheduleController.applyScheduleToClass);
router.post("/remove-schedule", Middleware.processData , Auth.onlyAdmin, ScheduleController.removeScheduleFromClass);
router.put("/update-bulk-schedule", Middleware.processData , Auth.onlyAdmin, ScheduleController.updateScheduleClass);

/* Notification Controller */
router.get("/notifications", Middleware.processData , Auth.auth, NotificationController.getMyNoti);
router.post("/notification-seen/:id", Middleware.processData , Auth.auth, NotificationController.updateNotiStatus);

/* Transaction Controller */
router.get("/transactions", Middleware.processData , Auth.onlyAdmin, TransactionController.getTransactions);
router.get("/my-transactions", Middleware.processData , Auth.auth, TransactionController.getMyTransactions);
router.post("/transaction", Middleware.processData , Auth.onlyAdmin, TransactionController.adminCreateTransaction);
router.put("/transaction/:id", Middleware.processData , Auth.onlyAdmin, TransactionController.adminUpdateTransaction);
router.delete("/transaction/:id", Middleware.processData , Auth.onlyAdmin, TransactionController.adminDeleteTransaction);
router.post("/payment-success", Middleware.processData , Auth.auth, TransactionController.paymentSuccess);


/* Cost Controller */
router.get("/costs", Middleware.processData , Auth.onlyAdmin, CostController.getCosts);
router.get("/costs-by-parent", Middleware.processData , Auth.auth, CostController.parentGetCosts);
router.get("/costs-by-teacher", Middleware.processData , Auth.auth, CostController.teacherGetCosts);
router.get("/cost/:id", Middleware.processData , Auth.onlyAdmin, CostController.getCostDetail);
router.post("/cost-class", Middleware.processData , Auth.onlyAdmin, CostController.createClassCost);
router.post("/cost-to-student", Middleware.processData , Auth.onlyAdmin, CostController.createClassCostForSingleStudent);
router.post("/cost-teacher", Middleware.processData , Auth.onlyAdmin, CostController.createTeacherSalary);
router.post("/cost-other", Middleware.processData , Auth.onlyAdmin, CostController.createOtherCost);
router.post("/cost-bonus-teacher", Middleware.processData , Auth.onlyAdmin, CostController.createBonusCost);
router.put("/cost/:id", Middleware.processData , Auth.onlyAdmin, CostController.updateCost);
router.put("/cost-status/:id", Middleware.processData , Auth.onlyAdmin, CostController.adminUpdateCostStatus);
router.delete("/cost/:id", Middleware.processData , Auth.onlyAdmin, CostController.adminDeleteCost);

/* Search */
router.get("/search-student", Middleware.processData , SearchController.searchStudent);
router.get("/search-parent", Middleware.processData , SearchController.searchParent);
router.get("/search-teacher", Middleware.processData , SearchController.searchTeacher);
router.get("/search-class", Middleware.processData , SearchController.searchClass);
router.get("/search-center", Middleware.processData , SearchController.searchCenter);
router.get("/search-schedule", Middleware.processData , SearchController.searchSchedule);
router.get("/search-program", Middleware.processData , SearchController.searchProgram);
router.get("/search-teacher-work", Middleware.processData , SearchController.searchTeacherWork);
router.get("/search-class-work", Middleware.processData , SearchController.searchClassWork);
router.get("/search-student-work", Middleware.processData , SearchController.searchStudentWork);

/* Review */
router.get("/review-by-admin", Middleware.processData , Auth.onlyAdmin, ReviewController.getAttendanceReviews);
router.get("/review-by-teacher", Middleware.processData , Auth.auth, ReviewController.teacherGetAttendanceReviews);
router.get("/review-by-parent", Middleware.processData , Auth.auth, ReviewController.parentGetAttendanceReviews);
router.get("/review-by-student", Middleware.processData , Auth.auth, ReviewController.studentGetAttendanceReviews);
router.post("/review", Middleware.processData , Auth.auth, ReviewController.createReviews);
router.put("/review", Middleware.processData , Auth.auth, ReviewController.updateReviews);
router.delete("/review/:id", Middleware.processData , Auth.auth, ReviewController.deleteReviews);

/* Analytics */
router.get("/user-analytics", Middleware.processData , Auth.onlyAdmin, AnalyticController.getUserAnalytic);

/* Firebase message */
router.get("/message-send-test", Middleware.processData , UserController.testNoti);
router.post("/update-user-message-token", Middleware.processData , Auth.auth, UserController.updateUserMessageToken);
router.post("/remove-user-message-token", Middleware.processData , Auth.auth, UserController.removeUserMessageToken);

/* SmartCard */
router.get("/card/user-info/:cardId", Middleware.processData , SmartCardController.getUserDetail);
router.post("/card/create", Middleware.processData , SmartCardController.createCardUser);
router.post("/card/update", Middleware.processData , SmartCardController.updateDetail);
router.get("/card/estimate-point", Middleware.processData , SmartCardController.estimatePointByFee);
router.post("/card/purchase", Middleware.processData , SmartCardController.addPointByPurchase);
router.post("/card/exchange-reward", Middleware.processData , SmartCardController.minusPoint);

module.exports = router;