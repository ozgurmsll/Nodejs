const { validationResult } = require("express-validator");
const passport = require("passport");
const User = require("../model/user");
require("../confing/passport")(passport);
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const index = (req, res, next) => {
  res.render("/", { layout: "./layout/index.ejs" });
};
const loginForumunuGoster = (req, res, next) => {
  res.render("login", { layout: "./layout/auth_layout.ejs" });
};

const registerForumunuGoster = (req, res, next) => {
  res.render("register", { layout: "./layout/auth_layout.ejs" });
};

const forgetRegisterForumunuGoster = (req, res, next) => {
  res.render("forget_password", { layout: "./layout/auth_layout.ejs" });
};
const forgetPassword = async (req, res, next) => {
  const HatalarDizisi = validationResult(req);

  if (!HatalarDizisi.isEmpty()) {
    req.flash("validation_error", HatalarDizisi.array());
    req.flash("email", req.body.email);

    //console.log(req.session);
    res.redirect("/forget-password");
  }
  //burası calısıyorsa kullanıcı düzgün bir mail girmiştir
  else {
    try {
      const _user = await User.findOne({
        email: req.body.email,
        emailAktif: true,
      });

      if (_user) {
        //kullanıcıya şifre sıfırlama maili atılabilir
        const jwtInfo = {
          id: _user._id,
          mail: _user.email,
        };
        const secret = process.env.RESET_PASSWORD + "-" + _user.sifre;
        const jwtToken = jwt.sign(jwtInfo, secret, { expiresIn: "1d" });

        //MAIL GONDERME ISLEMLERI
        const url =
          process.env.WEB_SITE_URL +
          "reset-password/" +
          _user._id +
          "/" +
          jwtToken;

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_SIFRE,
          },
        });

        await transporter.sendMail(
          {
            from: "Nodejs Uygulaması <info@nodejskursu.com",
            to: _user.email,
            subject: "Şifre Güncelleme",
            text: "Şifrenizi oluşturmak için lütfen şu linki tıklayın:" + url,
          },
          (error, info) => {
            if (error) {
              console.log("bir hata var" + error);
            }
            console.log("Mail gönderildi");
            console.log(info);
            transporter.close();
          }
        );

        req.flash("success_message", [
          { msg: "Lütfen mail kutunuzu kontrol edin" },
        ]);
        res.redirect("/login");
      } else {
        req.flash("validation_error", [
          { msg: "Bu mail kayıtlı değil veya Kullanıcı pasif" },
        ]);
        req.flash("email", req.body.email);
        res.redirect("forget-password");
      }
      //jwt işlemleri
    } catch (err) {
      console.log("user kaydedilirken hata cıktı " + err);
    }
  }

  //res.render('forget_password', { layout: './layout/auth_layout.ejs' });
};

///-----------------------
const register = async (req, res, next) => {
  const HatalarDizisi = validationResult(req);
  if (!HatalarDizisi.isEmpty()) {
    /// buradaki hatalar boş degilse flasha alttakileri yükleriz

    req.flash("validation_error", HatalarDizisi.array()); // cıkan hataları diziye cevirip bu yapıya ekliyoruz
    // kayıt olsun diye hatadan sonra
    req.flash("email", req.body.email);
    req.flash("ad", req.body.ad);
    req.flash("soyad", req.body.soyad);
    req.flash("sifre", req.body.sifre);
    req.flash("sifre2", req.body.sifre2);

    res.redirect("/register");
  } else {
    try {
      const _user = await User.findOne({ email: req.body.email });
      if (_user && _user.emailAktif == true) {
        req.flash("validation_error", [{ msg: "Bu mail kullanımda" }]);
        req.flash("email", req.body.email);
        req.flash("ad", req.body.ad);
        req.flash("soyad", req.body.soyad);
        req.flash("sifre", req.body.sifre);
        req.flash("sifre2", req.body.sifre2);
        res.redirect("/register");
      } else if ((_user && _user.emailAktif == false) || _user == null) {
        if (_user) {
          await User.findByIdAndRemove({ _id: _user.id });
        }
        const newUser = new User({
          email: req.body.email,
          ad: req.body.ad,
          soyad: req.body.soyad,
          sifre: await bcrypt.hash(req.body.sifre, 10),
        });
        await newUser.save();

        const jwtInfo = {
          id: newUser.id,
          mail: newUser.email,
        };
        // token oluşturuyoz
        const jwtToken = jwt.sign(
          jwtInfo,
          process.env.CONFIRM_MAIL_JWT_SECRET,
          { expiresIn: "1d" }
        );

        // maıl gonderme
        const url = process.env.WEB_SITE_URL + "verify?id=" + jwtToken;
        let transporter = nodemailer.createTransport({
          service: "gmail",

          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_SIFRE,
          },
        });
        transporter.sendMail(
          {
            from: "Nodejs uygulaması",
            to: newUser.email,
            subject: "Emailinizi Lütfen Onaylayın",
            text: "Emailiniz onaylamak için lütfen tıklayın " + url,
          },
          (error, info) => {
            if (error) {
              console.log("bir hata var " + error);
            }
            console.log("mail gonderildi");
            console.log(info);
            transporter.close();
          }
        );
        req.flash("success_message", [
          {
            msg: "Kayıt Başarı ile tamamlandı,Lütfen mail kutunuzu kontrol ediniz",
          },
        ]);
        res.redirect("/login");
      }
    } catch (error) {
      console.log("kayıtta hata cıktı" + error);
    }
  }
  return true;
};

