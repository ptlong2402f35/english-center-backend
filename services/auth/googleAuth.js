const { OAuth2Client } = require("google-auth-library");
const { Op } = require("sequelize");
const { AuthService } = require("./authService");
const User = require("../../models").User;
const GOOGLE_CLIENT_IDS = [
    "517452750917-0l3pd2idno9qspbtlga3io5sva2vrtbc.apps.googleusercontent.com",
    "517452750917-1es67ivk5acmsf35fagdtpoct748daog.apps.googleusercontent.com",
    "517452750917-a4j0b28ftgq7vn0vm1bjj8ckg6hh5ri5.apps.googleusercontent.com",
 ];
  
const client = new OAuth2Client();

class GoogleAuth {
    authService;
    constructor() {
        this.authService = new AuthService();
    }

    googleLogin = async (idToken) => {
        try{
            let payload = await this.verifyGoogleToken(idToken);
            if(payload?.email_verified) {
                let user = await User.findOne(
                    {
                        where: {
                            email: {
                                [Op.iLike]: `%${payload.email}%`
                            }
                        }
                    }
                );
                if(!user) return {
                    action: false,
                    accessToken: null,
                    refreshToken: null,
                    expiredIn: null
                }
                let resp = await this.authService.generateToken(user);
                return {
                    action: true,
                    ...resp
                }
            }
        }
        catch (err) {
            throw err;
        }
    }

    verifyGoogleToken = async (idToken) => {
        try {
          const ticket = await client.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_IDS,
          });
      
          const payload = ticket.getPayload();
      
          // payload {
          //   iss: 'https://accounts.google.com',
          //   azp: '245891372928-g176elffnha8j2ifck45s5rm71b6d4nb.apps.googleusercontent.com',
          //   aud: '245891372928-g176elffnha8j2ifck45s5rm71b6d4nb.apps.googleusercontent.com',
          //   sub: '113372324179426767730',
          //   email: 'nguyenhieu021111@gmail.com',
          //   email_verified: true,
          //   at_hash: '9RRbSqmkBmL7DqSTf_H9Tw',
          //   nonce: 'I3uoHdcDgIraRG2JlCIR_BZlzbseiaRrUDbUeQmC_VA',
          //   name: 'Nguyễn Hiếu',
          //   picture: 'https://lh3.googleusercontent.com/a/ACg8ocKY45iZMLqI6RqrKfjpuN_btk9-DbvjuFB9cZ8_afQqOba2DE4=s96-c',
          //   given_name: 'Nguyễn',
          //   family_name: 'Hiếu',
          //   iat: 1741102441,
          //   exp: 1741106041
          // }
      
          return payload;
        } catch (error) {
          console.error("Error verifying Google ID Token:", error);
          throw new Error("Invalid token");
        }
      };

  }

  module.exports = {
    GoogleAuth
  }
  
    