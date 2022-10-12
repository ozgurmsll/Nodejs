const multer  = require('multer')
const path = require('path')





const Mystorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,"../uploads/avatars"));
    },
    filename:(req,file,cb)=>{
        cb(null,req.user.email+""+path.extname(file.originalname));
    }
})

function ResimfileFilter (req, file, cb) {

   if(file.mimetype=='image/jpg'|| file.mimetype=='image/png'){
    cb(null,true);
   }else{
    cb(null,false);
   }
  }


const Resimupload = multer({storage:Mystorage,fileFilter:ResimfileFilter})


module.exports=Resimupload;
