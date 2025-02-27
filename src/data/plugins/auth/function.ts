var passport = require("passport");
// var LocalStrategy = require("passport-local");
var crypto = require("crypto");
// const user = Container.get("database").user;

export const register = async (id: string = "local") => async (_, next) => {
  passport.use(
    id ?? "local",
    // new LocalStrategy(function verify(username, password, cb) {
    //   db.get(
    //     "SELECT * FROM users WHERE username = ?",
    //     [username],
    //     function (err, user) {
    //       if (err) {
    //         return cb(err);
    //       }
    //       if (!user) {
    //         return cb(null, false, {
    //           message: "Incorrect username or password.",
    //         });
    //       }

    //       crypto.pbkdf2(
    //         password,
    //         user.salt,
    //         310000,
    //         32,
    //         "sha256",
    //         function (err, hashedPassword) {
    //           if (err) {
    //             return cb(err);
    //           }
    //           if (
    //             !crypto.timingSafeEqual(
    //               user.hashed_password,
    //               hashedPassword
    //             )
    //           ) {
    //             return cb(null, false, {
    //               message: "Incorrect username or password.",
    //             });
    //           }
    //           return cb(null, user);
    //         }
    //       );
    //     }
    //   );
    // // })
  );
  await next()
};

export const authenticate = async (id?: string) => async (context, next) => passport.authenticate(id ?? "local")(context.req, context.res, next);
