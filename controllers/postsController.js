
export const getPosts = async (req,res) => {
    res.status(200).json({
        success: true,
        message: `All posts`
    })
}

export const singlePost = async (req,res) => {
    console.log("Hello posts");
}

export const createPost = async (req,res) => {
    console.log("Hello posts");
}

export const updatePost = async (req,res) => {
    console.log("Hello posts");
}

export const deletePost = async (req,res) => {
    console.log("Hello posts");
}