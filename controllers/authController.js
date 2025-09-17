import { signupSchema } from "../middlewares/validator.js";
import {User} from "../models/usersModel.js"
import { doHash } from "../utils/hashing.js";

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

        // else, doesnt exist: so hash the password and store it in DB
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
    try {
        res.status(200).json({ message: "Signin successful" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};