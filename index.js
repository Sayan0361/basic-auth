import express from "express"
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import {authRouter} from "./routers/authRouter.js"

const app = express();

const PORT = process.env.PORT || 5000;

// middlewares
// Enable Cross-Origin Resource Sharing (allow requests from different domains)
app.use(cors());  
// Secure HTTP headers to protect app from common web vulnerabilities
app.use(helmet());  
// Parse cookies from the request header (helps in authentication/session handling)
app.use(cookieParser());  
// Parse incoming requests with JSON payloads
app.use(express.json());  
// Parse URL-encoded data (form submissions); extended:true allows nested objects
app.use(express.urlencoded({ extended: true }));  


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