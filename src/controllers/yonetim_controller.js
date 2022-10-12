const User = require('../model/user');


const anaSayfaGoster=(req,res,next)=>{
     
    res.render('index',{layout:'./layout/yonetim_layout.ejs',title:'ANA SAYFA'})

}

const profilSayfasiniGoter=(req,res,next)=>{
    
    res.render('profil',{user:req.user,layout:'./layout/yonetim_layout.ejs',title:'profil sayfası'})

}
const profilGuncelle=async (req,res,next)=>{
   const guncelBilgiler={
    ad: req.body.ad,
    soyad:req.body.soyad
   }
   
   
   
   
   
   
    try {
        if (req.file) {
            guncelBilgiler.avatar = req.file.filename; 
        }
        const sonuc = await User.findByIdAndUpdate(req.user.id, guncelBilgiler);

    } catch (error) {
        console.log(error);
        res.redirect('/yonetim/profil');

    }

}


module.exports={
    anaSayfaGoster,
    profilSayfasiniGoter,
    profilGuncelle,
}