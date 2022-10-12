const mongoose=require('mongoose')

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  
.then(()=>console.log('veri tabanına baglandık'))
.catch(hata=>console.log("hata oluştu"+hata))