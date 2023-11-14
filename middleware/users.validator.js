const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const userValidationMiddleware = (req, res, next) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: error.message,
    });
  }

  return next();
};

module.exports = {
  userValidationMiddleware,
};
