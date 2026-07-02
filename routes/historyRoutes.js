const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { saveHistoryRules } = require('../middlewares/validators/historyValidator');

router.use(auth);

router.get('/', historyController.getHistory);
router.post('/', validate(saveHistoryRules), historyController.saveHistory);
router.delete('/:storyId', historyController.deleteHistory);

module.exports = router;