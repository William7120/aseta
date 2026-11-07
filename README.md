# 🎓 AZOTA STUDY HUB - HỆ THỐNG ÔN LUYỆN & THI TRỰC TUYẾN ĐA MÔN

Hệ thống ứng dụng Web ôn thi và làm bài trắc nghiệm trực tuyến được xây dựng theo phong cách và tiêu chuẩn khảo thí của **Azota**, tích hợp trực tiếp toàn bộ dữ liệu học tập và đề thi trong kho lưu trữ **Train AI** (Tiếng Anh, Lịch Sử, Giáo Dục Kinh Tế & Pháp Luật, Toán Học, Vật Lý...).

---

## 🌐 Deploy Lên Netlify Miễn Phí (Giống Hệt Web Mẫu)

### Cách 1: Kéo thả lên Netlify Drop (Cực nhanh - 10 giây có web online)
1. Truy cập vào trang web: **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
2. Kéo thả thư mục **`Web_On_Thi_Azota`** (hoặc file nén [`Web_On_Thi_Azota.zip`](file:///c:/Users/Admin/Documents/Train%20AI/Web_On_Thi_Azota.zip)) vào khung trình duyệt.
3. Netlify sẽ tự động tải lên và cấp cho bạn một đường link công khai vĩnh viễn dạng:
   `https://ten-tuy-chon.netlify.app`

### Cách 2: Deploy qua Netlify CLI
Mở terminal và chạy lệnh:
```powershell
powershell -ExecutionPolicy Bypass -Command "npx netlify deploy --dir=./Web_On_Thi_Azota --prod"
```

---

## 🚀 Cách Mở Trực Tiếp Trên Máy Tính

Bạn có thể mở ứng dụng theo một trong các cách sau:

### Cách 1: Mở trực tiếp (Không cần cài đặt bất kỳ phần mềm nào)
Nhấp đúp chuột (Double click) vào file:
👉 **[`Web_On_Thi_Azota/index.html`](file:///c:/Users/Admin/Documents/Train%20AI/Web_On_Thi_Azota/index.html)** 
hoặc chuột phải chọn **Open with Chrome / Edge / Firefox**.

### Cách 2: Chạy máy chủ cục bộ (Local Server)
Mở terminal tại thư mục dự án và chạy:
```powershell
python -m http.server 8000
```
Sau đó truy cập trình duyệt: [http://localhost:8000/Web_On_Thi_Azota/](http://localhost:8000/Web_On_Thi_Azota/)

---

## 🌟 Các Tính Năng Nổi Bật Chuẩn Azota

### 1. 📚 Kho Đề Thi Đa Môn Tích Hợp Sẵn
- **📁 Thư Mục Học Tự Luận (Tách Riêng Biệt):**
  - **Môn Địa Lí 11:** 6 câu tự luận trọng tâm bám sát 100% ảnh chụp đề cương kiểm tra (Toàn cầu hóa kinh tế, Dân cư & Khí hậu Mỹ Latinh, Quy mô EU, An ninh toàn cầu & Bí kíp nhận dạng biểu đồ).
  - Tích hợp 4 công cụ học nhanh: Flashcard 3D lật thẻ, Che khuyết từ khóa (Active Recall), Tự viết & Chấm điểm barem AI, Cẩm nang nhận dạng biểu đồ 10 giây.
  - Sẵn sàng mở rộng thêm tự luận cho các môn khác (Tin học, GDKT&PL, Lịch sử).
- **🌍 Thư Mục Địa Lí 11 (Trắc Nghiệm Đầy Đủ & Theo Chủ Đề):**
  - **Đề Full 64 Câu Trắc Nghiệm:** Bao quát 100% ngân hàng câu hỏi từ đề cương kiểm tra giữa kì.
  - **6 Đề Ôn Tập Phân Theo Chủ Đề Chuẩn SGK:**
    1. Chủ đề 1 (Bài 1): Sự khác biệt giữa các nhóm nước (8 câu)
    2. Chủ đề 2 (Bài 2): Toàn cầu hóa & Khu vực hóa kinh tế (12 câu)
    3. Chủ đề 3 (Bài 4): Tổ chức quốc tế & An ninh toàn cầu (19 câu)
    4. Chủ đề 4 (Bài 5): Nền kinh tế tri thức (4 câu)
    5. Chủ đề 5 (Bài 6 + 7): Khu vực Mỹ La-tinh (13 câu)
    6. Chủ đề 6 (Bài 9): Liên minh Châu Âu (EU) (8 câu)
  - **Đề Trắc Nghiệm Đúng / Sai:** Cấu trúc mới Bộ GD&ĐT (2 câu chùm 8 ý).
  - **Đề Nhận Dạng Biểu Đồ:** 10 câu thực chiến nhận diện biểu đồ tròn, miền, cột, đường.
- **💻 Môn Tin Học (Lớp 11):**
  - Trọn bộ 100 câu hỏi trắc nghiệm trọng tâm (Bài 1, 3, 4, 5, 6).
- **⚖️ Môn GDKT&PL (Lớp 11):** 
  - Đề Khảo Sát Chủ Đề 1 & 2 (Đề 1 - 40 câu)
  - Đề Thị Trường Lao Động & Việc Làm (Đề 2 - 42 câu)
  - Đề Đúng / Sai Cấu trúc mới của Bộ GD&ĐT (16 câu chùm a, b, c, d)
- **🏛️ Môn Lịch Sử (Lớp 11):**
  - Đề Bài 1: Một số vấn đề chung về cách mạng tư sản (52 câu trắc nghiệm + lời giải chi tiết)
  - Đề Bài 2: Sự xác lập & phát triển của CNTB (27 câu trắc nghiệm)
  - Đề Trắc nghiệm Đúng / Sai đọc hiểu tư liệu lịch sử
- **🇬🇧 Môn Tiếng Anh:**
  - Đề Khảo sát từ vựng Unit 1, 2, 3 (30 câu trích xuất từ ngân hàng 3.300 mục từ vựng)
  - Đề Kiểm tra định kỳ chủ đề Smart Cities & Future Urban Life

### 2. ⚡ 2 Chế Độ Làm Bài Linh Hoạt
- **Chế độ Thi Thử (Exam Mode):**
  - Đồng hồ đếm ngược thời gian thi chính xác từng giây.
  - Bảng điều hướng câu hỏi (Question Palette) bên phải: bấm nhảy đến từng câu, hiển thị trạng thái đã làm (xanh lam), chưa làm (xám), đánh dấu phân vân (vàng cam có cờ 🚩).
  - Tự động nộp bài khi hết giờ.
  - Cảnh báo chuyển tab / gian lận (Anti-cheat detection) chuẩn phong cách Azota.
- **Chế độ Luyện Tập (Practice Mode):**
  - Chọn là biết ngay đúng hay sai lập tức.
  - Hiển thị ngay hộp **💡 Lời giải chi tiết** và kiến thức trọng tâm để học sinh ghi nhớ ngay tại chỗ.

### 3. 📖 Sổ Tay Câu Sai (Spaced Repetition)
- Bất cứ câu hỏi nào bạn làm sai trong các lần thi đều được hệ thống tự động ghi nhận và phân loại vào mục **"Sổ Tay Câu Sai"**.
- Có nút **"Luyện tập ngay các câu sai"**: Hệ thống tự động tạo 1 đề thi riêng chỉ chứa các câu bạn từng làm sai để luyện cho đến khi thành thạo 100%!
- Có nút xóa câu hỏi khỏi sổ tay khi bạn đã nắm vững kiến thức.

### 4. ⚡ Trình Nhập Đề & Dán Văn Bản Thông Minh (Azota Smart Parser)
- Chỉ cần sao chép (copy) và dán (paste) nội dung đề thi từ Word/PDF dạng:
  ```text
  Câu 1: Chiến tranh giành độc lập diễn ra vào thế kỉ nào?
  A. Thế kỉ XVI.
  B. Thế kỉ XVII.
  C. Thế kỉ XVIII.
  D. Thế kỉ XIX.
  Đáp án: C
  Lời giải: Cuộc chiến tranh bùng nổ từ năm 1775 đến 1783.
  ```
- Hệ thống tự động nhận diện câu hỏi, các lựa chọn, đáp án đúng và lời giải chi tiết.
- Xem trước trực tiếp (Live Preview) và lưu vào kho đề của bạn chỉ bằng 1 nút bấm!
- Hỗ trợ xuất đề ra file JSON để chia sẻ với giáo viên hoặc bạn bè.

### 5. 📊 Bảng Điểm & Phân Tích Kết Quả
- Vòng tròn điểm số thang điểm 10.
- Hiệu ứng pháo hoa Confetti khi đạt điểm cao (>= 8.0).
- Lọc xem: "Tất cả các câu", "Chỉ xem câu sai", "Chỉ xem câu đúng".
- Lịch sử tất cả các lần làm bài được lưu giữ an toàn trong trình duyệt (LocalStorage).

---

## 🛠️ Cấu Trúc Mã Nguồn

```text
Web_On_Thi_Azota/
├── index.html                 # Giao diện chính của ứng dụng web
├── css/
│   └── custom.css             # Phong cách thương hiệu Azota, hoạt họa mượt mà
├── js/
│   ├── app.js                 # Điều khiển chính, Router chuyển trang, thống kê
│   ├── exam_engine.js         # Bộ đếm giờ, chấm điểm chuẩn Bộ GD&ĐT, lưu vết
│   ├── smart_parser.js        # Trình bóc tách văn bản đề thi tự động
│   └── audio_helper.js        # Âm thanh hiệu ứng click, đúng/sai, fanfare
└── data/
    └── exam_database.js       # Ngân hàng 10 bộ đề thi có sẵn
```
