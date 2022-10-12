const LocalStrategy = require("passport-local").Strategy;
const User = require("../model/user");
const bcrypt = require("bcrypt");

module.exports = function (passport) {
  const options = {
    usernameField: "email",
    passwordField: "sifre",
  };
  passport.use(
    new LocalStrategy(options, async (email, sifre, done) => {
      try {
        const _bulunanUser = await User.findOne({ email: email });

        if (!_bulunanUser) {
          return done(null, false, { message: "User bulunamadı" });
        }

        const sifreKontrol = await bcrypt.compare(sifre, _bulunanUser.sifre);
        if (!sifreKontrol) {
          return done(null, false, { message: "Şifre hatalı" });
        } else {
          if (_bulunanUser && _bulunanUser.emailAktif === false) {
            return done(null, false, { message: "Lütfen emailiniz onaylayın" });
          } else return done(null, _bulunanUser);
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    // session yapısına id degerini kaydettik
    done(null, user.id);
  });
  // id degerini parametre olarak geçildi db de arandı ve geri verdi
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
