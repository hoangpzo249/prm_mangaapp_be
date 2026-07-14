const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cấu hình Cloudinary với các biến môi trường
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình lưu trữ cho avatar
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fcomic_avatars', // Tên thư mục trên Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Resize ảnh nếu cần
    }
});

// Khởi tạo multer middleware
const uploadAvatar = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

module.exports = {
    cloudinary,
    uploadAvatar
};
