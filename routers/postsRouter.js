import express from "express";
import { identifier } from "../middlewares/identification.js";
import { createPost, deletePost, getPosts, singlePost, updatePost } from "../controllers/postsController.js";

const router = express.Router();

router.get("/all-posts", identifier, getPosts);

router.get("/single-post", identifier, singlePost);

router.post("/create-post", identifier, createPost);

router.put("/update-post", identifier, updatePost);

router.delete("/delete-post", identifier, deletePost);

export { router as postsRouter };