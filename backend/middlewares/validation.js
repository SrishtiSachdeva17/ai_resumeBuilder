const Joi = require('joi');

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim();
};

const sanitizePayload = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizePayload);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
      if (key.startsWith('$') || key.includes('.')) {
        return accumulator;
      }

      accumulator[key] = sanitizePayload(nestedValue);
      return accumulator;
    }, {});
  }

  return normalizeString(value);
};

const formatJoiErrors = (details = []) =>
  details.reduce((accumulator, detail) => {
    const path = detail.path.join('.');

    if (path && !accumulator[path]) {
      accumulator[path] = detail.message;
    }

    return accumulator;
  }, {});

const validate = (schema, property = 'body') => (req, res, next) => {
  const sanitizedInput = sanitizePayload(req[property]);
  const { error, value } = schema.validate(sanitizedInput, {
    abortEarly: false,
    stripUnknown: true,
  });

  req[property] = sanitizedInput;

  if (error) {
    return res.status(400).json({
      error: 'Validation failed.',
      fields: formatJoiErrors(error.details),
    });
  }

  req.validated = req.validated || {};
  req.validated[property] = value;
  req[property] = value;
  next();
};

module.exports = {
  Joi,
  validate,
  sanitizePayload,
};
