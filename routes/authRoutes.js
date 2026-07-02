const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { registerRules, loginRules } = require('../middlewares/validators/authValidator');

router.post('/register', validate(registerRules), authController.register);
router.post('/login', validate(loginRules), authController.login);

module.exports = router;
