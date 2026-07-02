const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const VipPackage = require('../models/VipPackage');
const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const Bookmark = require('../models/Bookmark');
const History = require('../models/History');
const Rating = require('../models/Rating');
const Comment = require('../models/Comment');
const Transaction = require('../models/Transaction');
const UserSubscription = require('../models/UserSubscription');
const Notification = require('../models/Notification');

const sampleGenres = ['Hành động', 'Kỳ ảo', 'Võ thuật', 'Hài hước', 'Tình cảm', 'Phiêu lưu'];

function getRandomGenres() {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = sampleGenres.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Chuyển đổi dữ liệu JSON Dump (Extended JSON) thành Object JS hợp lệ
function formatRawData(rawItem, isChapter = false) {
  const item = { ...rawItem };
  if (item._id && item._id.$oid) item._id = item._id.$oid;
  if (item.storyId && item.storyId.$oid) item.storyId = item.storyId.$oid;
  
  const dateStr = item.updatedAt && item.updatedAt.$date ? item.updatedAt.$date : new Date().toISOString();
  item.createdAt = new Date(dateStr);
  item.updatedAt = new Date(dateStr);
  
  delete item.__v;
  
  if (!isChapter) {
     item.genres = getRandomGenres();
  } else {
     item.isVip = item.chapterNumber >= 3;
  }
  return item;
}

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Đã kết nối MongoDB');

    // 0. Dọn dẹp TOÀN BỘ Collections
    await Story.deleteMany({});
    await Chapter.deleteMany({});
    await User.deleteMany({});
    await Wallet.deleteMany({});
    await VipPackage.deleteMany({});
    await Bookmark.deleteMany({});
    await History.deleteMany({});
    await Rating.deleteMany({});
    await Comment.deleteMany({});
    await Transaction.deleteMany({});
    await UserSubscription.deleteMany({});
    await Notification.deleteMany({});
    console.log('🧹 Đã dọn dẹp sạch Database.');

    // 1. Import Story & Chapter từ file raw JSON
    const storiesRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'mma_project.stories.json'), 'utf8'));
    const chaptersRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'mma_project.chapters.json'), 'utf8'));

    const storiesData = storiesRaw.map(s => formatRawData(s, false));
    const chaptersData = chaptersRaw.map(c => formatRawData(c, true));

    const stories = await Story.insertMany(storiesData);
    const chapters = await Chapter.insertMany(chaptersData);
    console.log(`✅ Đã import ${stories.length} Truyện và ${chapters.length} Chapters từ file JSON gốc.`);

    // 2. Tạo VipPackages
    const packages = await VipPackage.insertMany([
      { name: 'VIP 1 Tuần', durationDays: 7, priceCoins: 50, isActive: true },
      { name: 'VIP 1 Tháng', durationDays: 30, priceCoins: 150, isActive: true },
      { name: 'VIP 1 Năm', durationDays: 365, priceCoins: 1200, isActive: true }
    ]);
    console.log('✅ Đã tạo 3 gói VIP.');

    // 3. Tạo Users
    const hashedPassword = await bcrypt.hash('123456', 10);
    const users = await User.insertMany([
      { username: 'admin', email: 'admin@mangaapp.com', password: hashedPassword, fullName: 'Super Admin', role: 'admin' },
      { username: 'user1', email: 'user1@gmail.com', password: hashedPassword, fullName: 'Người dùng Thường', role: 'user' },
      { username: 'vipuser', email: 'vipuser@vip.com', password: hashedPassword, fullName: 'Khách hàng VIP', role: 'user' }
    ]);
    console.log('✅ Đã tạo 3 User mẫu (Password: 123456).');

    // 4. Tạo Wallets cho Users
    const wallets = [];
    for (const u of users) {
      let balance = 0;
      if (u.username === 'vipuser') balance = 500;
      if (u.username === 'user1') balance = 20;
      
      const wallet = await Wallet.create({ userId: u._id, balance: balance });
      wallets.push(wallet);
    }
    console.log('✅ Đã cấp Wallet cho Users.');

    // 5. Gán VIP cho vipuser
    const vipU = users.find(u => u.username === 'vipuser');
    const targetPkg = packages[1]; // VIP 1 Tháng
    
    const vipUntil = new Date();
    vipUntil.setDate(vipUntil.getDate() + 30);
    vipU.vipUntil = vipUntil;
    await vipU.save();

    const vipWallet = wallets.find(w => w.userId.toString() === vipU._id.toString());

    // Tạo Transaction & Subscription
    const tx = await Transaction.create({
      userId: vipU._id,
      walletId: vipWallet._id,
      type: 'BUY_VIP',
      paymentMethod: 'COIN_SYSTEM',
      status: 'SUCCESS',
      amountCoins: -targetPkg.priceCoins,
      packageId: targetPkg._id,
      description: `Mua gói ${targetPkg.name}`
    });

    await UserSubscription.create({
      userId: vipU._id,
      packageId: targetPkg._id,
      transactionId: tx._id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: vipUntil
    });
    console.log('✅ Đã gán gói VIP và tạo Lịch sử giao dịch cho vipuser.');

    // 6. Tạo Random Tương tác cho User thường
    const normalU = users.find(u => u.username === 'user1');
    const randomStory = stories[0];
    const randomChapter = chapters.find(c => c.storyId.toString() === randomStory._id.toString());

    if (randomStory && randomChapter) {
      await Bookmark.create({ userId: normalU._id, storyId: randomStory._id });
      await Rating.create({ userId: normalU._id, storyId: randomStory._id, score: 5 });
      await Comment.create({ 
        userId: normalU._id, 
        storyId: randomStory._id, 
        chapterId: randomChapter._id, 
        content: 'Truyện này siêu hay luôn mọi người ơi!' 
      });
      await History.create({
        userId: normalU._id,
        storyId: randomStory._id,
        lastChapterId: randomChapter._id,
        lastReadAt: new Date()
      });
      await Notification.create({
        userId: normalU._id,
        type: 'SYSTEM',
        title: 'Chào mừng',
        message: 'Chào mừng bạn đến với MangaApp!',
        isRead: false
      });
      console.log('✅ Đã tạo Bookmark, Rating, Comment, History, Notification mẫu.');
    }

    console.log('\n🎉 HOÀN TẤT SEEDING TOÀN BỘ DATA MẪU TỪ SỐ 0!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi Seed Data:', error);
    process.exit(1);
  }
}

seedAll();
