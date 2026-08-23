import { Router } from 'express';
import { login, register, refresh, logout } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
const router=Router();
router.post('/login',login);router.post('/register',register);router.post('/refresh',refresh);router.post('/logout',logout);router.get('/me',requireAuth,(req,res)=>res.json({success:true,data:req.user}));
export default router;
