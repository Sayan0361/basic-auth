import { createPostSchema } from "../middlewares/validator.js";
import { Post } from "../models/postsModel.js";
import mongoose from "mongoose";

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
        if(!result) {
            return res
                .status(404)
                .json({ success: false, message: `Post not available` });
        }
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
    const { _id } = req.query;
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
        const existingPost = await Post.findOne({_id})
        if(!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: `Post not available` });
        }
        if(existingPost.userId.toString() !== userId){
            return res
                .status(403)
                .json({ success: false, message: `Unauthorized to change this post` });
        }
        existingPost.title = title;
        existingPost.description;
        const result = await existingPost.save();
        res.status(200).json({
            success : true,
            message : "Your post has been updated",
            data : result
        })
    }
    catch(error){
        console.log(error);
    }
}

export const deletePost = async (req,res) => {
    const { _id } = req.query;
    const { userId } = req.user;
    try {
        const existingPost = await Post.findById(_id);
        if(!existingPost) {
            return res
                .status(404)
                .json({ success: false, message: `No such post available` });
        }
        
        if(existingPost.userId.toString() !== userId){
            return res
                .status(403)
                .json({ success: false, message: `Unauthorized to delete this post` });
        }

        const deletedPost = await Post.findByIdAndDelete(_id);
        
        if (!deletedPost) {
            return res
                .status(400)
                .json({ success: false, message: "Failed to delete post" });
        }

        return res.status(200).json({
            success: true,
            message: "Your post has been deleted",
            deletedPost 
        });
    }
    catch(error){
        console.log('Error details:', error);
        return res.status(500).json({
            success: false,
            message: "Error deleting post",
            error: error.message
        });
    }
}