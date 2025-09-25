import { transport } from "../middlewares/sendMail.js";
import { acceptCodeSchema, acceptFPCodeSchema, changePasswordSchema, signinSchema, signupSchema } from "../middlewares/validator.js";
import { User } from "../models/usersModel.js"
import { doHash, doHashValidation, hmacProcess } from "../utils/hashing.js";
import jwt from "jsonwebtoken"

export const signup = async (req, res) => {
    const {email,password} = req.body;
    try {
        // middleware to validate email & password
        const {error,value} = signupSchema.validate({
            email,
            password
        });
        if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

        // if user with this email already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res
				.status(401)
				.json({ success: false, message: 'User already exists!' });
        }

        // else, doesn't exist: so hash the password and store it in DB
        // doHash is a func from utils/hashing.js
        const hashedPassword = await doHash(password,12);

        const newUser = new User({
            email,
            password:hashedPassword
        })

        const result = await newUser.save();
        result.password = undefined;

        res.status(201).json({ 
            success: true,
            message: "Signup successful",
            result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

export const signin = async (req, res) => {
    const {email, password} = req.body;
    try {
        const {error,value} = signinSchema.validate({
            email,
            password
        });
        if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

        const existingUser = await User.findOne({
            email,
        }).select("+password");

        if(!existingUser){
            return res
				.status(401)
				.json({ success: false, message: `User with this ${email} doesn't exist!` });
        }
        const result = await doHashValidation(password,existingUser.password);
        if(!result){
            return res
				.status(401)
				.json({ success: false, message: `Invalid Password` });
        }

        // generate a token for a signed-in user
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,
        }, process.env.TOKEN_SECRET, {
            expiresIn: "8h",
        } );

        // attach the token in the Authorization Header : Bearer token and provide an expiry time (8 hours) for that token
        // cookies are httpOnly + secure = safer, meaning the cookie cannot be accessed by JavaScript (document.cookie) in the browser
        res.cookie("Authorization", "Bearer" + token,{
            expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production"
        })
        .status(200)
        .json({
            success: true,
            token,
            message: "Signed-in successfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

export const signout = async(req,res) => {
    try{
        res.clearCookie("Authorization")
            .status(200)
            .json({
                success: true,
                message: "Logged out successfully",
            })
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const sendVerificationCode = async(req,res) => {
    const {email} = req.body;
    try{
        // Add +verificationCode to select it from the model
        const existingUser = await User.findOne({email})
            .select("+verificationCode +verificationCodeValidation");
            
        if(!existingUser){
            return res
                .status(401)
                .json({ success: false, message: `User with this ${email} doesn't exist!` });
        }

        if(existingUser.verified){
            return res
                .status(400)
                .json({ success: false, message: `You are already verified` });
        }

        // generate random code - make it 6 digits
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
        
        // hash the code first
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

        // Update user with verification details
        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = new Date();
        await existingUser.save();

        // sent the mail via nodemailer
        const info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: email,
            subject: "Verification Code",
            html: `<h2>Your verification code is: ${codeValue}</h2>
                <p>This code will expire in 5 minutes.</p>`
        });

        if(info.accepted[0] === email){
            return res.status(200).json({
                success: true,
                message: "Verification code has been sent to your email"
            });
        }

        return res.status(400).json({
            success: false,
            message: "Failed to send verification code"
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const verifyVerificationCode = async(req,res) => {
    const {email, providedCode} = req.body;
    try{
        const {error,value} = acceptCodeSchema.validate({
            email,
            providedCode
        });
        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const code = providedCode.toString();

        // Add +verificationCode to select it
        const existingUser = await User.findOne({email})
            .select("+verificationCode +verificationCodeValidation");
            
        if(!existingUser){
            return res
                .status(401)
                .json({ success: false, message: `User with this ${email} doesn't exist!` });
        }

        if(existingUser.verified){
            return res
                .status(400)
                .json({ success: false, message: `You are already verified` });
        }

        if(!existingUser.verificationCode || !existingUser.verificationCodeValidation){
            return res
                .status(400)
                .json({ success: false, message: `Something is wrong with the code!` });
        }

        // Check if code has expired (5 minutes)
        if(Date.now() - existingUser.verificationCodeValidation > 5*60*1000){
            return res
                .status(400)
                .json({ success: false, message: `Your code has been expired!` });
        }

        const hashedCodeValue = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);

        if(hashedCodeValue === existingUser.verificationCode){
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();

            return res.status(200)
                    .json({
                        success: true,
                        message: "Your account has been verified",
                    });
        }

        return res
                .status(400)
                .json({ success: false, message: `Invalid verification code!` });

    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const changePassword = async(req,res) => {
    const { userId, verified } = req.user;
    const { oldPassword, newPassword } = req.body;
    try{
        const {error,value} = changePasswordSchema.validate({
            oldPassword,
            newPassword
        });
        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        if(!verified){
            return res
                .status(401)
                .json({ success: false, message: `You are not a verified user` });
        }

        const existingUser = await User.findOne({
            _id : userId
        }).select("+password");
        if(!existingUser){
            return res
                .status(401)
                .json({ success: false, message: `User doesn't exist!` });
        }
        // if old password provided is correct or not
        const result = await doHashValidation(oldPassword, existingUser.password);
        if(!result){
            return res
                .status(401)
                .json({ success: false, message: `Invalid Old Password!` });
        }
        const hashedPassword = await doHash(newPassword,12);
        existingUser.password = hashedPassword;
        await existingUser.save();

        return res.status(200)
                    .json({
                        success: true,
                        message: "Password updated",
                    });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const sendForgotPasswordCode = async(req,res) => {
    const {email} = req.body;
    try{
        // Add +forgotPasswordCode to select it from the model
        const existingUser = await User.findOne({email})
            .select("+forgotPasswordCode +forgotPasswordCodeValidation");
            
        if(!existingUser){
            return res
                .status(401)
                .json({ success: false, message: `User with this ${email} doesn't exist!` });
        }

        // generate random code - make it 6 digits
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
        
        // hash the code first
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

        // Update user with password code details
        existingUser.forgotPasswordCode = hashedCodeValue;
        existingUser.forgotPasswordCodeValidation = new Date();
        await existingUser.save();

        // sent the mail via nodemailer
        const info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: email,
            subject: "Forgot Password Code",
            html: `<h2>Your forgot password code is: ${codeValue}</h2>
                <p>This code will expire in 5 minutes.</p>`
        });

        if(info.accepted[0] === email){
            return res.status(200).json({
                success: true,
                message: "Forgot password code has been sent to your email"
            });
        }

        return res.status(400).json({
            success: false,
            message: "Failed to send password code"
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export const verifyForgotPasswordCode = async(req,res) => {
    const {email, providedCode, newPassword } = req.body;
    try{
        const {error,value} = acceptFPCodeSchema.validate({
            email,
            providedCode,
            newPassword
        });
        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }

        const code = providedCode.toString();

        // Add +verificationCode to select it
        const existingUser = await User.findOne({email})
            .select("+forgotPasswordCode +forgotPasswordCodeValidation");
            
        if(!existingUser){
            return res
                .status(401)
                .json({ success: false, message: `User with this ${email} doesn't exist!` });
        }

        if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation){
            return res
                .status(400)
                .json({ success: false, message: `Something is wrong with the code!` });
        }

        // Check if code has expired (5 minutes)
        if(Date.now() - existingUser.verificationCodeValidation > 5*60*1000){
            return res
                .status(400)
                .json({ success: false, message: `Your code has been expired!` });
        }

        const hashedCodeValue = hmacProcess(code, process.env.HMAC_VERIFICATION_CODE_SECRET);

        if(hashedCodeValue === existingUser.forgotPasswordCode){
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();

            return res.status(200)
                    .json({
                        success: true,
                        message: "Your forgot password code has been verified & your password has also been changed. Don't forget again 🤬",
                    });
        }

        return res
                .status(400)
                .json({ success: false, message: `Invalid forgot password code!` });

    }
    catch(error){
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}