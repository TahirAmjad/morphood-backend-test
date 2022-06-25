const express = require('express');
const notionController = require('../../controllers/notion.controller');

const router = express.Router();

router.route('/pages').post(notionController.submitFeedback).get(notionController.getPages);

module.exports = router;
