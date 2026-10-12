// ============================================================
// F&B SALES RECONCILIATION SERVICE
// Đối soát doanh thu bán hàng F&B: KiotViet vs (Tiền mặt + MB Bank)
// ============================================================

const FnbReconciliationService = {
  // 1. LẤY DANH SÁCH ĐỐI SOÁT VỚI BỘ LỌC
  async getReconciliations(filters = {}) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    let query = client
      .from("fnb_sales_reconciliations")
      .select("*");

    if (filters.startDate) {
      query = query.gte("reconciliation_date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("reconciliation_date", filters.endDate);
    }

    if (filters.search && filters.search.trim() !== "") {
      const kw = filters.search.trim();
      query = query.or(`discrepancy_reason.ilike.%${kw}%,notes.ilike.%${kw}%`);
    }

    // Sắp xếp ngày đối soát mới nhất trước
    query = query.order("reconciliation_date", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Lỗi khi tải dữ liệu đối soát F&B:", error);
      throw error;
    }

    let results = data || [];

    // Lọc theo trạng thái chênh lệch trên client
    if (filters.status === "matched") {
      results = results.filter(r => Number(r.difference) === 0);
    } else if (filters.status === "discrepant") {
      results = results.filter(r => Number(r.difference) !== 0);
    } else if (filters.status === "surplus") {
      results = results.filter(r => Number(r.difference) > 0);
    } else if (filters.status === "deficit") {
      results = results.filter(r => Number(r.difference) < 0);
    }

    return results;
  },

  // 2. TÌM BẢN GHI ĐỐI SOÁT THEO NGÀY
  async getByDate(dateStr) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    const { data, error } = await client
      .from("fnb_sales_reconciliations")
      .select("*")
      .eq("reconciliation_date", dateStr)
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi tìm đối soát theo ngày:", error);
      throw error;
    }
    return data;
  },

  // 3. LƯU HOẶC CẬP NHẬT ĐỐI SOÁT
  async saveReconciliation(formData) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    if (!formData.reconciliation_date) {
      throw new Error("Ngày đối soát không được để trống.");
    }

    const kiotviet = Number(formData.kiotviet_revenue) || 0;
    const cash = Number(formData.cash_amount) || 0;
    const mbBank = Number(formData.mb_bank_amount) || 0;

    if (kiotviet < 0 || cash < 0 || mbBank < 0) {
      throw new Error("Số tiền không được là số âm.");
    }

    const totalCollected = cash + mbBank;
    const diff = totalCollected - kiotviet;

    // Nếu có chênh lệch, khuyến khích/yêu cầu lý do
    if (diff !== 0 && (!formData.discrepancy_reason || formData.discrepancy_reason.trim() === "")) {
      throw new Error("Phát hiện chênh lệch thu tiền! Vui lòng nhập lý do giải thích cụ thể.");
    }

    const payload = {
      reconciliation_date: formData.reconciliation_date,
      kiotviet_revenue: kiotviet,
      cash_amount: cash,
      mb_bank_amount: mbBank,
      discrepancy_reason: formData.discrepancy_reason ? formData.discrepancy_reason.trim() : null,
      notes: formData.notes ? formData.notes.trim() : null
    };

    let result;
    if (formData.id) {
      // Cập nhật bản ghi có sẵn
      const { data, error } = await client
        .from("fnb_sales_reconciliations")
        .update(payload)
        .eq("id", formData.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Thêm mới hoặc Upsert theo ngày & user
      const { data, error } = await client
        .from("fnb_sales_reconciliations")
        .upsert(payload, { onConflict: "reconciliation_date,created_by" })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  },

  // 4. XÓA BẢN GHI ĐỐI SOÁT
  async deleteReconciliation(id) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");

    const { error } = await client
      .from("fnb_sales_reconciliations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Lỗi khi xóa đối soát F&B:", error);
      throw error;
    }
    return true;
  },

  // 5. TÍNH TOÁN CHỈ SỐ THỐNG KÊ ĐỐI SOÁT
  calculateSummary(records = []) {
    let totalKiotviet = 0;
    let totalCash = 0;
    let totalMb = 0;
    let countMatched = 0;
    let countDiscrepant = 0;

    records.forEach(r => {
      const kv = Number(r.kiotviet_revenue) || 0;
      const c = Number(r.cash_amount) || 0;
      const mb = Number(r.mb_bank_amount) || 0;
      const diff = (c + mb) - kv;

      totalKiotviet += kv;
      totalCash += c;
      totalMb += mb;

      if (diff === 0) {
        countMatched += 1;
      } else {
        countDiscrepant += 1;
      }
    });

    const totalCollected = totalCash + totalMb;
    const totalDifference = totalCollected - totalKiotviet;

    return {
      totalKiotviet,
      totalCash,
      totalMb,
      totalCollected,
      totalDifference,
      count: records.length,
      countMatched,
      countDiscrepant
    };
  }
};

window.FnbReconciliationService = FnbReconciliationService;
