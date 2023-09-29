import express from "express";
import cors from "cors";
import http from 'http';
import { connectDb } from "./configs/dataBase.configs.js";connectDb();
    //
import bodyParser, { json }  from 'body-parser';
import cookieParser from 'cookie-parser';
import cookie from 'cookie'
import  jwt  from 'jsonwebtoken';
//dirname
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import  { format } from 'date-fns';
//excel
// import xlsx from 'xlsx';
import axios from 'axios';
import fs from 'fs';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
import xlsx from 'xlsx';
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
import { ppid } from "process";
import mongoose from "mongoose";

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
app.get("/menu",async (req,res)=>{
  const {email}=req.query;
  let menuAll=0;

  const menu1=await Task.findOne({task:"Người dùng được vào menu1"});
  if(menu1)
  menu1['user'].forEach(value=>{
    if(value.username==email){
      menuAll=1;
    }
  })
  const menu2=await Task.findOne({task:"Người dùng được vào menu2"});
  if(menu2)
  menu2['user'].forEach(value=>{
    if(value.username==email){
      menuAll=2
    }
  })
  if(menuAll==0)res.json({html:"Bạn ko trong menu nào"})
  else if(menuAll==1)res.json({html:"đang ở menu1 "})
  else if(menuAll==2)res.json({html:"đang ở menu2 "})
})

app.get("/test",async (req,res)=>{
    res.sendFile(__dirname+"/test.html");
})  

const XLSX_JSON=mongoose.model("xlsx_jsons",mongoose.Schema({
  parent:{},
  child:{},
}))
async function download(jsonData){
  //phân tích json
  // jsonData=jsonData[3];
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'dd.MM.yyyy');
  let parentJson=[];
  let childJson=[];
  for(let i = 2 ;i<jsonData.length;i++){
    childJson.push({
      "__EMPTY_18":(jsonData[i].__EMPTY_18)?jsonData[i].__EMPTY_18:formattedDate,
      "__EMPTY_19":jsonData[i].__EMPTY_19,
      "__EMPTY_20":(jsonData[i].__EMPTY_19>=jsonData[i].__EMPTY_9&&jsonData[i].__EMPTY_19<=jsonData[i].__EMPTY_10)?"✓":"",
      "__EMPTY_21":(jsonData[i].__EMPTY_19>=jsonData[i].__EMPTY_9&&jsonData[i].__EMPTY_19<=jsonData[i].__EMPTY_10)?"":"✓",
      "__EMPTY_22":jsonData[i].__EMPTY_22,
      "__EMPTY_23":jsonData[i].__EMPTY_23,
      "__EMPTY_24":jsonData[i].__EMPTY_24,
      "__EMPTY_25":jsonData[i].__EMPTY_25,
      "__EMPTY_26":jsonData[i].__EMPTY_26,
      "__EMPTY_27":jsonData[i].__EMPTY_27,
    });
    parentJson.push({
      "__EMPTY":jsonData[i].__EMPTY,
      "__EMPTY_1":jsonData[i].__EMPTY_1,
      "__EMPTY_2":jsonData[i].__EMPTY_2,
      "__EMPTY_3":jsonData[i].__EMPTY_3,
      "__EMPTY_4":jsonData[i].__EMPTY_4,
      "__EMPTY_5":jsonData[i].__EMPTY_5,
      "__EMPTY_6":jsonData[i].__EMPTY_6,
      "__EMPTY_7":jsonData[i].__EMPTY_7,
      "__EMPTY_8":jsonData[i].__EMPTY_8,
      "__EMPTY_9":jsonData[i].__EMPTY_9,
      "__EMPTY_10":jsonData[i].__EMPTY_10,
      "__EMPTY_11":jsonData[i].__EMPTY_11,
      "__EMPTY_12":jsonData[i].__EMPTY_12,
      "__EMPTY_13":jsonData[i].__EMPTY_13,
      "__EMPTY_14":jsonData[i].__EMPTY_14,
      "__EMPTY_15":parseFloat(jsonData[i].__EMPTY_15).toFixed(3),
      "__EMPTY_16":jsonData[i].__EMPTY_16,
      "__EMPTY_17":jsonData[i].__EMPTY_17,
      "__EMPTY_29":jsonData[i].__EMPTY_29,
      "__EMPTY_30":jsonData[i].__EMPTY_30,
    })
  }

  await XLSX_JSON.deleteOne({});
  new XLSX_JSON({
    parent:parentJson,
    child:childJson,

  }).save()

  // console.log(childJson)
  // return childJson;
  // console.log(parentJson)



