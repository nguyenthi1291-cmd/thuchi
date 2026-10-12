# 01 — Project Requirements

## 1. Bối cảnh
Xây dựng website quản lý thu chi cho ba mảng hoạt động:
- Sơn Mài
- F&B
- Văn phòng

Người dùng đang học Vibe Coding và sử dụng Antigravity. Repository GitHub đã có code; Supabase project đã có nhưng cần kiểm tra trạng thái schema. Website dùng HTML/CSS/JavaScript thuần, không tự ý chuyển sang framework.

## 2. Mục tiêu chính
1. Người dùng có thể đăng ký tài khoản và đăng nhập.
2. Dữ liệu giao dịch được đọc/ghi đồng bộ thực tế với Supabase.
3. Dữ liệu vẫn còn sau khi refresh, đóng trình duyệt hoặc đăng nhập lại.
4. Giao dịch được phân loại theo mảng, thu/chi, ngày, danh mục và hình thức thanh toán.
5. Hiển thị dashboard và bộ lọc dựa trên dữ liệu database, không phải dữ liệu demo.
6. Có thông báo loading, thành công, dữ liệu trống và lỗi rõ ràng.

## 3. Công nghệ và giới hạn
- Frontend: HTML5, CSS3, JavaScript thuần.
- Backend/database: Supabase PostgreSQL.
- Authentication: Supabase Auth.
- Client: dùng phiên bản `@supabase/supabase-js` phù hợp với cấu trúc hiện có. Nếu website không có bundler, dùng cách nạp thư viện browser/CDN chính thức phù hợp và ghi rõ phiên bản.
- Không thêm backend riêng, framework, build tool hoặc thư viện lớn nếu chưa chứng minh cần thiết và chưa báo cáo trước.
- Cloudflare chưa nằm trong phạm vi triển khai ở giai đoạn đầu.

## 4. Yêu cầu bắt buộc trước khi sửa code
Antigravity phải:
1. Liệt kê file và thư mục hiện tại.
2. Xác định entry point, trang hiện có, CSS/JS, thư viện và cách chạy.
3. Tìm chỗ dùng dữ liệu mock, hard-code hoặc `localStorage`.
4. Kiểm tra code đã có Supabase client/auth chưa.
5. Đưa ra kế hoạch thay đổi file ngắn gọn.
6. Không xóa hoặc viết lại giao diện đang có nếu không cần.
7. Không sửa database hoặc chạy SQL tự động mà chưa trình bày migration/SQL để người dùng duyệt.

## 5. Chức năng đăng ký và tài khoản
- Trang/khung đăng ký bằng email và mật khẩu.
- Đăng nhập bằng email và mật khẩu.
- Đăng xuất.
- Khôi phục session khi refresh trang.
- Xử lý xác nhận email theo cấu hình Supabase Auth.
- Hiển thị lỗi xác thực rõ ràng nhưng không để lộ thông tin nhạy cảm.
- Có trạng thái đang xử lý để tránh gửi form nhiều lần.
- Không lưu mật khẩu trong localStorage/sessionStorage hoặc trong code.
- Khi chưa đăng nhập, không cho phép xem hoặc thao tác dữ liệu giao dịch riêng tư.
- Nếu Supabase yêu cầu xác nhận email, giao diện phải hướng dẫn người dùng kiểm tra email thay vì giả định đăng ký đã đăng nhập thành công.

## 6. Chức năng quản lý giao dịch
Mỗi giao dịch tối thiểu có:
- Ngày giao dịch
- Mảng hoạt động: Sơn Mài / F&B / Văn phòng
- Loại: Thu / Chi
- Danh mục
- Số tiền VND
- Hình thức thanh toán: Tiền mặt / Chuyển khoản / Thẻ / Khác
- Tài khoản tiền/quỹ (nếu đã cấu hình)
- Nội dung/diễn giải
- Mã chứng từ/tham chiếu (không bắt buộc)
- Người tạo, thời điểm tạo và cập nhật

