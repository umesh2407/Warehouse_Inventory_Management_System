const dashboardService = require('./dashboard.service');
const asyncHandler = require('../../common/asyncHandler');
const { sendSuccess } = require('../../common/response');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  return sendSuccess(res, 200, 'Dashboard summary retrieved successfully', summary);
});

module.exports = {
  getSummary,
};
