const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { adminCreateUserRules, adminUpdateUserRules, updateProfileRules } = require('../middlewares/validators/userValidator');
const { uploadAvatar } = require('../middlewares/upload');

// User tự lấy thông tin (gọi userService.getMe)
router.get('/me', auth, userController.getMe);
router.put('/me', auth, validate(updateProfileRules), userController.updateProfile);
router.post('/me/avatar', auth, uploadAvatar.single('avatar'), userController.uploadAvatar);
// Admin thao tác
router.get('/', auth, authorize('admin'), userController.getAllUsers);
router.post('/', auth, authorize('admin'), validate(adminCreateUserRules), userController.adminCreateUser);
router.put('/:id', auth, authorize('admin'), validate(adminUpdateUserRules), userController.adminUpdateUser);
router.delete('/:id', auth, authorize('admin'), userController.adminDeleteUser);

module.exports = router;
