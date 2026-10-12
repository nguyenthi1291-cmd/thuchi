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

8. **Quản Lý Hệ Thống & Phân Quyền Người Dùng Chi Tiết:**
   - **Giao diện trang "⚙️ Quản Lý Hệ Thống"**: Thống kê số lượng người dùng theo vai trò (Admin, Quản lý, Kế toán, Nhân viên), hiển thị trạng thái hoạt động.
   - **Bảng quản lý người dùng**: Xem danh sách toàn bộ tài khoản đăng ký, vai trò và phân quyền tương ứng.
   - **Phân quyền truy cập từng trang (Page Access)**:
     - 📑 *Sổ Thu Chi Chung*
     - ⚖️ *Đối Soát Bán Hàng F&B*
     - 💳 *Chi Lương & Chuyển Khoản*
     - ⚙️ *Quản Lý Hệ Thống*
   - **Phân quyền thao tác dữ liệu (Action Permissions)**:
     - ➕ *Thêm mới bản ghi (+)*
     - ✏️ *Chỉnh sửa bản ghi*
     - 🗑️ *Xóa bản ghi*
     - 📥 *Import Excel hàng loạt*
   - **Cơ chế bảo vệ đa lớp**: Ẩn/hiện nút bấm trên giao diện, kiểm tra quyền trước khi mở modal thao tác và thực thi bằng chính sách bảo mật **Row Level Security (RLS)** trên Supabase.

---

## 5. Chạy SQL Migration Bổ Sung (Nếu đã khởi tạo trước đó)

Nếu database của bạn đã có các bảng trước đó, hãy mở **Supabase SQL Editor** và chạy các đoạn script bổ sung sau:

### Mục 11: Bảng Chi Phí Lương & Chuyển Khoản
*(Xem chi tiết tại Mục 11 trong file [schema.sql](file:///d:/Quanlythuchi/schema.sql))*

### Mục 12: Bảng Hồ Sơ Người Dùng & Phân Quyền Hệ Thống

```sql
-- 12. BẢNG HỒ SƠ NGƯỜI DÙNG & PHÂN QUYỀN HỆ THỐNG
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'manager', 'accountant', 'staff')),
  
  -- Quyền truy cập các trang
  can_access_transactions boolean not null default true,
  can_access_fnb boolean not null default true,
  can_access_salary_bank boolean not null default false,
  can_access_system boolean not null default false,
  
  -- Quyền thao tác dữ liệu
  can_create boolean not null default true,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  can_import boolean not null default false,
  
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- Function kiểm tra Admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- Trigger tự động tạo profile khi user đăng ký
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from public.user_profiles) into is_first;
  insert into public.user_profiles (
    id, email, full_name, role,
    can_access_transactions, can_access_fnb, can_access_salary_bank, can_access_system,
    can_create, can_edit, can_delete, can_import, is_active
  ) values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case when is_first then 'admin' else 'staff' end,
    true, true,
    case when is_first then true else false end,
    case when is_first then true else false end,
    true,
    case when is_first then true else false end,
    case when is_first then true else false end,
    case when is_first then true else false end,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- Policies RLS
drop policy if exists user_profiles_select on public.user_profiles;
create policy user_profiles_select on public.user_profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists user_profiles_insert on public.user_profiles;
create policy user_profiles_insert on public.user_profiles for insert to authenticated
with check (id = auth.uid() or public.is_admin());

drop policy if exists user_profiles_update on public.user_profiles;
create policy user_profiles_update on public.user_profiles for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists user_profiles_delete on public.user_profiles;
create policy user_profiles_delete on public.user_profiles for delete to authenticated
using (public.is_admin());

grant select, insert, update, delete on public.user_profiles to authenticated;
```




