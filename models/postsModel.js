import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
        trim:true,
    },
    description: {
        type:String,
        required:[true,"Description is required"],
        trim:true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    }
},{
    timestamps:true,
})

export const Post = mongoose.model("Post",postSchema);