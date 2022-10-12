const dotenv = require("dotenv").config();
const express = require("express");
const app = express();

const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport');

//templateEngine ayarları
const expressLayouts = require("express-ejs-layouts");
const ejs = require("ejs");
app.use(expressLayouts);
app.use(express.static("public"));

const path = require("path");

// view enginenin ejs olarak kullanılmasını istedik
app.set("view engine", "ejs");

// view klasörünün yerini belitiyorz
app.set("views", path.resolve(__dirname, "./src/views"));

app.use("/uploads", express.static(path.join(__dirname,'/src/uploads')))

// db baglantısı
require("./src/confing/database");
const MongoDBStore = require("connect-mongodb-session")(session);

const sessionStro = new MongoDBStore(
  {
    uri: process.env.MONGODB_CONNECTION_STRING,
    collection: "session",
  },
 
);


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 gün boyunca kayıtlı olck cookcie
    },
    store:sessionStro
  })
);


//f msg md olarak kullanılması için
app.use(flash());
// redirect işlemi oldugunda
app.use((req, res, next) => {
  res.locals.validation_error = req.flash("validation_error");
  // hata sonrası hatasız yerler kaybolmasın diye
  res.locals.success_message=req.flash("success_message")
  res.locals.ad = req.flash("ad");
  res.locals.soyad = req.flash("soyad");
  res.locals.email = req.flash("email");
  res.locals.sifre = req.flash("sifre");
  res.locals.sifre2 = req.flash("sifre2");
  res.locals.login_error=req.flash('error');// mongodbden alduk

  next();
});
app.use(passport.initialize());
app.use(passport.session());

// routerlar include edilir
const authRouter = require("./src/router/aut_router");
const yonetimRouter=require("./src/router/yonetim_router");

// formdan gelen degerlerin parse edilmesi okunması için
app.use(express.urlencoded({ extended: true }));

app.use("/", authRouter);
app.use("/yonetim",yonetimRouter)




// herkese acık olan
let sayac = 0;
app.get("/", (req, res) => {
  if (req.session.sayac) {
    req.session.sayac++;
  } else {
    req.session.sayac = 1;
  }
  res.render( "./layout/index.ejs" );
});

app.listen(process.env.PORT, () => {
  console.log(`Server ${"http://localhost:"+process.env.PORT} portundan ayaklandı`);
});
