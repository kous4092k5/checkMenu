import joi from 'joi';

export const userValidate = joi.object({
  username: joi.string().required().messages({
    'string.base': 'Name must be a string',
    'string.empty': 'Name is not allowed to be empty',
    'any.required': 'Name is required',
  }),
  email: joi.string().email().required().messages({
    "string.email": "Email không đúng định dạng",
    "string.empty": "Email không được để trống",
    "any.required": "Trường email là bắt buộc",
}),
  password: joi.string().required().min(6).messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is not allowed to be empty',
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  role: joi.string().default('customer').messages({
    'string.base': 'Role must be a string',
    'string.empty': 'Role is not allowed to be empty',
  }),
});

export const userUpdateValidate = joi.object({});




