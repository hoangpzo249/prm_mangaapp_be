# Manga App Backend — Hướng dẫn kiến trúc & luồng implement

> File này là tài liệu tham chiếu cho các cuộc hội thoại sau, đảm bảo AI agent không đi sai pattern đã thiết lập.

---

## 1. Kiến trúc tổng thể (Layered Architecture)

```
prm_mangaapp_be/
├── config/
│   └── db.js                    # Kết nối MongoDB
├── utils/                       # AppError, slugify
├── middlewares/                 # auth, authorize, validate + validators/
├── models/                      # Mongoose Models (12 files)
├── repositories/                # Data Access Layer (CRUD, queries)
├── services/                    # Business Logic Layer
├── controllers/                 # HTTP Request/Response (gọi services)
├── routes/                      # Định tuyến + gắn middlewares
└── server.js                    # Mount 11 routers + Global Error Handler
```

---

## 2. Quy tắc quan trọng (PHẢI TUÂN THỦ)

### 2.1. User.isVip là VIRTUAL — KHÔNG phải stored field
```javascript
// ❌ SAI — không được set trực tiếp isVip
await User.findByIdAndUpdate(id, { isVip: true });

// ✅ ĐÚNG — set vipUntil để virtual tự tính
const vipEndDate = new Date();
vipEndDate.setDate(vipEndDate.getDate() + 30); // +30 ngày
await User.findByIdAndUpdate(id, { vipUntil: vipEndDate });
```

### 2.2. Coins nằm trong Wallet — KHÔNG trong User
```javascript
// ❌ SAI
await User.findByIdAndUpdate(id, { $inc: { coins: 100 } });

// ✅ ĐÚNG
await Wallet.findOneAndUpdate({ userId: id }, { $inc: { balance: 100 } });
```

### 2.3. averageRating, ratingCount, bookmarkCount KHÔNG lưu trong DB
```javascript
// ❌ SAI — không có các field này trong Story schema
await Story.findByIdAndUpdate(id, { averageRating: 4.5 });

// ✅ ĐÚNG — Tính toán tại thời điểm query (Repository layer)
const ratingStats = await Rating.aggregate([
    { $match: { storyId: mongoose.Types.ObjectId(storyId) } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
]);

const bookmarkCount = await Bookmark.countDocuments({ storyId });
```

### 2.4. Chapter hooks tự động cập nhật chapterCount
- `post('save')` → `Story.chapterCount += 1` (chỉ khi document mới)
- `post('findOneAndDelete')` → `Story.chapterCount -= 1`
- **Lưu ý**: Nếu xóa chapter bằng `deleteOne()` hoặc `deleteMany()` thì hook KHÔNG chạy — phải dùng `findOneAndDelete()` hoặc tự update chapterCount trong controller.

### 2.5. Transaction luôn liên kết với Wallet
```javascript
// Khi tạo transaction, PHẢI truyền walletId
const wallet = await Wallet.findOne({ userId });
const transaction = new Transaction({
    userId,
    walletId: wallet._id,   // BẮT BUỘC
    type: 'BUY_VIP',
    paymentMethod: 'COIN_SYSTEM',
    amountCoins: -packagePrice,  // Số ÂM khi mua VIP
    status: 'SUCCESS'
});
```

---

## 3. Luồng nghiệp vụ chính

### 3.1. Đăng ký tài khoản
```
1. Tạo User (hash password trước)
2. Tạo Wallet cho user mới (balance = 0)
```

### 3.2. Nạp xu (DEPOSIT)
```
1. User chọn số tiền nạp → tạo Transaction (PENDING)
2. Gửi request đến cổng thanh toán (MoMo/ZaloPay/VNPAY)
3. Nhận callback từ cổng:
   a. Thành công → Transaction.status = SUCCESS
                  → Wallet.balance += amountCoins
   b. Thất bại   → Transaction.status = FAILED
```

### 3.3. Mua gói VIP (BUY_VIP)
```
1. User chọn VipPackage
2. Kiểm tra Wallet.balance >= priceCoins
3. Kiểm tra Wallet.isLocked === false
4. Trừ xu: Wallet.balance -= priceCoins
5. Tạo Transaction (BUY_VIP, SUCCESS, amountCoins = -priceCoins)
6. Tạo UserSubscription (ACTIVE, startDate, endDate)
7. Cập nhật User.vipUntil = max(vipUntil hiện tại, now) + durationDays
```

### 3.4. Kiểm tra VIP khi đọc chapter
```
1. Lấy Chapter → kiểm tra chapter.isVip
2. Nếu isVip = true:
   a. Lấy User từ DB (không dùng JWT cache vì VIP có thể hết hạn)
   b. Kiểm tra user.isVip (virtual tính từ vipUntil)
   c. Nếu false → 403 "Cần VIP để đọc chapter này"
```

---

## 4. Indexes tổng hợp

| Model | Index | Type | Mục đích |
|---|---|---|---|
| User | `{ username: 1 }` | Unique | Đăng nhập |
| Wallet | `{ userId: 1 }` | Unique | 1 user = 1 ví |
| Story | `{ views: -1 }` | Normal | Trang Hot |
| Story | `{ genres: 1 }` | Normal | Lọc thể loại |
| Chapter | `{ storyId: 1, chapterNumber: 1 }` | Unique Compound | Không trùng chapter |
| Bookmark | `{ userId: 1, storyId: 1 }` | Unique Compound | 1 bookmark/truyện |
| History | `{ userId: 1, storyId: 1 }` | Unique Compound | 1 history/truyện |
| Comment | `{ storyId: 1, createdAt: -1 }` | Compound | Phân trang comment |
| Rating | `{ userId: 1, storyId: 1 }` | Unique Compound | 1 rating/truyện |
| Notification | `{ userId: 1, isRead: 1, createdAt: -1 }` | Compound | Thông báo chưa đọc |
| UserSubscription | `{ userId: 1, status: 1 }` | Compound | Gói VIP đang active |
| Transaction | `{ gatewayTransactionId: 1 }` | Sparse Unique | Đối soát cổng TT |
| Transaction | `{ appTransactionId: 1 }` | Sparse Unique | Mã đơn nội bộ |
| Transaction | `{ userId: 1, createdAt: -1 }` | Compound | Lịch sử giao dịch |

---

## 5. Các bước implement tiếp theo (ĐÃ HOÀN THÀNH 100%)

- [x] Tạo folder `repositories/` — tách logic query phức tạp
- [x] Tạo folder `services/` — tách business logic
- [x] Tạo folder `middlewares/` — xác thực, phân quyền, validate
- [x] Cập nhật toàn bộ `controllers/`
- [x] Cập nhật toàn bộ `routes/`
- [x] Cập nhật `server.js` — thêm Global Error Handler
