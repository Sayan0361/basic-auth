import Joi from "joi";

export const signupSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(100) 
        .required()
        .email(), 
    password: Joi.string()
        .min(6) 
        .required()
        .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).+$'))
});

export const signinSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(100)
        .required()
        .email(),
    password: Joi.string()
        .min(6)
        .required()
        .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).+$'))
});

export const acceptCodeSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(100)
        .required()
        .email(),
    providedCode: Joi.number()
        .required()
})

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string()
        .min(6) 
        .required()
        .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).+$')),
    newPassword: Joi.string()
        .min(6) 
        .required()
        .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).+$'))
})

export const acceptFPCodeSchema = Joi.object({
    email: Joi.string()
        .min(5)
        .max(100)
        .required()
        .email(),
    providedCode: Joi.number()
        .required(),
    newPassword: Joi.string()
        .min(6) 
        .required()
        .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9]).+$'))
})