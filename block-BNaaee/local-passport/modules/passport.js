const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
      console.log(email, password);
      if (err) return done(err);
      if (!user) return done(err, false);
      user.verifyPassword(password, (err, result) => {
        if (err) return done(err);
        if (!result) {
          return done(err, false);
        }
        return done(null, user);
      });
    });
  })
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) return done(err);
    done(null, user);
  });
});
