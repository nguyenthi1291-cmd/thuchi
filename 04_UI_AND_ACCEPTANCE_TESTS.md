# 04 — UI, trải nghiệm người dùng và nghiệm thu

## 1. Nguyên tắc UI
- Giữ giao diện và cấu trúc hiện tại nếu đã có.
- Light mode, rõ ràng, dễ dùng cho nghiệp vụ kế toán.
- Giao diện tiếng Việt; dữ liệu tiền tệ định dạng VND.
- Responsive trên desktop và điện thoại.
- Không tự ý thay đổi nhận diện hoặc viết lại toàn bộ website.

## 2. Các khu vực chính
1. Đăng nhập/Đăng ký.
2. Dashboard: tổng thu, tổng chi, chênh lệch thu–chi, số lượng giao dịch.
3. Danh sách giao dịch.
4. Form thêm/sửa giao dịch.
5. Bộ lọc: ngày, mảng, thu/chi, danh mục, phương thức thanh toán.
6. Quản lý danh mục/tài khoản chỉ khi có quyền và đã được triển khai an toàn.

## 3. Form giao dịch
Các trường:
- Ngày giao dịch (bắt buộc).
- Mảng hoạt động (bắt buộc).
- Loại giao dịch Thu/Chi (bắt buộc).
- Danh mục (bắt buộc hoặc theo quy tắc nghiệp vụ được thống nhất).
- Số tiền VND (bắt buộc, lớn hơn 0).
- Hình thức thanh toán (bắt buộc).
- Tài khoản tiền/quỹ (tùy cấu hình).
- Diễn giải.
- Mã chứng từ/tham chiếu.

Dropdown mảng, danh mục, tài khoản phải lấy từ Supabase. Không hard-code ID. Nếu danh mục được gắn theo mảng hoặc loại giao dịch, dropdown phải lọc theo lựa chọn hiện tại.

## 4. Loading và lỗi
- Có loading khi tải dữ liệu.
- Có empty state khi chưa có giao dịch.
- Có thông báo thành công chỉ sau khi database xác nhận.
- Có thông báo lỗi rõ ràng, không giả lập dữ liệu để che lỗi.
- Giữ dữ liệu form nếu thao tác thất bại, nếu có thể làm an toàn.
- Có xác nhận trước khi xóa.

## 5. Tiêu chí nghiệm thu chức năng
### Authentication
- Đăng ký hoạt động.
- Đăng nhập/đăng xuất hoạt động.
- Session được khôi phục sau refresh.
- Chưa đăng nhập thì không thể truy cập giao dịch riêng tư.

### CRUD
- Tạo giao dịch hợp lệ và thấy bản ghi trong Supabase Table Editor.
- Refresh trang vẫn thấy bản ghi.
- Sửa bản ghi cập nhật đúng record.
- Xóa có xác nhận và xóa đúng record.
- Không báo thành công khi Supabase trả lỗi.

### Validation
- Từ chối số tiền bằng 0 hoặc âm.
- Từ chối loại giao dịch/hình thức thanh toán không hợp lệ.
- Danh mục khớp loại giao dịch và mảng.
- Xử lý lỗi mạng và session hết hạn.

### Dashboard
- Tổng thu = tổng amount của giao dịch `income` trong bộ lọc.
- Tổng chi = tổng amount của giao dịch `expense` trong bộ lọc.
- Chênh lệch thu–chi = tổng thu − tổng chi.
- Các tổng số thay đổi đúng khi thay đổi bộ lọc.
- Dashboard không dùng số liệu hard-code.

### Security
- RLS bật trên tất cả bảng liên quan.
- Không có secret/service-role key trong frontend.
- User không thể đọc/sửa giao dịch của user khác trong mô hình user-owned.
- Không mở quyền `anon` cho dữ liệu riêng tư.

## 6. Báo cáo hoàn thành bắt buộc của Antigravity
Khi kết thúc, ghi rõ:
- File đã tạo/sửa.
- SQL nào đã được đề xuất/chạy và người dùng cần thao tác gì.
- Các cấu hình cần người dùng điền.
- Test nào đã chạy, kết quả thực tế của từng test.
- Test nào chưa chạy được và lý do.
- Lỗi còn tồn tại.
- Không tuyên bố hoàn tất nếu chỉ mới viết code nhưng chưa kiểm tra kết nối database thật.
