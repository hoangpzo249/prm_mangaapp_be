const userService = require('../services/userService');


exports.getMe = async (req, res, next) => {
    try {
        const user = await userService.getMe(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        res.json({ message: 'Cập nhật profile thành công', user });
    } catch (error) {
        next(error);
    }
};

exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file ảnh' });
        }
        // req.file.path là URL của ảnh trên Cloudinary do multer-storage-cloudinary trả về
        const user = await userService.uploadAvatar(req.user.id, req.file.path);
        res.json({ message: 'Cập nhật avatar thành công', user });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.adminCreateUser = async (req, res, next) => {
    try {
        const user = await userService.adminCreateUser(req.body);
        res.status(201).json({ message: 'Tạo user thành công', user });
    } catch (error) {
        next(error);
    }
};

exports.adminUpdateUser = async (req, res, next) => {
    try {
        const user = await userService.adminUpdateUser(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.adminDeleteUser = async (req, res, next) => {
    try {
        const result = await userService.adminDeleteUser(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
