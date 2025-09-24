import express from "express";
import { changePassword, sendVerificationCode, signin, signout, signup, verifyVerificationCode } from "../controllers/authController.js";
import { identifier } from "../middlewares/identification.js";


const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/signout", identifier, signout);

router.patch("/send-verification-code", identifier, sendVerificationCode);

router.patch("/verify-verification-code", identifier, verifyVerificationCode);

router.patch("/change-password", identifier, changePassword);

export { router as authRouter };