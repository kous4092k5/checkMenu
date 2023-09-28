import Role from '../models/role.models.js';
import User from "../models/auth.models.js";
import RoleValidate from '../schemas/role.schemas.js';
const RoleController = {
  createRole: async (req, res, next) => {
    try {
      const { error } = RoleValidate.validate(req.body, { abortEarly: false });
      if (error) {
        return res
          .status(400)
          .json({ message: 'fail', err: error.details.map((err) => err.message) });
      }
      const role = await Role.create(req.body);
      if (!role) {
        return res.status(400).json({ message: 'fail', err: 'Create role failed' });
      }
      return res.status(200).json({ message: 'success', data: role });
    } catch (error) {
      next(error);
    }
  },
  getRole: async (req, res) => {
    try {
      console.log('EOles');
      const roles = await Role.findById(req.params.id);
      if (!roles) {
        return res.status(404).json({ message: 'succes', err: 'Not found any roles' });
      }
      return res.status(200).send({ message: 'success', data: roles });
    } catch (error) {
      next(error);
    }
  },
  getAllRoles: async (req, res) => {
    try {
      const roles = await Role.find({});
      if (!roles) {
        return res.status(404).json({ message: 'succes', err: 'Not found any roles' });
      }
      return res.status(200).send({ message: 'success', data: roles });
    } catch (error) {
      next(error);
    }
  },
  deleteRole: async (req, res, next) => {
    try {
      const role = await Role.findByIdAndRemove(req.params.id);
      const user = await User.deleteMany({ _id: { $in: role.users } });
      if (!user) {
        return res.status(404).json({ message: 'fail', err: 'Delete Failed' });
      }
      if (!role) {
        return res.status(404).json({ message: 'fail', err: 'Delete Failed' });
      }
      return res.status(200).json({ message: 'succes', data: role });
    } catch (error) {
      next(error);
    }
  },
  changeStatusRole: async (req, res, next) => {
    try {
      const role = await Role.findById(req.params.id);
      const status = role.status === 'active' ? 'inactive' : 'active';
      await role.updateOne(
        {
          status: status,
        },
        { new: true }
      );
      if (!role) {
        return res.status(404).json({ message: 'fail', err: 'Change status Failed' });
      }
      return res.status(200).json({ message: 'succes', data: role });
    } catch (error) {
      next(error);
    }
  },
  updateRole: async (req, res, next) => {
    try {
      const { error } = RoleValidate.validate(req.body, { abortEarly: false });
      if (error) {
        return res
          .status(400)
          .json({ message: 'fail', err: error.details.map((err) => err.message) });
      }
      const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
      console.log(role);
      if (!role) {
        return res.status(404).json({ message: 'fail', err: 'Update Failed' });
      }
      return res.status(200).json({ message: 'succes', data: role });
    } catch (error) {
      next(error);
    }
  },
};

export default RoleController;