const login = (req, res, next) => {
  const HatalarDizisi = validationResult(req);
  req.flash("email", req.body.email);
  req.flash("sifre", req.body.sifre);
  if (!HatalarDizisi.isEmpty()) {
    req.flash("validation_error", HatalarDizisi.array());

    res.redirect("/login");
  } else {
    passport.authenticate("local", {
      successRedirect: "/yonetim",
      failureRedirect: "login",
      failureFlash: true,
    })(req, res, next);
  }
};
const fgPassword = (req, res, next) => {
  console.log(req.body);
  res.render("forget_password", { layout: "./layout/auth_layout.ejs" });
};
///-----------------------

const logout = (req, res, next) => {
  // req.logout();

  req.session.destroy((error) => {
    res.clearCookie("connect.sid"); // bk
    // req.flash('success_message',[{msg:'Başarıyla Cıkış yapıldı'}])
    res.render("login", {
      layout: "./layout/auth_layout.ejs",
      success_message: [{ msg: "Başarıyla cıkış yapıldı" }],
    });
  });
};
const verifyMail = (req, res, next) => {
  const token = req.query.id;
  if (token) {
    try {
      jwt.verify(
        token,
        process.env.CONFIRM_MAIL_JWT_SECRET,
        async (e, decoded) => {
          if (e) {
            req.flash("error", "Kod hatalı veya Süresi Geçmiş");
            res.redirect("/login");
          } else {
            const tokenIcindekiId = decoded.id;
            const result = await User.findByIdAndUpdate(tokenIcindekiId, {
              emailAktif: true,
            });
            if (result) {
              req.flash("success_message", [
                { msg: "Başarı İle Mail onaylandı" },
              ]);
              res.redirect("/login");
            } else {
              req.flash("error", "Lütfen tekrar kullanıcı oluşturun ");
              res.redirect("/login");
            }
          }
        }
      );
    } catch (error) {}
  } else {
  }
};

const yeniSifreyiKaydet=async(req,res,next)=>{
  const HatalarDizisi = validationResult(req);
  if (!HatalarDizisi.isEmpty()) {
    /// buradaki hatalar boş degilse flasha alttakileri yükleriz

    req.flash("validation_error", HatalarDizisi.array()); // cıkan hataları diziye cevirip bu yapıya ekliyoruz
    // kayıt olsun diye hatadan sonra
   
    req.flash("sifre", req.body.sifre);
    req.flash("sifre2", req.body.sifre2);

    res.redirect("/reset-password/"+req.body.id+"/"+req.body.token);
  }else{
    const _bulunanUser = await User.findOne({ _id: req.body.id ,emailAktif:true});
    const secret = process.env.RESET_PASSWORD + "-" +_bulunanUser.sifre;

    try {
      jwt.verify(req.body.token, secret, async (e, decoded) => {
        if (e) {
          req.flash("error", "Kod hatalı veya Süresi Geçmiş");
          res.redirect("/forget-password");
        } else {

          // yeni sifreyi kaydetme
            const hashSifre=await bcrypt.hash(req.body.sifre,10)
            const result = await User.findByIdAndUpdate(req.body.id, {
              sifre: hashSifre,
            });
            if (result) {
              req.flash("success_message", [
                { msg: "Başarı İle şifre güncellendi" },
              ]);
              res.redirect("/login");
            } else {
              req.flash("error", "Lütfen tekrar deneyin oluşturun ");
              res.redirect("/login");
            }
        }
      });
    } catch (error) {}










   
  }
}



const yeniSifreFormuGoster = async (req, res, next) => {
  const linktekiId = req.params.id;
  const token = req.params.token;
  if (linktekiId && token) {
    const _bulunanUser = await User.findOne({ _id: linktekiId });
    const secret = process.env.RESET_PASSWORD + "-" +_bulunanUser.sifre;

    try {
      jwt.verify(token, secret, async (e, decoded) => {
        if (e) {
          req.flash("error", "Kod hatalı veya Süresi Geçmiş");
          res.redirect("/forget-password");
        } else {

          res.render('new_password',{id:linktekiId,token:token, layout: "./layout/auth_layout.ejs"})
          // const tokenIcindekiId = decoded.id;
          // const result = await User.findByIdAndUpdate(tokenIcindekiId, {
          //   emailAktif: true,
          // });
          // if (result) {
          //   req.flash("success_message", [
          //     { msg: "Başarı İle Mail onaylandı" },
          //   ]);
          //   res.redirect("/forget-password");
          // } else {
          //   req.flash("error", "Lütfen tekrar kullanıcı oluşturun ");
          //   res.redirect("/login");
          // }
        }
      });
    } catch (error) {}
  } else {
    req.flash("validation_error", [
      { msg: "lütfen Maile gelen link e tıklayınız.Token Bulunamadı" },
    ]);
    res.redirect("forget-password");
  }
};



module.exports = {
  loginForumunuGoster,
  registerForumunuGoster,
  forgetRegisterForumunuGoster,
  register,
  login,
  fgPassword,
  logout,
  index,
  verifyMail,
  forgetPassword,
  yeniSifreFormuGoster,
  yeniSifreyiKaydet
};
