const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Kết nối Database
connectDB();

// ============================================================
// Mount Routes (11 domains)
// ============================================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/chapters', require('./routes/chapterRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/vip', require('./routes/vipRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Health check
app.get('/', (req, res) => {
    res.send("Manga App API (Layered Architecture) - OK");
});

// ============================================================
// Global Error Handler
// Bắt tất cả lỗi được forward qua `next(error)` từ Controllers
// ============================================================
app.use((err, req, res, next) => {
    // Lỗi có cờ isOperational = lỗi nghiệp vụ (throw qua AppError)
    if (err.isOperational) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    // Xử lý các lỗi MongoDB thường gặp
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Lỗi validate dữ liệu DB', details: err.message });
    }
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Dữ liệu bị trùng lặp (Unique constraint)' });
    }

    // Các lỗi không lường trước (Lỗi hệ thống / Bugs)
    console.error('💥 ERROR:', err);
    res.status(500).json({ message: 'Đã có lỗi hệ thống xảy ra', error: err.message });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));