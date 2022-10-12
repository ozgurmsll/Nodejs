
const yonetimController=require('../controllers/yonetim_controller')
const router=require('express').Router();
const authMiddleware=require('../middlewares/aut_middlevier')
const multerConfig=require('../confing/multer_confing')

router.get('/',authMiddleware.oturumAcilmis,yonetimController.anaSayfaGoster)
router.get('/profil',authMiddleware.oturumAcilmis,yonetimController.profilSayfasiniGoter)
router.post('/profil-guncelle',authMiddleware.oturumAcilmis,multerConfig.single('avatar'),yonetimController.profilGuncelle)





  






module.exports=router;