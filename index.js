import express from "express"
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import {authRouter} from "./routers/authRouter.js"

const app = express();
const PORT = process.env.PORT || 5000;

// Body parsing middlewares must come first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware after body parsers
app.use((req, res, next) => {
    console.log('Request Body:', req.body);
    next();
});

// Other middlewares
app.use(cors());
app.use(helmet());
app.use(cookieParser());  



// Database connection..
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database connected")
}).catch((err)=>{
    console.log(err);
})


app.get("/",(req,res)=>{
    res.json({
        message:"Hello from the server"
    })
})

app.use("/api/auth",authRouter);

app.listen(PORT, ()=>{
    console.log(`Server is listening on http://localhost:${PORT}`)
})