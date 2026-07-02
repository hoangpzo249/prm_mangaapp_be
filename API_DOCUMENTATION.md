
+### User
+
+| Method | Endpoint | Auth | Chức năng |
+| --- | --- | --- | --- |
+| POST | `/users/register` | Không | Đăng ký user |
+| POST | `/users/login` | Không | Đăng nhập, trả JWT token |
+| POST | `/users/upgrade-vip` | Có | Nâng user hiện tại lên VIP |
+| GET | `/users` | Không | Lấy danh sách user |
+| POST | `/users` | Không | Tạo user |
+| PUT | `/users/:id` | Không | Cập nhật user |
+| DELETE | `/users/:id` | Không | Xoá user |
+
+### Story
+
+| Method | Endpoint | Auth | Chức năng |
+| --- | --- | --- | --- |
+| GET | `/stories` | Không | Lấy danh sách truyện, kèm chapter mới nhất |
+| GET | `/stories/hot` | Không | Lấy 5 truyện nhiều views nhất |
+| GET | `/stories/random` | Không | Lấy 10 truyện ngẫu nhiên cho featured |
+| GET | `/stories/recent` | Không | Lấy 10 truyện mới cập nhật, kèm 3 chapter mới nhất |
+| GET | `/stories/search?keyword=...` | Không | Tìm truyện theo title |
+| GET | `/stories/:id` | Không | Lấy chi tiết truyện và tăng views |
+| POST | `/stories` | Không | Tạo truyện |
+| PUT | `/stories/:id` | Không | Cập nhật truyện |
+| DELETE | `/stories/:id` | Không | Xoá truyện và xoá các chapter thuộc truyện |
+
+### Chapter
+
+| Method | Endpoint | Auth | Chức năng |
+| --- | --- | --- | --- |
+| GET | `/chapters/story/:storyId` | Không | Lấy danh sách chapter của một truyện |
+| GET | `/chapters/:id` | Chỉ cần khi chapter VIP | Lấy nội dung chapter, tăng views truyện |
+| POST | `/chapters` | Không | Tạo chapter |
+| PUT | `/chapters/:id` | Không | Cập nhật chapter |
+| DELETE | `/chapters/:id` | Không | Xoá chapter |
+
+### Bookmark
+
+| Method | Endpoint | Auth | Chức năng |
+| --- | --- | --- | --- |
+| GET | `/bookmarks` | Có | Lấy danh sách truyện đã lưu của user |
+| GET | `/bookmarks/check/:storyId` | Có | Kiểm tra user đã lưu truyện chưa |
+| POST | `/bookmarks/toggle` | Có | Thêm hoặc xoá truyện khỏi bookmark |
+
+### History
+
+| Method | Endpoint | Auth | Chức năng |
+| --- | --- | --- | --- |
+| GET | `/history` | Có | Lấy lịch sử đọc của user |
+| POST | `/history` | Có | Lưu hoặc cập nhật chapter đọc gần nhất |
+| DELETE | `/history/:storyId` | Có | Xoá lịch sử đọc của một truyện |
+
+## 2. Luồng hoạt động chính
+
+### Đăng ký
+
+1. App gọi `POST /users/register`.
+2. Backend kiểm tra username đã tồn tại chưa.
+3. Backend hash password bằng bcrypt.
+4. Backend lưu user mới.
+
+### Đăng nhập
+
+1. App gọi `POST /users/login`.
+2. Backend kiểm tra username/password.
+3. Backend tạo JWT token.
+4. App lưu token để gọi các API cần đăng nhập.
+
+### Màn Home
+
+App có thể gọi các API sau:
+
+```text
+GET /stories/random
+GET /stories/recent
+GET /stories/hot
+GET /stories
+```
+
+Backend trả danh sách truyện, thường kèm chapter mới nhất để app hiển thị.
+
+### Tìm kiếm truyện
+
+1. App gọi `GET /stories/search?keyword=abc`.
+2. Backend tìm truyện theo `title` bằng regex, không phân biệt hoa thường.
+3. Backend trả danh sách truyện kèm chapter mới nhất.
+
+### Xem chi tiết truyện
+
+1. App gọi `GET /stories/:id`.
+2. Backend tăng `views` của truyện thêm 1.
+3. App gọi `GET /chapters/story/:storyId`.
+4. Backend trả danh sách chapter theo thứ tự `chapterNumber` tăng dần.
+5. Nếu user đã login, app có thể gọi `GET /bookmarks/check/:storyId` để kiểm tra trạng thái lưu truyện.
+
+### Đọc chapter thường
+
+1. App gọi `GET /chapters/:id`.
+2. Backend lấy chapter và thông tin truyện.
+3. Backend tăng `views` của truyện thêm 1.
+4. Nếu chapter không phải VIP, backend trả danh sách ảnh trong field `content`.
+5. Nếu user đã login, app gọi `POST /history` để lưu lịch sử đọc.
+
+### Đọc chapter VIP
+
+1. App gọi `GET /chapters/:id` kèm token.
+2. Backend kiểm tra chapter có `isVip=true` không.
+3. Nếu là chapter VIP, backend verify token và kiểm tra user có `isVip=true`.
+4. Nếu user chưa login, backend trả `401`.
+5. Nếu user không phải VIP, backend trả `403`.
+6. Nếu user là VIP, backend trả nội dung chapter.
+
+### Nâng cấp VIP
+
+1. App gọi `POST /users/upgrade-vip` kèm token.
+2. Backend verify token.
+3. Backend mock thanh toán thành công.
+4. Backend cập nhật user `isVip=true`.
+
+### Bookmark truyện
+
+1. App gọi `POST /bookmarks/toggle` với `storyId`.
+2. Nếu user chưa lưu truyện, backend tạo bookmark.
+3. Nếu user đã lưu truyện, backend xoá bookmark.
+4. App gọi `GET /bookmarks` để lấy danh sách truyện đã lưu.
+
+### Lịch sử đọc
