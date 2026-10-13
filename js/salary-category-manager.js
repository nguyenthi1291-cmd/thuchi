// ============================================================
// SALARY CATEGORY MANAGER SERVICE (SUPABASE INTERFACE)
// Quản lý danh mục chi phí lương & chuyển khoản (salary_expense_categories)
// ============================================================

const SalaryCategoryService = {
  // 1. LẤY DANH SÁCH DÃNH MỤC LƯƠNG & CK
  async getCategories() {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");
    const { data, error } = await client
      .from("salary_expense_categories")
      .select(`id, expense_category_code, label`)
      .order("expense_category_code", { ascending: true });
    if (error) {
      console.error("Lỗi khi tải danh mục lương & CK:", error);
      throw error;
    }
    return data || [];
  },

  // 2. TẠO DỮ LIỆU MỚI
  async createCategory(payload) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");
    const { data, error } = await client
      .from("salary_expense_categories")
      .insert([payload])
      .select(`id, expense_category_code, label`)
      .single();
    if (error) {
      console.error("Lỗi khi tạo danh mục lương & CK:", error);
      throw error;
    }
    return data;
  },

  // 3. CẬP NHẬT DỮ LIỆU
  async updateCategory(id, payload) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");
    const { data, error } = await client
      .from("salary_expense_categories")
      .update(payload)
      .eq("id", id)
      .select(`id, expense_category_code, label`)
      .single();
    if (error) {
      console.error("Lỗi khi cập nhật danh mục lương & CK:", error);
      throw error;
    }
    return data;
  },

  // 4. XÓA DỮ LIỆU
  async deleteCategory(id) {
    const client = window.SupabaseConfig.getClient();
    if (!client) throw new Error("Chưa kết nối Supabase");
    const { error } = await client
      .from("salary_expense_categories")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Lỗi khi xóa danh mục lương & CK:", error);
      throw error;
    }
    return true;
  }
};

window.SalaryCategoryService = SalaryCategoryService;
