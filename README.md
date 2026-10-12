# Website Quản lý Thu Chi — Sơn Mài, F&B, Văn phòng

Hệ thống web quản lý thu chi độc lập cho 3 mảng hoạt động (**Sơn Mài**, **F&B**, **Văn phòng**) xây dựng bằng **HTML5, CSS3, JavaScript thuần**, kết nối trực tiếp với cơ sở dữ liệu **Supabase PostgreSQL** và **Supabase Auth**.

---

## 1. Cấu trúc thư mục dự án

```
d:\Quanlythuchi\
├── index.html                  # Giao diện chính hoàn chỉnh (Dashboard, Auth, Sổ thu chi & Đối soát F&B)
├── schema.sql                  # Toàn bộ SQL DDL (bao gồm fnb_sales_reconciliations), RLS & Triggers
├── css\
│   └── style.css               # Giao diện Light mode chuẩn tài chính, kế toán, responsive
├── js\
│   ├── supabase-config.js      # Cấu hình Supabase (URL, anon key, client init)
│   ├── auth.js                 # Xử lý Supabase Authentication (login, register, logout, session)
│   ├── transactions.js         # API CRUD giao dịch, mảng kinh doanh, danh mục từ Supabase
│   ├── dashboard.js            # Tính toán và hiển thị Dashboard thu/chi theo mảng (không gọi sai là lợi nhuận)
│   ├── fnb-reconciliation.js   # API CRUD & Thống kê Đối soát F&B (KiotViet vs MB Bank & Tiền mặt)
│   └── app.js                  # Điều phối tương tác giao diện, chuyển view tab, modal, toast, filters
├── server.ps1                  # Script tiện ích chạy local web server bằng PowerShell
├── start.bat                   # Phím tắt nhấp đúp chạy server và tự động mở trình duyệt
├── qlthuchi_supabase.txt        # Thông tin kết nối Supabase đã cung cấp
├── README.md                   # Tài liệu hướng dẫn sử dụng và kiểm thử
├── 01_PROJECT_REQUIREMENTS.md   # Đặc tả yêu cầu dự án
├── 02_DATABASE_SCHEMA.md        # Thiết kế schema cơ sở dữ liệu
├── 03_SECURITY_AND_AUTH.md      # Quy chuẩn bảo mật và phân quyền RLS
└── 04_UI_AND_ACCEPTANCE_TESTS.md# Tiêu chí nghiệm thu và kiểm thử
```

---

## 2. Hướng dẫn thiết lập Supabase (Bắt buộc 2 bước)

