import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const generateRefreshToken = (user) => {
     return jwt.sign({ id: user.id, role: user.role }, process.env.SECRET_KEY, {
       expiresIn: '3d',
     });
   };
   