Chức năng:
- Tạo giao dịch.
- Hiển thị danh sách giao dịch thực từ Supabase.
- Xem chi tiết, sửa và xóa giao dịch theo quyền.
- Lọc theo khoảng ngày, mảng, loại thu/chi, danh mục, hình thức thanh toán.
- Tìm kiếm theo diễn giải hoặc mã chứng từ.
- Phân trang hoặc giới hạn số bản ghi để tránh tải toàn bộ dữ liệu lớn.
- Có xác nhận trước khi xóa.
- Khi lưu thành công, cập nhật giao diện dựa trên kết quả database.
- Nếu API thất bại, không hiển thị thành công giả và không âm thầm dùng dữ liệu mẫu.

## 7. Dashboard và báo cáo
Dùng dữ liệu đã truy vấn từ Supabase, theo bộ lọc ngày/mảng:
- Tổng thu.
- Tổng chi.
- Chênh lệch thu – chi trong kỳ.
- Số lượng giao dịch.
- Tổng thu/chi theo từng mảng.
- Danh sách giao dịch gần nhất.

Không gọi “lợi nhuận” nếu chỉ tính tổng thu trừ tổng chi mà chưa xử lý đầy đủ các nghiệp vụ kế toán liên quan. Nhãn phù hợp là “Chênh lệch thu – chi”.

## 8. Quy tắc dữ liệu
- Số tiền phải là số dương; loại giao dịch quyết định thu hay chi.
- Dùng `numeric`/`numeric(18,2)` trong PostgreSQL, không dùng kiểu floating point cho tiền.
- Ngày giao dịch dùng kiểu `date`.
- Lưu timestamp theo `timestamptz`.
- Kiểm tra dữ liệu ở cả frontend và database.
- Danh mục phải tương thích với loại giao dịch; nếu danh mục gắn riêng mảng thì phải khớp mảng đã chọn.
- Không hard-code ID database; lấy ID thực từ Supabase.
- Không tạo ID giả ở frontend để thay thế bản ghi database.

## 9. Cấu hình
- Tập trung Project URL và publishable key tại một file cấu hình duy nhất.
- Chỉ dùng publishable/anon key phù hợp cho frontend; đây không phải bí mật nhưng quyền dữ liệu bắt buộc phải được kiểm soát bằng RLS.
- Không bao giờ đưa `service_role` hoặc secret key vào trình duyệt.
- Không commit mật khẩu hoặc token cá nhân.
- Ghi rõ các bước người dùng phải làm trong Supabase Dashboard.

## 10. Đồng bộ dữ liệu
- Khi mở ứng dụng và khi session được khôi phục, tải dữ liệu từ Supabase.
- Sau thao tác create/update/delete, chỉ xác nhận thành công khi Supabase trả về kết quả thành công.
- Khi lỗi mạng/API, giữ thông tin người dùng nhập nếu an toàn, báo lỗi và cho phép thử lại.
- Không coi `localStorage` là database chính thức. Chỉ dùng để lưu lựa chọn giao diện không nhạy cảm nếu thực sự cần.
- Nếu dùng realtime subscription, chỉ thêm sau khi chức năng CRUD cơ bản hoạt động và RLS được xác minh. Không tuyên bố realtime nếu chỉ tải lại dữ liệu theo yêu cầu.

## 11. Phạm vi chưa triển khai mặc định
Chưa tự ý xây dựng:
- Kế toán kép/sổ cái.
- Hạch toán VAT, thuế TNDN hoặc hóa đơn điện tử.
- Quản lý công nợ đầy đủ.
- Phê duyệt nhiều cấp.
- Phân bổ một giao dịch sang nhiều mảng/tài khoản.
- Upload chứng từ.
- Tích hợp ngân hàng.
- Triển khai Cloudflare production.
Hãy ghi các phần này thành đề xuất giai đoạn sau, không tự thêm nếu chưa được duyệt.
