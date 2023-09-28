import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'user', 'leader', 'manager'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});
mongoose.plugin(mongoosePaginate);
const Role = mongoose.model('Role', roleSchema);
export default Role;
