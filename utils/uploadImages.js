const fs = require("fs");
const multer = require("multer");

var uuid = require("uuid");

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/jpeg" ||
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/webp" ||
		file.mimetype === "image/gif" ||
		file.mimetype === "image/bmp" ||
		file.mimetype === "image/heic" ||
		file.mimetype === "image/heif" ||
		file.mimetype === "image/avif" ||
		file.mimetype === "image/heic-sequence" ||
		file.mimetype === "image/heif-sequence" ||
		file.mimetype === "image/avif-sequence"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const path = `public/uploads/images`;
		fs.mkdirSync(path, { recursive: true });
		cb(null, path);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + uuid.v4() + "-" + file.originalname.replace(/\s/g, "")); //Luu ten file va xoa khoang trang trong ten
	},
});
const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 100, fieldSize: 1024 * 1024 * 100 },
	fileFilter: fileFilter,
});

const storageAws = multer.memoryStorage({
	destination: function (req, file, callback) {
		callback(null, "");
	},
});
const uploadAws = multer({
	storageAws,
	limits: { fileSize: 1024 * 1024 * 200, fieldSize: 1024 * 1024 * 200 },
	fileFilter: fileFilter,
});

module.exports = { upload, uploadAws };
