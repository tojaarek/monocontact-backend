const Joi = require('joi');

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
});

const contactValidationMiddleware = (req, res, next) => {
  const { error } = contactSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Data validation error',
    });
  }

  next();
};

module.exports = {
  contactValidationMiddleware,
};
