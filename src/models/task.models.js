import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const taskSchema = new mongoose.Schema({
  task:String,
  user:[
     {
          username:String,
          permission:String,
     }
  ]
});
mongoose.plugin(mongoosePaginate);
const Task = mongoose.model('tasks', taskSchema);
// new Task({
//      task:"Thêm xoá bài đăng",
//      user:[
//          {
//              username:"kous1608",
//              permission:"all",
//          },
//          {
//              username:"datnguyen2003",
//              permission:"all",
//          },
//      ]
//  }).save()
export default Task;
