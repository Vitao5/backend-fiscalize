
const express = require("express");
const { authMiddleware, checkHeadersSent, sendCodeLimiter } = require("../middleware/middleware");

const { 
    register, deleteUser, login, 
    allUsers, userId, updateUser, 
    changeToAdmin, inativerUser, sendCodePassword,
    verifyCode, resetPassword
    
} = require("../controllers/usersController");  

const router = express.Router();

router.post('/login', login); 
router.get('/list-users', authMiddleware, checkHeadersSent, allUsers);
router.get('/:id', authMiddleware, checkHeadersSent, userId);
router.post('/register', register);
router.put('/update/:id', authMiddleware, checkHeadersSent, updateUser);
router.delete('/delete/:id', authMiddleware, checkHeadersSent, deleteUser);
router.put('/new-admin', authMiddleware, checkHeadersSent, changeToAdmin)
router.put('/inative-user', authMiddleware, checkHeadersSent, inativerUser)
router.post('/send-code', sendCodeLimiter, checkHeadersSent, sendCodePassword)
router.post('/verify-code', checkHeadersSent, verifyCode)
router.post('/reset-password', checkHeadersSent, resetPassword)


module.exports = router;