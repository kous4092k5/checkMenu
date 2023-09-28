import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from 'cookie'

import User from "../models/auth.models.js";
import dotenv from "dotenv";
    //giải json ở body
import bodyParser  from 'body-parser';
import cookieParser from 'cookie-parser';

    dotenv.config();
    import { signinSchema, signupSchema } from "../schemas/auth.schemas.js";

    export const signup = async (req, res) => {
        try {
            const { name, email, password, confirmPassword } = req.query;
            const { error } = signupSchema.validate(req.query, { abortEarly: false });
            if (error) {
                const errors = error.details.map((err) => err.message);
                return res.status(400).json({
                    message: errors,
                });
            }

            // kiểm tra tồn tại email

            const userExist = await User.findOne({ email });
            if (userExist) {
                return res.status(400).json({
                    message: "Email đã tồn tại",
                });
            }


            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                name,
                email,
                role:"user",
                password: hashedPassword,
            });

            // new User({
            //     name,
            //     email,
            //     role:"user",
            //     password: hashedPassword,
            // }).save()

            user.password = undefined;
            // tạo token từ server
            const token = jwt.sign({ _id: user._id ,role:user.role}, process.env.SECRET_KEY, { expiresIn: 60 * 60 });
            //lưu token vào cookie
            res.cookie('accessToken', token, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict',
            });
            return res.status(201).json({
                message: "Đăng ký thành công",
                accessToken: token,
                user,
            });
            
        } catch (error) {
            res.json(error)
        }
    };

    export const signin = async (req, res) => {
        try {
            const { email, password } = req.query;
            const { error } = signinSchema.validate(req.query, { abortEarly: false });

            if (error) {
                const errors = error.details.map((err) => err.message);
                return res.status(400).json({
                    message: errors,
                });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    message: "Tài khoản không tồn tại",
                });
            }
            // nó vừa mã hóa và vừa so sánh
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    message: "Sai mật khẩu",
                });
            }

            user.password = undefined;
            // tạo token từ server
            const token = jwt.sign({ _id: user._id,role:user.role }, process.env.SECRET_KEY, { expiresIn: 60 * 60 });

            //lưu token vào cookie
            res.cookie('accessToken', token, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict',
            });
            return res.status(201).json({
                message: "Đăng nhập thành công",
                accessToken: token,
                user,
            });
        } catch (error) {}
    };