// console.log(formattedDate);

  //
  const workbook1 = xlsx.utils.book_new();
  const worksheet1 = xlsx.utils.json_to_sheet(jsonData);
  xlsx.utils.book_append_sheet(workbook1, worksheet1, 'Sheet1');
  const excelFilePath = './src/data.xlsx';
  xlsx.writeFile(workbook1, excelFilePath);
}
app.get("/excel",async(req,res)=>{
  const filePath = '/dc.xlsx';
// Đọc file Excel
  const workbook = xlsx.readFile(__dirname+filePath);
  // Lấy danh sách tên các sheet trong file Excel
  const sheetNames = workbook.SheetNames;
  // Lấy dữ liệu từ sheet đầu tiên
  const sheet = workbook.Sheets[sheetNames[0]];
  // Chuyển đổi dữ liệu từ sheet thành JSON
  const jsonData = xlsx.utils.sheet_to_json(sheet);
  // return res.json(download(jsonData));
  // const file = __dirname + '/data.xlsx'; // Đường dẫn tới file cần tải xuống

  // res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx'); // Thay thế 'file_name.ext' bằng tên file thực tế
  // console.log(file)
  // Gửi file về client
  // res.download(file);
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'dd.MM.yyyy');
  let parentJson=[];
  let childJson=[];
  for(let i = 2 ;i<jsonData.length;i++){
    childJson.push({
      "__EMPTY_18":(jsonData[i].__EMPTY_18)?jsonData[i].__EMPTY_18:formattedDate,
      "__EMPTY_19":jsonData[i].__EMPTY_19,
      "__EMPTY_20":(jsonData[i].__EMPTY_19>=jsonData[i].__EMPTY_9&&jsonData[i].__EMPTY_19<=jsonData[i].__EMPTY_10)?"✓":"",
      "__EMPTY_21":(jsonData[i].__EMPTY_19>=jsonData[i].__EMPTY_9&&jsonData[i].__EMPTY_19<=jsonData[i].__EMPTY_10)?"":"✓",
      "__EMPTY_22":jsonData[i].__EMPTY_22,
      "__EMPTY_23":jsonData[i].__EMPTY_23,
      "__EMPTY_24":jsonData[i].__EMPTY_24,
      "__EMPTY_25":jsonData[i].__EMPTY_25,
      "__EMPTY_26":jsonData[i].__EMPTY_26,
      "__EMPTY_27":jsonData[i].__EMPTY_27,
    });
    parentJson.push({
      "__EMPTY":jsonData[i].__EMPTY,
      "__EMPTY_1":jsonData[i].__EMPTY_1,
      "__EMPTY_2":jsonData[i].__EMPTY_2,
      "__EMPTY_3":jsonData[i].__EMPTY_3,
      "__EMPTY_4":jsonData[i].__EMPTY_4,
      "__EMPTY_5":jsonData[i].__EMPTY_5,
      "__EMPTY_6":jsonData[i].__EMPTY_6,
      "__EMPTY_7":jsonData[i].__EMPTY_7,
      "__EMPTY_8":jsonData[i].__EMPTY_8,
      "__EMPTY_9":jsonData[i].__EMPTY_9,
      "__EMPTY_10":jsonData[i].__EMPTY_10,
      "__EMPTY_11":jsonData[i].__EMPTY_11,
      "__EMPTY_12":jsonData[i].__EMPTY_12,
      "__EMPTY_13":jsonData[i].__EMPTY_13,
      "__EMPTY_14":jsonData[i].__EMPTY_14,
      "__EMPTY_15":parseFloat(jsonData[i].__EMPTY_15).toFixed(3),
      "__EMPTY_16":jsonData[i].__EMPTY_16,
      "__EMPTY_17":jsonData[i].__EMPTY_17,
      "__EMPTY_29":jsonData[i].__EMPTY_29,
      "__EMPTY_30":jsonData[i].__EMPTY_30,
    })
  }

  await XLSX_JSON.deleteOne({});
  new XLSX_JSON({
    parent:parentJson,
    child:childJson,

  }).save()

  res.json(parentJson);
})
app.get("/search",(req,res)=>{
  res.sendFile(__dirname+"/search.html")
})

  
  


    export const viteNodeApp = app;
