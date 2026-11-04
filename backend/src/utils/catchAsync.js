/**
 * Wraps an async express route handler to forward unhandled rejections to next()
 * @param {Function} fn - Async controller function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;

