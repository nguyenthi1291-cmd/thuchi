# 03 — Authentication và bảo mật

## 1. Authentication
Dùng Supabase Auth:
- Sign up bằng email/password.
- Sign in bằng email/password.
- Sign out.
- Khôi phục session sau khi refresh.
- Xử lý trường hợp cần xác nhận email.
- Xử lý session hết hạn, sai mật khẩu, email đã đăng ký và lỗi mạng.
- Không lưu password trong localStorage/sessionStorage.
- Không tự tạo cơ chế password riêng trong database.

## 2. Khóa và cấu hình
- Frontend chỉ dùng Project URL và publishable key (hoặc anon key theo cấu hình hiện có).
- Không dùng `service_role`, secret key hoặc credential quản trị ở browser.
- Không gửi key riêng tư vào prompt, chat, GitHub, README hoặc file cấu hình công khai.
- Nếu key bí mật đã từng bị commit, phải rotate/revoke theo hướng dẫn Supabase.
- Cấu hình frontend tập trung tại một file như `js/supabase-config.js`, nhưng không coi việc che giấu publishable key là bảo mật.

## 3. Row Level Security
- RLS phải bật trên tất cả bảng được frontend truy cập.
- Không tạo policy `USING (true)` cho thao tác ghi giao dịch riêng tư.
- Không vô hiệu hóa RLS để sửa lỗi.
- Test truy cập khi signed-out.
- Test hai user khác nhau.
- Nếu chỉ dùng mô hình user-owned, policy phải giới hạn `created_by = auth.uid()`.
- Nếu dùng chung dữ liệu công ty, cần mô hình organization/member/role trước khi đưa dữ liệu thật vào.

## 4. Validation
- Validate trên frontend để trải nghiệm tốt.
- Dùng constraints và policies trong database để bảo vệ dữ liệu thực.
- Amount phải > 0.
- Type chỉ `income` hoặc `expense`.
- Payment method chỉ nằm trong danh sách hợp lệ.
- Không tin `created_by` do client tự gửi; dùng default `auth.uid()` và RLS.
- Không hiển thị stack trace hoặc thông tin nhạy cảm cho người dùng cuối.

## 5. Kiểm thử bảo mật
- Signed-out không thể SELECT/INSERT/UPDATE/DELETE giao dịch.
- User A không đọc được giao dịch User B.
- User A không sửa được `created_by` thành User B hoặc ghi giao dịch thay User B.
- Không có secret/service-role key trong file frontend.
- Không có thông tin cá nhân thật trong seed/test data.
