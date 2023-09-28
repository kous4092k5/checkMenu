import User from "../models/auth.models.js";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import slugify from 'slugify';
import Role from '../models/role.models.js';
import { userValidate } from "../schemas/user.chemas.js";
dotenv.config();
export const userController = {
  getAllUser: async (req, res) => {
    const { _sort = 'createAt', _order = 'asc', _limit = 10, _page = 1 } = req.query;
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _order === 'desc' ? -1 : 1,
      },
      populate: [{ path: 'role', select: '-users' }, { path: 'order' }, { path: 'products' }],
    };
    try {
      const users = await User.paginate({}, options);
      if (users.length === 0) {
        return res.json({
          message: 'Không có user nào',
        });
      }
      /* loại bỏ password */
      users.docs.map((user) => {
        user.password = undefined;
      });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({
        message: error,
      });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate([
        { path: 'role', select: '-users' },
      ]);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
      }
      user.password = undefined;
      return res.status(200).json({
        message: 'Lấy thông tin người dùng thành công',
        user,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const result = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!result) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
      }
      const slug = slugify(result.username, { lower: true });
      result.slug = slug;
     
      res.json({
        message: 'update success',
        user: result,
      });
    } catch (error) {
      throw new Error(error);
    }
  },


  deleteUser: async (req, res) => {
    // const { _id } = req.user;
    try {
      const userDelete = await User.findByIdAndDelete(req.params.id);
      await Role.findByIdAndUpdate(userDelete.role, { $pull: { users: userDelete._id } });
      res.json({
        message: 'User deleted successfully',
        user: userDelete,
      });
    } catch (error) {
      throw new Error(error);
    }
  },
  // update passwword

  changeRoleUser: async (req, res, next) => {
    try {
      const { id, idRole } = req.params;
      const user = await User.findById(id);
      const oldRole = await Role.findByIdAndUpdate(user.role,
        { $pull: { users: id } });
      await user.updateOne({ role: idRole });
      const newRole = await Role.findByIdAndUpdate(idRole,
        { $addToSet: { users: id } });

      if (!user || !oldRole || !newRole) {
        return res.status(404).send({
          message: 'fail',
          err: 'Change Role Failed'
        });
      }
      return res.status(200).send({
        message: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  },
  getAllRoleUser: async (req, res) => {
    try {
      const { roleName } = req.params;
      if (!roleName) {
        return res.status(400).send({ message: 'fail', err: 'Role name not found' });
      }
      console.log(roleName)
      // const role = await Role.find()   
      const { _page = 1, _limit = 10, q } = req.query;
      const options = {
        page: _page,
        limit: _limit,
        sort: { createdAt: -1 },
        populate: [
          { path: 'users', select: "-password -refreshToken -slug " },
        ],
      };
      const userRole = await Role.paginate({ name: roleName }, options);

      // console.log(userRole);
      return res.status(200).send({
        message: 'success',
        data: userRole
      });
    } catch (error) {
      res.status(400).send({
        message: 'fail',
        err: `errorl ${error}`
      });

    }
  },

  /* create user */
  createUser: async (req, res) => {
    try {
      const body = req.body;
      console.log('body', req.body);
      /* validate */
      const { error } = userValidate.validate(body, { abortEarly: false });
      if (error) {
        const errors = error.details.map((error) => error.message);
        return res.status(400).json({
          message: errors,
        });
      }
      /* check account exists */
      const accountExit = await User.findOne({ account: body.account });
      console.log('🚀 ~ file: user.controllers.js:298 ~ createUser: ~ accountExit:', accountExit);
      if (accountExit) {
        return res.status(400).json({
          message: 'Account đã tồn tại',
        });
      }
      /* check username exists */
      const userNameExits = await User.findOne({ username: body.username });
      if (userNameExits) {
        return res.status(400).json({
          message: 'Username đã tồn tại',
        });
      }

      /* check account exists */
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      console.log(
        '🚀 ~ file: user.controllers.js:311 ~ createUser: ~ hashedPassword:',
        hashedPassword
      );

      const user = await User.create({
        ...req.body,
        password: hashedPassword,
      });

      return res.status(200).json({
        message: 'Created success',
        user: {
          _id: user._id,
          username: user.username,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },
};
