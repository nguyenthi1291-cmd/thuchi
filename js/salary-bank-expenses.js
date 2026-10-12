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
  }
};

window.SalaryBankExpenseService = SalaryBankExpenseService;
