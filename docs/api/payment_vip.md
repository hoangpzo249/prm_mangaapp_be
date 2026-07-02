# Payment & VIP API Documentation

Phần quản lý Nạp Xu và Mua VIP sử dụng luồng Orchestration kết hợp nhiều Models (`Transaction`, `Wallet`, `VipPackage`, `UserSubscription`, `User`).

---

## 1. Transactions (`/api/transactions`)

### 1.1 Tạo yêu cầu Nạp Xu
- **Method:** `POST`
- **Endpoint:** `/api/transactions/deposit`
- **Headers:** `Authorization: Bearer <token>`
- **Mô tả:** User chọn gói nạp tiền. API tạo Transaction trạng thái `PENDING`.
- **Body:**
  ```json
  {
    "paymentMethod": "MOMO",
    "amountMoney": 50000,
    "amountCoins": 500
  }
  ```
- **Response:** Trả về `Transaction` object chứa `appTransactionId` (Mã đơn hàng nội bộ để gửi lên cổng thanh toán).

### 1.2 Webhook từ Cổng thanh toán (Callback)
- **Method:** `POST`
- **Endpoint:** `/api/transactions/callback/:method` (Ví dụ: `/callback/momo`)
- **Mô tả:** Cổng thanh toán gọi API này khi giao dịch thành công/thất bại.

#### 🔄 Sequence Diagram: Luồng Nạp Xu (Deposit)

```mermaid
sequenceDiagram
    participant C as Client (App/Web)
    participant API as Transaction API
    participant PG as Payment Gateway (MoMo)
    participant DB as MongoDB

    C->>API: POST /deposit (amount: 50k VND = 500 Xu)
    API->>DB: Tạo Transaction (PENDING, appTransactionId="TXN_123")
    DB-->>API: Trả về Transaction
    API-->>C: Trả về TXN_123 & Payment URL
    
    C->>PG: User thanh toán qua URL của MoMo
    PG-->>C: Hiển thị kết quả thanh toán trên App
    
    %% Webhook chạy ngầm
    PG->>API: POST /callback/momo (Webhook ngầm)
    Note right of API: Payload { appTransId: "TXN_123", isSuccess: true }
    
    API->>DB: Tìm Transaction TXN_123
    alt isSuccess == true
        API->>DB: Update Transaction Status = SUCCESS
        API->>DB: Wallet.balance += 500
        API-->>PG: 200 OK (Đã ghi nhận)
    else isSuccess == false
        API->>DB: Update Transaction Status = FAILED
        API-->>PG: 200 OK (Đã ghi nhận thất bại)
    end
```

---

## 2. VIP Subscription (`/api/vip`)

### 2.1 Lấy danh mục Gói VIP
- **Method:** `GET`
- **Endpoint:** `/api/vip/packages`
- **Mô tả:** Lấy danh sách các gói VIP đang mở bán (`isActive = true`). Public API.

### 2.2 Mua gói VIP bằng Xu
- **Method:** `POST`
- **Endpoint:** `/api/vip/buy`
- **Headers:** `Authorization: Bearer <token>`
- **Mô tả:** Sử dụng số dư trong Ví (Wallet) để mua gói VIP.
- **Body:**
  ```json
  {
    "packageId": "61a2b3..."
  }
  ```

#### 🔄 Sequence Diagram: Luồng Mua VIP (Buy VIP Orchestration)

```mermaid
sequenceDiagram
    participant C as Client
    participant API as VIP API (Controller)
    participant S as VIP Service
    participant DB as MongoDB

    C->>API: POST /vip/buy { packageId }
    API->>S: Xử lý mua gói
    
    S->>DB: Tìm VipPackage
    DB-->>S: Gói 1 Tháng (100 Xu)
    
    S->>DB: Tìm Wallet của User
    DB-->>S: Wallet { balance: 150, isLocked: false }
    
    alt Wallet.isLocked == true
        S-->>API: Error (Ví đang bị khóa)
    else Wallet.balance < 100
        S-->>API: Error (Không đủ xu)
    else Hợp lệ
        S->>DB: Wallet.balance -= 100
        S->>DB: Tạo Transaction (BUY_VIP, SUCCESS, -100 Xu)
        S->>DB: Tạo UserSubscription (ACTIVE, thời hạn 30 ngày)
        
        S->>DB: Lấy User để tính toán vipUntil
        Note right of S: Nếu user đang VIP -> Cộng dồn ngày.<br/>Nếu user hết VIP -> Tính từ hôm nay.
        S->>DB: Cập nhật User.vipUntil
        
        S-->>API: Trả về kết quả thành công
        API-->>C: 200 OK (Thông tin Transaction & Subscription)
    end
```
