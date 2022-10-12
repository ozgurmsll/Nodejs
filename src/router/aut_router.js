// yönlendirme yapılacak yer

const router=require('express').Router();
const authControllers=require('../controllers/auth_conttroller')
const validatorMiddleare=require('../middlewares/validator_middleview')
const authMiddleware=require('../middlewares/aut_middlevier')


router.get('/reset-password/:id/:token',authControllers.yeniSifreFormuGoster)
router.get('/reset-password',authControllers.yeniSifreFormuGoster)
router.post('/reset-password',validatorMiddleare.validateNewPassword(),authControllers.yeniSifreyiKaydet)
router.get('/verify',authControllers.verifyMail)
router.get('/login',authMiddleware.NotLogin,authControllers.loginForumunuGoster);
router.get('/register',authMiddleware.NotLogin,authControllers.registerForumunuGoster);
router.get('/forget-password',authMiddleware.NotLogin,authControllers.forgetRegisterForumunuGoster);
router.get('/logout',authMiddleware.oturumAcilmis,authControllers.logout);
// post işlemleri istekler ve kontroller
router.post('/register',authMiddleware.NotLogin,validatorMiddleare.validateNewUser(), authControllers.register)
router.post('/login',authMiddleware.NotLogin,validatorMiddleare.validateLogin(),authControllers.login)
router.post('/forget-password',authMiddleware.NotLogin,validatorMiddleare.validateEmail(),authControllers.forgetPassword)





  






module.exports=router;