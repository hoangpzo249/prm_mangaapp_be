const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/upgrade-vip', userController.upgradeVip);
router.get('/', userController.getAllUsers);

router.post('/', userController.adminCreateUser);
router.put('/:id', userController.adminUpdateUser);
router.delete('/:id', userController.adminDeleteUser);

module.exports = router;
