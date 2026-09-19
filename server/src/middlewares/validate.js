const ApiError = require('../common/ApiError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ApiError(400, 'Validation failed', errors);
  }

  if (result.data.body !== undefined) {
    req.body = result.data.body;
  }
  if (result.data.query !== undefined) {
    req.query = result.data.query;
  }
  if (result.data.params !== undefined) {
    req.params = result.data.params;
  }

  next();
};

module.exports = validate;
