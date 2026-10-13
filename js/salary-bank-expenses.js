// ============================================================
// SALARY & BANK EXPENSES SERVICE
// Quản lý chi phí lương và chi chuyển khoản theo mã hoạt động
// ============================================================

const SalaryBankExpenseService = {
  // Nhãn danh mục chi phí hiển thị tiếng Việt
  CATEGORY_LABELS: {
    salary_fixed: "Lương cứng / Lương tháng",
    salary_shift: "Lương ca / Công nhật / Part-time",
    salary_advance: "Tạm ứng lương",
    salary_bonus: "Thưởng & Phụ cấp",
    supplier_payment: "Thanh toán NCC / Tiền hàng",
    rent_utility: "Thuê mặt bằng / Điện nước / Net",
    operation_cost: "Chi phí vận hành & Dụng cụ",
    tax_fee: "Thuế, phí & Dịch vụ ngoài",
    other_expense: "Chi chuyển khoản khác"
  },

  // 1. LẤY DANH SÁCH CHI PHÍ VỚI BỘ LỌC
  async getExpenses(filters = {}) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    let query = client
      .from("salary_and_bank_expenses")
      .select(`
        id,
        expense_date,
        business_unit_id,
        expense_category,
        expense_type,
        recipient_name,
        recipient_bank,
        recipient_account,
        amount,
        source_bank,
        reference_no,
        description,
        notes,
        created_at,
        updated_at,
        business_units ( id, code, name )
      `);

    if (filters.startDate) {
      query = query.gte("expense_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("expense_date", filters.endDate);
    }
    if (filters.businessUnitId) {
      query = query.eq("business_unit_id", filters.businessUnitId);
    }
    if (filters.expenseType && filters.expenseType !== "all") {
      query = query.eq("expense_type", filters.expenseType);
    }
    if (filters.expenseCategory) {
      query = query.eq("expense_category", filters.expenseCategory);
    }

    if (filters.search && filters.search.trim() !== "") {
      const kw = filters.search.trim();
      query = query.or(`recipient_name.ilike.%${kw}%,reference_no.ilike.%${kw}%,description.ilike.%${kw}%,recipient_account.ilike.%${kw}%`);
    }

    query = query
      .order("expense_date", { ascending: false })
      .order("id", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Lỗi khi tải chi phí lương và chuyển khoản:", error);
      throw error;
    }
    return data || [];
  },

  // 2. TẠO MỚI HOẶC CẬP NHẬT KHOẢN CHI
  async saveExpense(formData) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    if (!formData.expense_date) {
      throw new Error("Ngày chi không được để trống.");
    }
    if (!formData.business_unit_id) {
      throw new Error("Vui lòng chọn mảng hoạt động.");
    }
    if (!formData.recipient_name || formData.recipient_name.trim() === "") {
      throw new Error("Vui lòng nhập tên người nhận (nhân viên hoặc nhà cung cấp).");
    }

    const numAmount = Number(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Số tiền chi phải là số dương lớn hơn 0.");
    }

    const payload = {
      expense_date: formData.expense_date,
      business_unit_id: Number(formData.business_unit_id),
      expense_category: formData.expense_category,
      expense_type: formData.expense_type || "bank_transfer",
      recipient_name: formData.recipient_name.trim(),
      recipient_bank: formData.recipient_bank ? formData.recipient_bank.trim() : null,
      recipient_account: formData.recipient_account ? formData.recipient_account.trim() : null,
      amount: numAmount,
      source_bank: formData.source_bank ? formData.source_bank.trim() : "MB Bank",
      reference_no: formData.reference_no ? formData.reference_no.trim() : null,
      description: formData.description ? formData.description.trim() : null,
      notes: formData.notes ? formData.notes.trim() : null
    };

    let result;
    if (formData.id) {
      const { data, error } = await client
        .from("salary_and_bank_expenses")
        .update(payload)
        .eq("id", formData.id)
        .select(`
          id, expense_date, business_unit_id, expense_category, expense_type,
          recipient_name, recipient_bank, recipient_account, amount, source_bank,
          reference_no, description, notes, updated_at,
          business_units ( id, code, name )
        `)
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await client
        .from("salary_and_bank_expenses")
        .insert([payload])
        .select(`
          id, expense_date, business_unit_id, expense_category, expense_type,
          recipient_name, recipient_bank, recipient_account, amount, source_bank,
          reference_no, description, notes, created_at,
          business_units ( id, code, name )
        `)
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  },

  // 3. XÓA KHOẢN CHI
  async deleteExpense(id) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    const { error } = await client
      .from("salary_and_bank_expenses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Lỗi khi xóa khoản chi:", error);
      throw error;
    }
    return true;
  },

  // 4. TÍNH TOÁN BÁO CÁO TỔNG HỢP THEO MẢNG
  calculateSummary(expenses = []) {
    let totalAmount = 0;
    let totalSalary = 0;
    let totalBankTransfer = 0;

    const unitsSummary = {
      SON_MAI: { name: "Sơn Mài", amount: 0, count: 0, salary: 0, transfer: 0 },
      FNB: { name: "F&B", amount: 0, count: 0, salary: 0, transfer: 0 },
      VAN_PHONG: { name: "Văn phòng", amount: 0, count: 0, salary: 0, transfer: 0 },
      OTHER: { name: "Khác", amount: 0, count: 0, salary: 0, transfer: 0 }
    };

    expenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      const uCode = e.business_units?.code || "OTHER";
      const isSalary = e.expense_type === "salary";

      totalAmount += amt;
      if (isSalary) {
        totalSalary += amt;
      } else {
        totalBankTransfer += amt;
      }

      if (unitsSummary[uCode]) {
        unitsSummary[uCode].amount += amt;
        unitsSummary[uCode].count += 1;
        if (isSalary) unitsSummary[uCode].salary += amt;
        else unitsSummary[uCode].transfer += amt;
      } else {
        unitsSummary.OTHER.amount += amt;
        unitsSummary.OTHER.count += 1;
      }
    });

    return {
      totalAmount,
      totalSalary,
      totalBankTransfer,
      count: expenses.length,
      unitsSummary
    };
    // BỔ SUNG CHO salary-bank-expenses.js  (dán vào CUỐI file hiện tại)
