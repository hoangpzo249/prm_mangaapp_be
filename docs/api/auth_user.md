# Auth & User API Documentation

## 1. Authentication (`/api/auth`)

### 1.1 Đăng ký tài khoản
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Mô tả:** Đăng ký tài khoản mới và tự động tạo 1 Ví (Wallet) rỗng cho User.
- **Body:**
  ```json
  {
    "username": "user123",
    "password": "password123",
    "fullName": "Nguyen Van A"
  }
  ```
- **Response (201 Created):**
  ```json
  { "message": "Đăng ký thành công" }
  ```

### 1.2 Đăng nhập
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Body:**
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": "60d5ecb8b392d7001f5c6e9a",
      "username": "user123",
      "fullName": "Nguyen Van A",
      "isVip": false,
      "role": "user"
    }
  }
  ```

---

## 2. User Management (`/api/users`)

### 2.1 Lấy thông tin cá nhân (Kèm thông tin Ví)
- **Method:** `GET`
- **Endpoint:** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "_id": "60d5ecb8b392d7001f5c6e9a",
    "username": "user123",
    "fullName": "Nguyen Van A",
    "vipUntil": "2023-12-31T23:59:59.000Z",
    "isVip": true, // Virtual field
    "role": "user",
    "wallet": {
      "balance": 1500,
      "isLocked": false
    }
  }
  ```

### 2.2 Các API Admin (Yêu cầu `role="admin"`)
Tất cả các API dưới đây yêu cầu Header `Authorization: Bearer <token>` của Admin.

- `GET /api/users/`: Lấy danh sách tất cả user.
- `POST /api/users/`: Admin tạo user (Bỏ qua captcha/kiểm tra, tự động tạo ví).
- `PUT /api/users/:id`: Cập nhật thông tin user (ví dụ: `isBanned`, `role`, `vipUntil`).
- `DELETE /api/users/:id`: Xóa user.
