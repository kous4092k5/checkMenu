import { Router } from "express";
import cookie from 'cookie'
import  jwt  from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";//thêm bodyparse để dùng req.body
const authRouter = Router();
authRouter.use(bodyParser.urlencoded({ extended: true }));
import { signin, signup } from "../controllers/auth.controller.js";
import { userController } from "../controllers/user.controller.js";
import UserSchema from"../models/auth.models.js"


authRouter.get("/signup", signup);

authRouter.get("/signin", signin);
authRouter.get("/get-user", userController.getAllRoleUser);
authRouter.get("/refreshToken",async (req,res)=>{
     const cookies = cookie.parse(req.headers.cookie || '');
     const accessToken = cookies.accessToken;
     if (accessToken) {
          try {
               const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
               const token = jwt.sign({ _id: decoded._id }, process.env.SECRET_KEY, { expiresIn: 60 * 60 });
               //lưu cookie cho đợt tiếp để check
               res.cookie('accessToken', token, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
               });
               return res.status(201).json({
                    message: "Tạo token mới thành công",
                    accessToken: token,
               });
               
          } catch (err) {
               console.error('Invalid token:', err.message);
          }
     }
     res.json("error");
});



export default authRouter;
