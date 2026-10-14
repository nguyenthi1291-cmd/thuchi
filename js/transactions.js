// ============================================================
// TRANSACTION SERVICE (SUPABASE DATABASE INTERFACE)
// Quản lý CRUD giao dịch, mảng kinh doanh, danh mục, tài khoản
// ============================================================

const TransactionService = {
  // 1. LẤY DANH SÁCH MẢNG KINH DOANH
  async getBusinessUnits() {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    const { data, error } = await client
      .from("business_units")
      .select("id, code, name, is_active")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("Lỗi khi tải mảng kinh doanh:", error);
      throw error;
    }
    return data || [];
  },

  // 2. LẤY DANH SÁCH DANH MỤC THU/CHI
  async getCategories(unitId = null, transactionType = null, includeInactive = false) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    let query = client
      .from("categories")
      .select("id, name, transaction_type, business_unit_id, is_active, created_by, business_units ( id, code, name )");

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    if (unitId) {
      query = query.or(`business_unit_id.eq.${unitId},business_unit_id.is.null`);
    }

    if (transactionType) {
      query = query.eq("transaction_type", transactionType);
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) {
      console.error("Lỗi khi tải danh mục:", error);
      throw error;
    }
    return data || [];
  },

  // 2.1 TẠO MỚI DANH MỤC THU / CHI
  async createCategory(categoryData) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    if (!categoryData.name || !categoryData.name.trim()) {
      throw new Error("Tên danh mục không được để trống.");
    }
    if (!categoryData.transaction_type || !["income", "expense"].includes(categoryData.transaction_type)) {
      throw new Error("Loại danh mục phải là Thu hoặc Chi.");
    }

    const payload = {
      name: categoryData.name.trim(),
      transaction_type: categoryData.transaction_type,
      business_unit_id: categoryData.business_unit_id ? Number(categoryData.business_unit_id) : null,
      is_active: categoryData.is_active !== false
    };

    const { data, error } = await client
      .from("categories")
      .insert([payload])
      .select("id, name, transaction_type, business_unit_id, is_active, business_units ( id, code, name )")
      .single();

    if (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      throw error;
    }
    return data;
  },

  // 2.2 CẬP NHẬT DANH MỤC THU / CHI
  async updateCategory(id, categoryData) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    if (!categoryData.name || !categoryData.name.trim()) {
      throw new Error("Tên danh mục không được để trống.");
    }

    const payload = {
      name: categoryData.name.trim(),
      transaction_type: categoryData.transaction_type,
      business_unit_id: categoryData.business_unit_id ? Number(categoryData.business_unit_id) : null,
      is_active: categoryData.is_active !== false
    };

    const { data, error } = await client
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select("id, name, transaction_type, business_unit_id, is_active, business_units ( id, code, name )")
      .single();

    if (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      throw error;
    }
    return data;
  },

  // 2.3 XÓA DANH MỤC THU / CHI
  async deleteCategory(id) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    // Kiểm tra xem đã có giao dịch nào dùng danh mục này chưa
    const { count, error: countErr } = await client
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (!countErr && count > 0) {
      throw new Error(`Không thể xóa danh mục này vì đang có ${count} giao dịch liên kết. Bạn có thể chỉnh sửa tên danh mục nếu cần.`);
    }

    const { error } = await client
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      throw error;
    }
    return true;
  },

  // 3. LẤY DANH SÁCH TÀI KHOẢN TIỀN/QUỸ
  async getCashAccounts() {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    const { data, error } = await client
      .from("cash_accounts")
      .select("id, name, account_type, opening_balance, is_active")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("Lỗi khi tải tài khoản quỹ:", error);
      throw error;
    }
    return data || [];
  },

  // 4. TRUY VẤN GIAO DỊCH VỚI BỘ LỌC
  async getTransactions(filters = {}) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    let query = client
      .from("transactions")
      .select(`
        id,
        transaction_date,
        business_unit_id,
        category_id,
        cash_account_id,
        transaction_type,
        amount,
        payment_method,
        description,
        reference_no,
        created_at,
        updated_at,
        business_units ( id, code, name ),
        categories ( id, name ),
        cash_accounts ( id, name, account_type )
      `);

    // Lọc theo ngày bắt đầu
    if (filters.startDate) {
      query = query.gte("transaction_date", filters.startDate);
    }

    // Lọc theo ngày kết thúc
    if (filters.endDate) {
      query = query.lte("transaction_date", filters.endDate);
    }

    // Lọc theo mảng kinh doanh
    if (filters.businessUnitId) {
      query = query.eq("business_unit_id", filters.businessUnitId);
    }

    // Lọc theo loại giao dịch (income / expense)
    if (filters.transactionType) {
      query = query.eq("transaction_type", filters.transactionType);
    }

    // Lọc theo danh mục
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    // Lọc theo hình thức thanh toán
    if (filters.paymentMethod) {
      query = query.eq("payment_method", filters.paymentMethod);
    }

    // Tìm kiếm theo diễn giải hoặc mã chứng từ
    if (filters.search && filters.search.trim() !== "") {
      const kw = filters.search.trim();
      query = query.or(`description.ilike.%${kw}%,reference_no.ilike.%${kw}%`);
    }

    // Sắp xếp: ngày giao dịch giảm dần, sau đó id giảm dần
    query = query
      .order("transaction_date", { ascending: false })
      .order("id", { ascending: false });

    // Giới hạn bản ghi nếu có
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Lỗi khi tải danh sách giao dịch:", error);
      throw error;
    }
    return data || [];
  },

  // 5. TẠO GIAO DỊCH MỚI
  async createTransaction(transactionData) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    // Client-side validation nghiêm ngặt
    if (!transactionData.transaction_date) {
      throw new Error("Ngày giao dịch không được để trống.");
    }
    if (!transactionData.business_unit_id) {
      throw new Error("Vui lòng chọn mảng hoạt động.");
    }
    if (!transactionData.transaction_type || !["income", "expense"].includes(transactionData.transaction_type)) {
      throw new Error("Loại giao dịch phải là Thu hoặc Chi.");
    }
    const numAmount = Number(transactionData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Số tiền phải lớn hơn 0.");
    }
    if (!transactionData.payment_method) {
      throw new Error("Vui lòng chọn hình thức thanh toán.");
    }

    const payload = {
      transaction_date: transactionData.transaction_date,
      business_unit_id: Number(transactionData.business_unit_id),
      category_id: transactionData.category_id ? Number(transactionData.category_id) : null,
      cash_account_id: transactionData.cash_account_id ? Number(transactionData.cash_account_id) : null,
      transaction_type: transactionData.transaction_type,
      amount: numAmount,
      payment_method: transactionData.payment_method,
      description: transactionData.description ? transactionData.description.trim() : null,
      reference_no: transactionData.reference_no ? transactionData.reference_no.trim() : null
    };

    const { data, error } = await client
      .from("transactions")
      .insert([payload])
      .select(`
        id,
        transaction_date,
        business_unit_id,
        category_id,
        cash_account_id,
        transaction_type,
        amount,
        payment_method,
        description,
        reference_no,
        created_at,
        business_units ( id, code, name ),
        categories ( id, name ),
        cash_accounts ( id, name )
      `);

    if (error) {
      console.error("Lỗi khi tạo giao dịch:", error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  },

  // 6. CẬP NHẬT GIAO DỊCH
  async updateTransaction(id, transactionData) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    const numAmount = Number(transactionData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error("Số tiền phải lớn hơn 0.");
    }

    const payload = {
      transaction_date: transactionData.transaction_date,
      business_unit_id: Number(transactionData.business_unit_id),
      category_id: transactionData.category_id ? Number(transactionData.category_id) : null,
      cash_account_id: transactionData.cash_account_id ? Number(transactionData.cash_account_id) : null,
      transaction_type: transactionData.transaction_type,
      amount: numAmount,
      payment_method: transactionData.payment_method,
      description: transactionData.description ? transactionData.description.trim() : null,
      reference_no: transactionData.reference_no ? transactionData.reference_no.trim() : null
    };

    const { data, error } = await client
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .select(`
        id,
        transaction_date,
        business_unit_id,
        category_id,
        cash_account_id,
        transaction_type,
        amount,
        payment_method,
        description,
        reference_no,
        updated_at,
        business_units ( id, code, name ),
        categories ( id, name ),
        cash_accounts ( id, name )
      `);

    if (error) {
      console.error("Lỗi khi cập nhật giao dịch:", error);
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  },

  // 7. XÓA GIAO DỊCH
  async deleteTransaction(id) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    const { error } = await client
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Lỗi khi xóa giao dịch:", error);
      throw error;
    }

    return true;
  }
};

window.TransactionService = TransactionService;