### Bước 1: Chạy file `schema.sql` trên Supabase Dashboard
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard/project/wszzjfkkswuilksznlme) và chọn project **Quanlythuchi**.
2. Mở mục **SQL Editor** ở thanh menu bên trái.
3. Bấm **New query**, sao chép toàn bộ nội dung trong file [schema.sql](file:///d:/Quanlythuchi/schema.sql) và dán vào.
4. Bấm **Run** để khởi tạo:
   - 5 bảng: `business_units`, `categories`, `cash_accounts`, `transactions` và `fnb_sales_reconciliations`.
   - Bật Row Level Security (RLS) trên tất cả các bảng.
   - Cột tự động tính toán `total_collected` và `difference` trên PostgreSQL.
   - Trigger tự động cập nhật `updated_at`.
   - Nạp sẵn 3 mảng kinh doanh và danh mục chuẩn cho Sơn Mài, F&B, Văn phòng.

### Bước 2: Lấy Supabase `anon` (public) key
1. Tại Supabase Dashboard, vào **Project Settings** (biểu tượng bánh răng) &rarr; **API**.
2. Tại mục **Project API keys**, copy khóa **`anon` `public`**.
3. Bạn có 2 cách đưa khóa vào web:
   - **Cách 1 (Khuyên dùng):** Mở website, trên thanh thông báo hoặc nút **⚙️ Cấu hình DB** ở góc trên bên phải, dán Anon Key vào rồi bấm **Lưu & Kết nối**. Khóa sẽ được lưu an toàn trong trình duyệt.
   - **Cách 2:** Mở file [js/supabase-config.js](file:///d:/Quanlythuchi/js/supabase-config.js) và dán khóa vào biến `anonKey: "..."`.

---

## 3. Cách chạy Website

Có 2 cách đơn giản để mở website:

### Cách 1: Chạy Web Server cục bộ (Khuyên dùng)
Mở PowerShell tại thư mục dự án và gõ:
```powershell
.\server.ps1
```
Trình duyệt sẽ tự động mở địa chỉ: `http://localhost:8080/`.

### Cách 2: Mở trực tiếp file HTML
Nhấp đúp chuột vào file [index.html](file:///d:/Quanlythuchi/index.html) để mở trên bất kỳ trình duyệt nào (Chrome, Edge, Firefox).

---

## 4. Các tính năng chính

1. **Xác thực người dùng (Supabase Auth):**
   - Đăng ký và Đăng nhập bằng Email/Mật khẩu.
   - Tự động duy trì và khôi phục phiên đăng nhập khi F5 hoặc mở lại trình duyệt.
   - Hướng dẫn kích hoạt email nếu Supabase bật xác nhận email.
2. **Dashboard thống kê thời gian thực:**
   - Tổng thu, Tổng chi, Chênh lệch thu – chi, Số lượng giao dịch.
   - Thống kê chi tiết từng mảng: **Sơn Mài**, **F&B**, **Văn phòng**.
3. **Bộ lọc đa chiều:**
   - Chọn nhanh thời gian: Hôm nay, Tháng này, Quý này, Tất cả.
   - Lọc theo Mảng hoạt động, Loại giao dịch (Thu / Chi), Danh mục, Hình thức thanh toán.
   - Tìm kiếm tức thì theo Diễn giải hoặc Mã chứng từ/hóa đơn.
4. **Quản lý giao dịch (CRUD):**
   - Thêm mới giao dịch với preview số tiền định dạng VND trực quan.
   - Danh mục tự động thay đổi theo mảng và loại thu/chi được chọn.
   - Chỉnh sửa giao dịch nhanh chóng.
   - Xóa giao dịch kèm hộp thoại xác nhận an toàn.
   - Thông báo Toast hiển thị kết quả thao tác rõ ràng.
5. **Đối soát Doanh thu Bán hàng F&B (KiotViet vs MB Bank & Tiền mặt):**
   - Nhập Doanh thu bán hàng KiotViet theo từng ngày.
   - Nhập Tiền mặt thực thu và Chuyển khoản MB Bank thực thu.
   - Tự động tính: Tổng thực thu = Tiền mặt + CK MB.
   - Tự động tính chênh lệch: Chênh lệch = Tổng thực thu - KiotViet.
   - Phát hiện và gắn nhãn trạng thái trực quan: **Khớp chuẩn 100%**, **Thừa tiền (+)**, **Thiếu tiền (-)**.
   - Bắt buộc / nhắc nhở giải trình lý do khi phát hiện chênh lệch (khách nợ, tip/bo, giảm giá, phí quẹt thẻ...).
   - Dữ liệu lưu trữ độc lập theo từng ngày trên Supabase (bảo đảm mỗi ngày 1 bản ghi chính xác).
   - Thống kê Dashboard KPI và bộ lọc theo ngày, trạng thái khớp/lệch.
6. **Quản lý Chi Phí Lương & Chi Chuyển Khoản có gắn Mã Hoạt Động:**
   - Form nhập liệu trực tiếp trên trang với giao diện rõ ràng, phân loại giữa **Chi Lương** (Lương cứng, lương ca, tạm ứng, thưởng) và **Chi Chuyển Khoản Hoạt Động** (NCC, tiền thuê, vận hành, thuế phí).
   - Gắn trực tiếp mã hoạt động: **Sơn Mài (`SON_MAI`)**, **F&B (`FNB`)**, **Văn phòng (`VAN_PHONG`)** để phục vụ lập báo cáo doanh thu - chi phí đa chiều theo mảng.
   - Theo dõi tài khoản trích chi (MB Bank), ngân hàng và số tài khoản người nhận, số ủy nhiệm chi / mã giao dịch ngân hàng.
   - Dashboard 4 KPI chi phí: Tổng chi trong kỳ, Chi mảng Sơn Mài, Chi mảng F&B, Chi mảng Văn phòng.
   - Bảng danh sách chi phí kèm bộ lọc theo mảng, loại chi, từ ngày - đến ngày, tìm kiếm người nhận hoặc mã UNC, chỉnh sửa và xóa trực tiếp.

7. **Tệp Mẫu Excel & Chức Năng Import Hàng Loạt:**
   - Cung cấp **3 file Excel mẫu đính kèm trực tiếp trên web** chuẩn định dạng `.xlsx`:
     - 📎 **`templates/mau_so_thu_chi_chung.xlsx`**: Mẫu sổ thu chi chung theo mã mảng.
     - 📎 **`templates/mau_doi_soat_fnb.xlsx`**: Mẫu đối soát doanh thu F&B hàng ngày.
     - 📎 **`templates/mau_chi_luong_chuyen_khoan.xlsx`**: Mẫu chi lương & chi chuyển khoản theo mã hoạt động.
   - Nút **"📎 Tải mẫu Excel"** và **"📥 Import Excel"** được đặt sẵn tại:
     - Header của từng trang sổ dữ liệu (Sổ Thu Chi, Đối soát F&B, Chi Lương & Chuyển Khoản).
     - Nút **"📥 File Excel & Import"** cố định trên thanh điều hướng đầu trang để tải hoặc nhập bất kỳ lúc nào.
   - Tích hợp thư viện **SheetJS** (`xlsx.full.min.js`) xử lý đọc file trực tiếp tại trình duyệt, tự động map cột, kiểm tra tính hợp lệ dữ liệu, hiển thị cảnh báo lỗi chi tiết theo từng dòng và đồng bộ lưu vào Supabase.

---

## 5. Chạy SQL Migration Bổ Sung (Nếu đã khởi tạo trước đó)

Nếu database của bạn đã có các bảng trước đó, hãy mở **Supabase SQL Editor** và chạy đoạn script ở **Mục 11** trong file [schema.sql](file:///d:/Quanlythuchi/schema.sql) để tạo bảng `salary_and_bank_expenses`:

```sql
-- 11. BẢNG CHI PHÍ LƯƠNG VÀ CHI CHUYỂN KHOẢN THEO MÃ HOẠT ĐỘNG
create table if not exists public.salary_and_bank_expenses (
  id bigint generated by default as identity primary key,
  expense_date date not null default current_date,
  business_unit_id bigint not null references public.business_units(id) on delete restrict,
  expense_category varchar(60) not null default 'other_expense',
  expense_type varchar(30) not null default 'bank_transfer',
  recipient_name varchar(255) not null,
  recipient_bank varchar(100),
  recipient_account varchar(100),
  amount numeric(15, 2) not null check (amount > 0),
  source_bank varchar(100) default 'MB Bank',
  reference_no varchar(100),
  description text,
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.salary_and_bank_expenses enable row level security;

drop policy if exists owner_manage_salary_bank_expenses on public.salary_and_bank_expenses;
create policy owner_manage_salary_bank_expenses on public.salary_and_bank_expenses
for all
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

grant select, insert, update, delete on public.salary_and_bank_expenses to authenticated;
grant usage, select on sequence public.salary_and_bank_expenses_id_seq to authenticated;

drop trigger if exists set_salary_bank_expenses_updated_at on public.salary_and_bank_expenses;
create trigger set_salary_bank_expenses_updated_at
before update on public.salary_and_bank_expenses
for each row execute function public.handle_updated_at();
```



