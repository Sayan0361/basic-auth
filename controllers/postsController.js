import { createPostSchema } from "../middlewares/validator.js";
import { Post } from "../models/postsModel.js";

export const getPosts = async (req,res) => {
    const { page } = req.query;
    const postsPerPage = 10;
    try{
        let pageNum = 0;
        if (page && page > 1) {
            pageNum = page - 1;
        }
        const result = await Post.find()
                        .sort({ createdAt : -1})
                        .skip(pageNum * postsPerPage)
                        .limit(postsPerPage)
                        .populate({
                            path : "userId",
                            select : "email",
                        });
        res.status(200).json({
            success : true,
            message : "Posts",
            data : result
        })
    }
    catch(error){
        console.log(error);
    }
}

export const singlePost = async (req,res) => {
    const { _id } = req.query;
    try {
        const result = await Post.findOne({_id})
                        .populate({
                            path : "userId",
                            select : "email",
                        });
        res.status(200).json({
            success : true,
            message : "Single Post",
            data : result
        })
    }
    catch(error){
        console.log(error);
    }
}

export const createPost = async (req,res) => {
    const { title, description } = req.body;
    const { userId } = req.user;
    try {
        const {error,value} = createPostSchema.validate({
                    title,
                    description,
                    userId
                });
        if (error) {
            return res
                .status(401)
                .json({ success: false, message: error.details[0].message });
        }
        const result = await Post.create({
            title,
            description,
            userId
        })
        res.status(200).json({
            success : true,
            message : "Your post has been created",
            data : result
        })
    }
    catch(error){
        console.log(error);
    }
}

export const updatePost = async (req,res) => {
    console.log("Hello posts");
}

export const deletePost = async (req,res) => {
    console.log("Hello posts");
}