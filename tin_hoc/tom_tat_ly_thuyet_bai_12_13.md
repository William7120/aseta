# TÀI LIỆU ÔN TẬP TIN HỌC 11 — CHỦ ĐỀ 4: GIỚI THIỆU CÁC HỆ CƠ SỞ DỮ LIỆU

---

## BÀI 12: HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU VÀ HỆ CƠ SỞ DỮ LIỆU

### I. Khái niệm hệ quản trị cơ sở dữ liệu (DBMS)
Để hỗ trợ làm việc với CSDL, đã có hệ quản trị cơ sở dữ liệu (Database Management System - DBMS) với 4 nhóm chức năng cốt lõi:

1. **Nhóm chức năng định nghĩa dữ liệu:**
   - Khai báo và quản trị nhiều CSDL.
   - Tạo lập, sửa đổi kiến trúc/cấu trúc trong mỗi CSDL.
   - Cài đặt ràng buộc toàn vẹn dữ liệu.

2. **Nhóm chức năng cập nhật và truy xuất dữ liệu:**
   - Thêm, xóa, sửa dữ liệu trong các bảng.
   - Truy xuất, tìm kiếm, lọc dữ liệu theo nhiều tiêu chí khác nhau.

3. **Nhóm chức năng bảo mật, an toàn CSDL:**
   - Kiểm soát quyền truy cập dữ liệu (phân quyền: chỉ đọc, đọc và ghi, không được phép truy cập).
   - Kiểm soát các giao dịch (transactions) để đảm bảo tính nhất quán của dữ liệu.
   - Sao lưu dự phòng (backup) và khôi phục dữ liệu (recovery) khi gặp sự cố phần cứng, nguồn điện hoặc mã độc.

4. **Nhóm chức năng giao diện lập trình ứng dụng (API):**
   - Cung cấp phương thức và công cụ để gửi câu truy vấn đến CSDL từ các ngôn ngữ lập trình và ứng dụng bên ngoài.
   - Các chức năng được xây dựng tổng quát, độc lập với ứng dụng cụ thể.
   - *Các hệ QTCSDL phổ biến:* Oracle, MySQL, Microsoft SQL Server, PostgreSQL, SQLite, IBM DB2,...
   - *Lưu ý về Microsoft Access:* Thích hợp cho cá nhân hoặc doanh nghiệp nhỏ, nhưng có nhiều hạn chế về hiệu suất và không thích hợp cho các ứng dụng trực tuyến phức tạp quy mô lớn.

### II. Hệ cơ sở dữ liệu (Database System)
- Các hệ CSDL nhiều người dùng thường xây dựng theo **mô hình hai thành phần (Client - Server)**:
  - **Phần "chủ" (Server):** Thực hiện tính toán, xử lý và quản trị dữ liệu. Cung cấp gói cài đặt hệ QTCSDL.
  - **Phần "khách" (Client):** Tổ chức giao diện tương tác với người dùng cuối, kết nối với phần "chủ" và gửi yêu cầu xử lý dữ liệu.
- **Phần mềm ứng dụng CSDL:** Là chương trình giao diện tương tác với hệ QTCSDL để hỗ trợ người dùng cuối khai thác thông tin dễ dàng (ví dụ: ứng dụng mua bán trực tuyến, đặt xe công nghệ, cổng tra cứu điểm thi,...).

### III. Hệ CSDL tập trung và phân tán
- **Hệ CSDL tập trung:** Toàn bộ CSDL được lưu trữ và quản lý trên một máy tính duy nhất. Người dùng vừa có thể là người thiết kế, tạo lập vừa là người khai thác.
- **Hệ CSDL phân tán:**
  - Tập hợp dữ liệu được phân tán trên các trạm khác nhau của một mạng máy tính.
  - Mỗi trạm lưu trữ một CSDL cục bộ và thực hiện các ứng dụng cục bộ; đồng thời tham gia vào các ứng dụng toàn cục (sử dụng dữ liệu của từ hai trạm trở lên).
  - *Ưu điểm:* Dễ dàng mở rộng, bổ sung thêm trạm dữ liệu; nâng cao tính sẵn sàng và độ tin cậy nhờ cơ chế sao lưu dữ liệu phân tán (một trạm hỏng thì hệ thống vẫn tiếp tục hoạt động); tối ưu hóa tốc độ truy cập và giảm tải đường truyền cho các tổ chức lớn có nhiều chi nhánh (Facebook, Google, Amazon,...).
  - *Hạn chế:* Cấu trúc phức tạp, chi phí thiết kế và duy trì cao hơn hệ CSDL tập trung.

---

## BÀI 13: CƠ SỞ DỮ LIỆU QUAN HỆ

### I. Khái niệm cơ sở dữ liệu quan hệ (RDBMS)
- Dữ liệu được tổ chức thành các **bảng** (table): Mỗi hàng biểu diễn một đối tượng cụ thể, mỗi cột biểu diễn một thuộc tính của đối tượng.
- Các bảng có quan hệ với nhau thông qua các thuộc tính chung.
- Mô hình này được gọi là **mô hình dữ liệu quan hệ**, và CSDL tương ứng gọi là **CSDL quan hệ**.

### II. Các thuật ngữ và khái niệm liên quan
1. **Bản ghi (Record / Row / Hàng):**
   - Mỗi hàng trong bảng là một bản ghi.
   - Chứa toàn bộ thông tin về một đối tượng cụ thể (ví dụ: thông tin đầy đủ về một học sinh gồm SBD, Họ tên, Ngày sinh, Điểm).

2. **Trường (Field / Column / Cột):**
   - Mỗi cột trong bảng là một trường.
   - Thể hiện một thuộc tính cụ thể của đối tượng (ví dụ: cột `hoten`, cột `ngaysinh`, cột `diem`).

3. **Khóa chính (Primary Key):**
   - Là một trường hoặc nhóm trường được chọn để **phân biệt duy nhất** các bản ghi trong bảng.
   - Giá trị của khóa chính không được phép trùng lặp và không được để trống (NULL).
   - Thường ưu tiên chọn khóa có số trường ít nhất (ví dụ: Số báo danh `sbd`, Mã học sinh `mahs`).

4. **Khóa ngoài (Foreign Key):**
   - Là trường (hoặc nhóm trường) của bảng A nhưng tham chiếu đến khóa chính của bảng B.
   - Khi đó, bảng A và bảng B được gọi là có quan hệ với nhau thông qua khóa ngoài.

5. **Liên kết dữ liệu (Join):**
   - Sử dụng khóa ngoài để ghép nối dữ liệu giữa các bảng với nhau theo khóa.
   - *Lợi ích:* Tránh dư thừa và trùng lặp thông tin; khi cần sửa đổi thông tin chỉ cần sửa ở một bảng gốc (bảng chứa khóa chính), các bảng khác liên kết sẽ tự động cập nhật, đảm bảo tính nhất quán.

6. **Các trường và kiểu dữ liệu (Data Type):**
   - Mỗi trường phải được quy định một kiểu dữ liệu phù hợp (Số nguyên, Số thực/thập phân, Xâu ký tự, Ngày tháng Date, Logic/Boolean,...).
   - *Mục đích:* Hạn chế lãng phí dung lượng bộ nhớ lưu trữ và kiểm soát tính đúng đắn về mặt logic của dữ liệu (ngăn chặn nhập sai kiểu dữ liệu).
