import mongoose, { mongo } from "mongoose";

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: [true, "Email is required!!!"],
        unique: [true, "Email must be unique!"],
        trime: true,
        minLength: [true, "Email must have atleast 5 characters!!!"],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true,"Password is required"],
        trim: true,
        select: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode:{
        type: String,
        select: false,
    },
    verificationCodeValidation:{
        type: Number,
        select: false,
    },
    forgotPasswordCode:{
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation:{
        type: Number,
        select: false,
    },
}, {
    timestamps:true
})

export const User = mongoose.model("User",userSchema);