// Thêm các hàm mà app.js (bản 13/10) đang gọi nhưng file service cũ chưa có:
//   EXPENSE_TYPE_LABELS, getCategories, getCategoriesForType,
//   saveCategory, deleteCategory
// Bảng Supabase dùng: public.salary_bank_categories (xem file SQL kèm theo)
// =====================================================================
(function () {
  const svc = window.SalaryBankExpenseService;
  if (!svc) {
    console.error("SalaryBankExpenseService chưa được khởi tạo – kiểm tra thứ tự <script>.");
    return;
  }
 
  const TABLE = "salary_bank_categories";
 
  // Nhãn loại chi
  const EXPENSE_TYPE_LABELS = {
    salary: "Chi lương",
    bank_transfer: "Chuyển khoản",
  };
 
  // Danh mục mặc định (dùng khi chưa có bảng / chưa có dữ liệu)
  const baseLabels = Object.assign({}, svc.CATEGORY_LABELS || {});
  const DEFAULT_CATEGORIES = Object.keys(baseLabels).map((code) => ({
    code,
    label: baseLabels[code],
    expense_type: code.indexOf("salary_") === 0 ? "salary" : "bank_transfer",
    created_by_email: null,
    is_default: true,
  }));
 
  // Bộ nhớ đệm danh mục đã tải từ Supabase (null = chưa tải được)
  let cache = null;
 
  function getClient() {
    const client = window.SupabaseConfig && window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");
    return client;
  }
 
  // Cập nhật CATEGORY_LABELS để bảng danh sách chi hiển thị đúng tên danh mục mới
  function syncLabels(list) {
    const labels = Object.assign({}, baseLabels);
    (list || []).forEach((c) => { labels[c.code] = c.label; });
    svc.CATEGORY_LABELS = labels;
  }
 
  // 1. Lấy toàn bộ danh mục (async) – app.js gọi khi mở tab / bấm Tải lại
  async function getCategories() {
    const client = getClient();
    const { data, error } = await client
      .from(TABLE)
      .select("id, code, label, expense_type, created_by_email, created_at")
      .order("expense_type", { ascending: true })
      .order("code", { ascending: true });
    if (error) {
      cache = null;
      syncLabels([]);
      throw error;
    }
    cache = data && data.length ? data : null;
    syncLabels(data);
    // Bảng trống → trả về danh mục mặc định để người dùng vẫn thấy/sửa được
    return data && data.length ? data : DEFAULT_CATEGORIES.slice();
  }
 
  // 2. Lấy danh mục theo loại chi (SYNC) – dùng cho dropdown form Chi Lương & CK
  function getCategoriesForType(type) {
    const src = cache || DEFAULT_CATEGORIES;
    const t = type || "bank_transfer";
    return src.filter((c) => (c.expense_type || "bank_transfer") === t);
  }
 
  // 3. Thêm / sửa danh mục
  async function saveCategory(formData, isEdit) {
    const client = getClient();
    const code = String(formData.code || "").trim().toLowerCase().replace(/\s+/g, "_");
    const label = String(formData.label || "").trim();
    const expense_type = formData.expense_type === "salary" ? "salary" : "bank_transfer";
 
    if (!/^[a-z0-9_]{2,50}$/.test(code)) {
      throw new Error("Mã danh mục chỉ gồm chữ thường không dấu, số và dấu _ (2–50 ký tự).");
    }
    if (!label) throw new Error("Vui lòng nhập tên danh mục.");
 
    const { data: userData } = await client.auth.getUser();
    const email = userData && userData.user ? userData.user.email : null;
 
    if (isEdit) {
      // upsert: sửa được cả danh mục mặc định chưa có dòng trong bảng
      const { data, error } = await client
        .from(TABLE)
        .upsert(
          [{ code, label, expense_type, created_by_email: email, updated_at: new Date().toISOString() }],
          { onConflict: "code" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    }
 
    const { data, error } = await client
      .from(TABLE)
      .insert([{ code, label, expense_type, created_by_email: email }])
      .select()
      .single();
    if (error) {
      if (error.code === "23505") throw new Error(`Mã danh mục "${code}" đã tồn tại.`);
      throw error;
    }
    return data;
  }
 
  // 4. Xóa danh mục (chặn xóa nếu đã có khoản chi dùng mã này)
  async function deleteCategory(code) {
    const client = getClient();
    const { count, error: countErr } = await client
      .from("salary_and_bank_expenses")
      .select("id", { count: "exact", head: true })
      .eq("expense_category", code);
    if (!countErr && count > 0) {
      throw new Error(`Không thể xóa: đang có ${count} khoản chi dùng danh mục này.`);
    }
    const { error } = await client.from(TABLE).delete().eq("code", code);
    if (error) throw error;
    return true;
  }
 
  Object.assign(svc, {
    EXPENSE_TYPE_LABELS,
    DEFAULT_CATEGORIES,
    getCategories,
    getCategoriesForType,
    saveCategory,
    deleteCategory,
  });
})();
  }
};

window.SalaryBankExpenseService = SalaryBankExpenseService;
