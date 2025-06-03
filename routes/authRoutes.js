import express from 'express';
const router = express.Router();
// import { registerUser } from "../controllers/authController.js";
// import { registerUser } from "../controllers/authController.js";
import {
  registerUser,
  activateAccount,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from '../controllers/authController.js';

router.post('/register', registerUser);
router.post('/activate', activateAccount);
router.post('/login', loginUser);
router.get('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);

export default router;
