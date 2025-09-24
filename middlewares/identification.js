import jwt from "jsonwebtoken"

export const identifier = (req,res,next) =>{
    let token;
    // If the request is not from a browser (like Postman, mobile app, or another server), the token is expected in the Authorization header.
    // If it is from a browser, the token is expected in the cookies (with key Authorization).
    if(req.headers.client === "not-browser"){
        token = req.headers.authorization;
    }
    else{
        token = req.cookies["Authorization"]
    }

    if(!token){
        return res.status(403).json({
            success : true,
            message : "Unauthorized"
        });
    }

    try{
        const userToken = token.split(" ")[1]; // userToken is ["Bearer", "token"]
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
        if(jwtVerified){
            req.user = jwtVerified;
            next();
        }
        else{
            throw new Error("error in the token");
        }
    }
    catch(error){
        console.log(error);
    }
}