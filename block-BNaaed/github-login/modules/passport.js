var passport = require("passport");
var GitHubStrategy = require("passport-github").Strategy;
var User = require("../models/User");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (acessToken, refereshToken, profile, done) => {
      const profileData = {
        name: profile.displayName,
        email: profile._json.email,
        username: profile.username,
        photo: profile._json.avatar_url,
      };
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(profileData, (err, createdUser) => {
            if (err) return done(err);
            return done(null, createdUser);
          });
        } else {
          done(null, user);
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
