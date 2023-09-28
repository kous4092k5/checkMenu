import express from "express";
import cors from "cors";
import http from 'http';
import { connectDb } from "./configs/dataBase.configs.js";connectDb();
    //
import bodyParser  from 'body-parser';
import cookieParser from 'cookie-parser';
import cookie from 'cookie'
import  jwt  from 'jsonwebtoken';
//dirname
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
import dotenv from "dotenv";
dotenv.config();



import UserSchema from "./models/auth.models.js";

    
    // import permission from "./controllers/permission.controller.js";

    import rootRoutes from "./routes/rootRoutes.js";
    const app = express();
    const server=http.createServer(app);
app.use(express.json());
app.use(cookieParser());
    

    // app.use(cors({
    //     credentials: true, 
    //     origin: 'http://localhost:9988',
    //     methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    // }))

    app.use(cors({
        credentials: true, 
        origin: '*',
        methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    }))
    app.use(express.json());
    app.use("/api", rootRoutes);






    //
import Task from "./models/task.models.js";

app.get("/task",async (req,res)=>{
    const cookies = cookie.parse(req.headers.cookie || '');
    const accessToken = cookies.accessToken;
    //
    const tasks=await Task.find({});
    if (accessToken) {
    try {
        const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
        const userFindOne=await UserSchema.findOne({_id:decoded._id})
        // xác minh user là admin
        var permit="all";
        if(userFindOne.role=='admin')permit="all";
        if(userFindOne.role=='manager')permit="manager";
        //thêm user vào task
        if(req.query.addUser && req.query.task &&userFindOne.role!="user"){
            let check= await Task.find({});
            let array=check[req.query.task-1]['user'];
            let isDawn=false;
            for(let i=0;i<check[req.query.task-1]['user'].length;i++){
              if(check[req.query.task-1]['user'][i].username==req.query.addUser){
                isDawn=true;
                break;
              }
            }
            if(!isDawn){
              array.push({username:req.query.addUser,permission:"all"});
              new Task({  
                "task":check[req.query.task-1]['task'],
                "user":array
              }).save();
              if(await Task.deleteOne({"task":check[req.query.task-1]['task']}))return res.json({status:"success"});
            } 
        }
          //xoá user khỏi 1 task
        if(req.query.DeleteUser &&req.query.task &&userFindOne.role!="user"){
            //trường hợp xoá user khỏi 1 nhiệm vụ
            let check= await Task.find({});
            let array=[];// tạo mảng mới để copy
            let isDawn=false;
            if(permit=="all"){
              check[req.query.task-1]['user'].forEach(value=>{
                if(req.query.DeleteUser!=value.username)array.push(value);
                else isDawn=true;// nếu user bị xoá có trong mảng thì bỏ qua ko copy  và đánh dấu lại
              })
            }
            else if(permit=="manager"){
              check[req.query.task-1]['user'].forEach(value=>{
                if(req.query.DeleteUser!=value.username)array.push(value);
                else {isDawn=true;array.push({username:value.username,permission:"manager"})}// nếu user bị xoá có trong mảng thì bỏ qua ko copy  và đánh dấu lại
              })
            }
            if(isDawn){
              new Task({  
                "task":check[req.query.task-1]['task'],
                "user":array
              }).save();
              if(await Task.deleteOne({"task":check[req.query.task-1]['task']}))return res.json({"status":"success"});
            }
        }

       
     
    } catch (err) {
      console.error('Invalid token:', err.message);
    }
  }
  res.json(tasks)
})
app.get("/session",async (req,res)=>{
    const cookies = cookie.parse(req.headers.cookie || '');
    const accessToken = cookies.accessToken;
    if (accessToken) {
         try {
              const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
              const CurrentUser=await UserSchema.find({})
              const userFindOne=await UserSchema.findOne({_id:decoded._id})
              return res.json(userFindOne);
         }
         catch (err) {
            return res.json({error:err.message});
            //   console.error('Invalid token:', err.message);
         }
    } 
    res.json({error:"No login"})
})

app.get("/test",async (req,res)=>{
    res.sendFile(__dirname+"/test.html");
})  

  
  


    export const viteNodeApp = app;
