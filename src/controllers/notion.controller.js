const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { Client } = require('@notionhq/client');

const submitFeedback = catchAsync(async (req, res) => {
  try {
    var data = {
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: req.body.data,
    };
    const notion = new Client({
      auth: process.env.NOTION_SECRET_TOKEN,
    });

    const response = await notion.pages.create(data);

    if (response.id) {
      res.status(httpStatus.CREATED).send({
        status: 'ok',
        message: 'Feedback sent successfully',
      });
    } else {
      res.status(httpStatus.EXPECTATION_FAILED).send({
        status: 'failed',
        response: 'Unable to send feedback! please contact admin',
      });
    }
  } catch (error) {
    if (isNotionClientError(error)) {
      // error is now strongly typed to NotionClientError
      switch (error.code) {
        case ClientErrorCode.RequestTimeout:
          res.status(httpStatus.EXPECTATION_FAILED).send({
            status: 'failed',
            response: 'Request Timeout',
          });
          break;
        case APIErrorCode.ObjectNotFound:
          res.status(httpStatus.EXPECTATION_FAILED).send({
            status: 'failed',
            response: 'Invalid Request',
          });
          break;
        case APIErrorCode.Unauthorized:
          res.status(httpStatus.EXPECTATION_FAILED).send({
            status: 'failed',
            response: 'Unauthroizeed',
          });
          break;
        // ...
        default:
          // you could even take advantage of exhaustiveness checking
          assertNever(error.code);
      }
    }
  }
});
const getPages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});
module.exports = {
  submitFeedback,
  getPages,
};
