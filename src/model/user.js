const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const UserSchema=new Schema({
    ad:{
        type:String,
        required:[true,"ad olanı boş olamaz"],
        trim:true,
        minLength:2,
        maxLength:20
    },
    soyad:{
        type:String,
        required:true,
        trim:true,
        minLength:2,
        maxLength:[20,"soy ad 20 karakterden fazla olamaz"]
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
    },
    avatar:{
        type:String,

    },
    
    emailAktif:{
        type:Boolean,
        default:false
    },
    sifre:{
        type:String,
        required:true,
        trim:true,
    }


},{collection:'kullanicilar',timestamps:true})

const User=mongoose.model('User',UserSchema)

module.exports=User;