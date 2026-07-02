const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createRatingRules } = require('../middlewares/validators/ratingValidator');

router.get('/story/:storyId', ratingController.getRatingByStory);
router.post('/', auth, validate(createRatingRules), ratingController.rateStory);

module.exports = router;
