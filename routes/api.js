var express = require("express");
const AuthController = require("../controllers/AuthController");
const Auth = require("../services/auth/auth");
const OrderController = require("../controllers/OrderController");
const PartnerController = require("../controllers/PartnerController");
const FormController = require("../controllers/FormController");
const MapController = require("../controllers/MapController");
const handleImage = require("../utils/uploadImages");
const AwsServiceController = require("../controllers/AwsServiceController");
const TransactionController = require("../controllers/TransactionController");
const UserController = require("../controllers/UserController");
var router = express.Router();

/* AWS Controller */
// router.post("/aws-upload-single-image", handleImage.uploadAws.single("image"), AwsServiceController.uploadImage);
// router.post(
// 	"/aws-upload-multiple-image",
// 	handleImage.uploadAws.array("images", 100),
// 	AwsServiceController.uploadMultipleImage,
// );

/* Auth Controllers */
router.post("/auth/login", AuthController.login);
router.post("/auth/signup", AuthController.signup);
router.get("/auth/me", Auth.auth, AuthController.me);
router.post("/auth/init-forget-password", AuthController.initForgetPassword);
router.post("/auth/update-forget-password", AuthController.updateForgetPassword);

/*User Controller */
router.get("/user-detail", Auth.auth, UserController.getMyDetail)
module.exports = router;