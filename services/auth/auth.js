const jwt = require("jsonwebtoken");
const JWT_CONFiG = require("../../config/jwt");
const { UserRole } = require("../../constants/roles");

class Auth {
    async auth(req, res, next) {
        try {
            const token = req.header("Authorization").replace("Bearer", "").trim();
            const decodeJwt = jwt.verify(token, JWT_CONFiG.SECRET_KEY);
            if(decodeJwt && decodeJwt.user_id && decodeJwt.role) {
                req.user = {
                    userId: decodeJwt.user_id,
                    email: decodeJwt.email,
                    role: decodeJwt.role
                }
            }
            next();
        }
        catch (error) {
            console.log(`==== error.name: `, error.name);
			error.message = "Vui lòng đăng nhập để sử dụng phần mềm";
			var nameError = "";
			if (error.name === "TokenExpiredError") {
				nameError = "TokenExpiredError";
			}
			error.code = 403;
			return res.status(403).json({ message: error.message, code: error.code, name: nameError });
        }
    }

    async onlyAdmin(req, res, next) {
        try {
            const token = req.header("Authorization").replace("Bearer", "").trim();
            const decodeJwt = jwt.verify(token, JWT_CONFiG.SECRET_KEY);
            if(decodeJwt && decodeJwt.user_id && decodeJwt.role) {
                req.user = {
                    userId: decodeJwt.user_id,
                    email: decodeJwt.email,
                    role: decodeJwt.role
                }
                if(![UserRole.Admin].includes(decodeJwt.role)) {
                    let message = "Chức năng chỉ dành cho admin";

                    return res.status(403).json({ message });
                }
            }
            next();
        }
        catch (error) {
            console.log(`==== error.name: `, error.name);
			error.message = "Vui lòng đăng nhập để sử dụng phần mềm";
			var nameError = "";
			if (error.name === "TokenExpiredError") {
				nameError = "TokenExpiredError";
			}
			error.code = 403;
			return res.status(403).json({ message: error.message, code: error.code, name: nameError });
        }
    }

    checkAuthen(userId, token) {
		try {
			if (token) {
				token = token.replace("Bearer", "").trim();
				const decodeJwt = jwt.verify(token, JWT_CONFiG.SECRET_KEY);
				if (decodeJwt.user_id === userId) {
					return true;
				}
			}
		} catch (err) {
			console.log(err); 
		}
		return false;
	}
}

module.exports = new Auth();