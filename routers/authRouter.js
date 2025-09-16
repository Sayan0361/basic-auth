import express from "express"

const router = express.Router();

router.post("/signup", (req, res) => {
    // Add your signup logic here
});

router.post("/signin", (req, res) => {
    // Add your signin logic here
});

export { router as authRouter };