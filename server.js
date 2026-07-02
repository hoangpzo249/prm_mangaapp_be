const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
connectDB()

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/chapters', require('./routes/chapterRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));

app.get('/', (req, res) => {
  res.send("OK CON DE");
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));