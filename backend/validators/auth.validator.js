const { Joi } = require('../middlewares/validation');

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{6,20}$/;

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Name is required.',
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name must be at most 50 characters.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(100).required().messages({
    'string.email': 'Enter a valid email address.',
    'string.empty': 'Email is required.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().trim().pattern(passwordPattern).required().messages({
    'string.empty': 'Password is required.',
    'string.pattern.base': 'Password must be 6-20 characters and include at least one letter and one number.',
    'any.required': 'Password is required.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(100).required().messages({
    'string.email': 'Enter a valid email address.',
    'string.empty': 'Email is required.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().trim().required().messages({
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
