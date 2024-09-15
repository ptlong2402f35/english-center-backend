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
var router = express.Router();

//test connect
router.get("/test", AuthController.test);

/* Auth Controllers */
router.post("/auth/login", AuthController.login);
router.post("/auth/login-dev", AuthController.loginForDev);
router.post("/auth/signup", AuthController.signup);
router.get("/auth/me", Auth.auth, AuthController.me);
router.post("/auth/refresh", AuthController.refresh);
router.post("/auth/init-forget-password", AuthController.initForgetPassword);
router.post("/auth/update-forget-password", AuthController.updateForgetPassword);

/* User Controller */
router.get("/my-user-detail", Auth.auth, UserController.getMyDetail);
router.put("/my-user-detail", Auth.auth, UserController.updateDetail);
router.put("/user-password", Auth.auth, UserController.updatePassword);
router.get("/users", Auth.onlyAdmin, UserController.adminGetUsers);
router.post("/user", Auth.onlyAdmin, UserController.adminCreateUser);
router.get("/user-detail/:id", Auth.onlyAdmin, UserController.adminCreateUser);
router.put("/user-detail-by-admin/:id", Auth.onlyAdmin, UserController.adminUpdateUserDetail);
router.put("/user-deactive", Auth.onlyAdmin, UserController.adminDeactiveUser);

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
router.get("/parent-detail-by-admin", Auth.onlyAdmin, ParentController.adminGetParentDetail);
router.post("/parent", Auth.onlyAdmin, ParentController.adminCreateParent);
router.put("/parent-detail-by-admin", Auth.onlyAdmin, ParentController.adminUpdateParentDetail);
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
router.post("/register-by-student/:id", Auth.auth, ClassController.studentRegisterClass);
router.post("/register-by-parent/:id", Auth.auth, ClassController.parentRegisterClass);
router.post("/register-by-admin", Auth.auth, ClassController.adminRegisterClass);

/* Teacher Controller */
router.get("/teacher", TeacherController.getTeachers);
router.get("/teacher/:id", TeacherController.getTeacherDetail);
router.get("/my-teacher-detail", Auth.auth, TeacherController.getMyDetail);
router.put("/my-teacher-detail", Auth.auth, TeacherController.updateMyDetail);
router.put("/teacher/:id", Auth.onlyAdmin, TeacherController.adminUpdateTeacherDetail);
router.post("/teacher", Auth.onlyAdmin, TeacherController.adminCreateTeacher);
router.post("/teacher-to-class", Auth.onlyAdmin, TeacherController.adminAssignTeacherToClass);
router.post("/teacher", Auth.auth, TeacherController.getSalaryHistory);

/* Request Controller */
router.get("/request", Auth.auth, TeacherController.getTeachers);
router.post("/request/:id", Auth.auth, TeacherController.getTeachers);
router.put("/request/:id", Auth.auth, TeacherController.getTeachers);
router.post("/request-remove", Auth.auth, TeacherController.getTeachers);

/* Attendance Controller */
router.get("/attendances", Auth.auth, TeacherController.getTeachers);
router.get("/attendance/:id", TeacherController.getTeachers);
router.post("/attendance/:id", Auth.auth, TeacherController.getTeachers);
router.put("/attendance/:id", Auth.auth, TeacherController.getTeachers);
router.get("/attendances-by-admin", Auth.onlyAdmin, TeacherController.getTeachers);
router.post("/attendance-by-admin/:id", Auth.onlyAdmin, TeacherController.getTeachers);
router.put("/attendance-by-admin/:id", Auth.onlyAdmin, TeacherController.getTeachers);

/* Program Controller */
router.get("/programs", Auth.onlyAdmin, TeacherController.getTeachers);
router.get("/program/:id", Auth.onlyAdmin, TeacherController.getTeachers);
router.post("/program", Auth.onlyAdmin, TeacherController.getTeachers);
router.put("/program/:id", Auth.onlyAdmin, TeacherController.getTeachers);
router.post("/apply-program", Auth.onlyAdmin, TeacherController.getTeachers);

/* Schedule Controller */
router.get("/schedules", Auth.onlyAdmin, ScheduleController.getSchedule);
router.get("/schedule/:id", Auth.onlyAdmin, ScheduleController.getScheduleDetail);
router.post("/schedule", Auth.onlyAdmin, ScheduleController.createSchedule);
router.put("/schedule/:id", Auth.onlyAdmin, ScheduleController.updateSchedule);
router.post("/apply-schedule", Auth.onlyAdmin, ScheduleController.applyScheduleToClass);
router.post("/remove-schedule", Auth.onlyAdmin, ScheduleController.removeScheduleFromClass);

/* Notification Controller */
router.get("/notifications", Auth.auth, TeacherController.getTeachers);

/* Transaction Controller */
router.get("/transactions", Auth.auth, TeacherController.getTeachers);

/* Cost Controller */
router.get("/costs", Auth.onlyAdmin, TeacherController.getTeachers);
router.get("/cost/:id", Auth.onlyAdmin, TeacherController.getTeachers);
router.post("/cost", Auth.onlyAdmin, TeacherController.getTeachers);
router.post("/payment-sucess", Auth.onlyAdmin, TeacherController.getTeachers);



module.exports = router;