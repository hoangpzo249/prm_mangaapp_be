# Interaction API Documentation
Tất cả các API tương tác (Bookmark, History, Comment, Rating, Notification) đều yêu cầu `Authorization: Bearer <token>`.

---

## 1. Bookmark (Tủ truyện) (`/api/bookmarks`)

- `GET /api/bookmarks/`: Lấy danh sách truyện đã lưu (Kèm `latestChapter` của mỗi truyện).
- `GET /api/bookmarks/check/:storyId`: Trả về `{ isBookmarked: true/false }` để frontend đổi icon.
- `POST /api/bookmarks/toggle`: Toggle (Thêm nếu chưa có, Xóa nếu đã có).
  ```json
  // Body
  { "storyId": "60d5ec..." }
  // Response
  { "isBookmarked": true, "message": "Đã thêm vào tủ truyện" }
  ```

---

## 2. History (Lịch sử đọc) (`/api/history`)

- `GET /api/history/`: Lấy lịch sử 100 truyện gần nhất. Sắp xếp theo `updatedAt` giảm dần.
- `POST /api/history/`: Lưu lịch sử (Sử dụng upsert: Nếu tồn tại thì update `lastChapterId` và `updatedAt`, chưa có thì tạo mới).
  ```json
  // Body
  { "storyId": "60d5ec...", "chapterId": "61e2fc..." }
  ```
- `DELETE /api/history/:storyId`: Xóa lịch sử của 1 truyện khỏi danh sách.

---

## 3. Comment (Bình luận) (`/api/comments`)

- `GET /api/comments/story/:storyId?page=1&limit=20`: Lấy bình luận của 1 truyện (Public). Mỗi comment gốc sẽ tự động populate kèm danh sách replies.
- `POST /api/comments/`: Tạo bình luận (hoặc reply).
  ```json
  // Body
  {
    "storyId": "60d5ec...",
    "content": "Truyện hay quá!",
    "chapterId": "61e2fc...", // Optional
    "parentId": "60a1dc..."   // Optional (Nếu là reply)
  }
  ```
- `DELETE /api/comments/:id`: Xóa bình luận. Chỉ **Chủ sở hữu comment** hoặc **Admin** mới có quyền xóa. Tự động xóa luôn toàn bộ replies của comment đó.

---

## 4. Rating (Đánh giá sao) (`/api/ratings`)

- `GET /api/ratings/story/:storyId`: Lấy điểm trung bình (`averageRating`) và số lượt đánh giá (`ratingCount`) của truyện.
- `POST /api/ratings/`: User đánh giá truyện. Điểm từ 1 đến 5. Nếu user đã rate trước đó, cập nhật lại điểm (Upsert).
  ```json
  // Body
  {
    "storyId": "60d5ec...",
    "score": 5
  }
  ```

---

## 5. Notification (Thông báo) (`/api/notifications`)

- `GET /api/notifications/?page=1&limit=20`: Lấy danh sách thông báo. Response trả về kèm `unreadCount` (Số thông báo chưa đọc).
  ```json
  // Response
  {
    "notifications": [...],
    "unreadCount": 3
  }
  ```
- `PUT /api/notifications/:id/read`: Đánh dấu 1 thông báo là đã đọc.
- `PUT /api/notifications/read-all`: Đánh dấu tất cả thông báo của user là đã đọc.
