import express from "express";
import { sendVerificationCode, signin, signout, signup, verifyVerificationCode } from "../controllers/authController.js";


const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/signout",signout);

router.patch("/send-verification-code",sendVerificationCode);

router.patch("/verify-verification-code",verifyVerificationCode);

export { router as authRouter };