// ============================================================
// SYSTEM & USER MANAGEMENT SERVICE
// Quản lý người dùng, vai trò & phân quyền (truy cập trang, thêm, sửa, xóa, import)
// ============================================================

(function () {
  "use strict";

  const SystemService = {
    // Cache profile của user đang đăng nhập
    myProfile: null,

    // Danh sách vai trò và tên hiển thị
    ROLES: {
      admin: { name: "Quản trị viên (Admin)", color: "#dc2626", badge: "badge-danger" },
      manager: { name: "Quản lý (Manager)", color: "#2563eb", badge: "badge-primary" },
      accountant: { name: "Kế toán (Accountant)", color: "#059669", badge: "badge-success" },
      staff: { name: "Nhân viên (Staff)", color: "#64748b", badge: "badge-neutral" }
    },

    // 1. LẤY HỒ SƠ & PHÂN QUYỀN CỦA CHÍNH USER ĐANG ĐĂNG NHẬP
    async getMyProfile() {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const user = window.AuthManager.currentUser;
      if (!user) return null;

      try {
        const { data, error } = await client
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Không thể tải user_profile:", error);
          // Fallback mặc định nếu bảng user_profiles chưa tạo hoặc chưa chạy migration
          this.myProfile = this.createDefaultFallbackProfile(user);
          return this.myProfile;
        }

        if (!data) {
          // Nếu user đã có trong auth nhưng chưa có trong user_profiles (do tạo trước khi có trigger)
          // Tự động khởi tạo profile mặc định
          const newProfile = await this.autoCreateProfileForUser(user);
          this.myProfile = newProfile;
          return this.myProfile;
        }

        this.myProfile = data;
        return this.myProfile;
      } catch (err) {
        console.warn("Lỗi getMyProfile, dùng quyền mặc định:", err);
        this.myProfile = this.createDefaultFallbackProfile(user);
        return this.myProfile;
      }
    },

    // Tự động chèn hồ sơ nếu user đã đăng ký trước khi tạo bảng
    async autoCreateProfileForUser(user) {
      const client = window.SupabaseConfig.getClient();
      if (!client) return this.createDefaultFallbackProfile(user);

      // Kiểm tra xem bảng đã có user nào chưa
      let isFirst = false;
      try {
        const { count, error } = await client
          .from("user_profiles")
          .select("id", { count: "exact", head: true });
        if (!error && (count === 0 || count === null)) {
          isFirst = true;
        }
      } catch (e) {
        // bỏ qua
      }

      const role = isFirst ? "admin" : "staff";
      const payload = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split("@")[0],
        role: role,
        can_access_transactions: true,
        can_access_fnb: true,
        can_access_salary_bank: isFirst,
        can_access_system: isFirst,
        can_create: true,
        can_edit: isFirst,
        can_delete: isFirst,
        can_import: isFirst,
        is_active: true
      };

      try {
        const { data, error } = await client
          .from("user_profiles")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Không thể insert profile tự động:", err);
        return payload;
      }
    },

    // Fallback profile an toàn
    createDefaultFallbackProfile(user) {
      return {
        id: user?.id,
        email: user?.email,
        full_name: user?.email ? user.email.split("@")[0] : "Người dùng",
        role: "admin", // Fallback cho user đầu tiên để không bị lock quyền
        can_access_transactions: true,
        can_access_fnb: true,
        can_access_salary_bank: true,
        can_access_system: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        can_import: true,
        is_active: true
      };
    },

    // 2. TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI BỞI ADMIN
    async createUserByAdmin(userData) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      if (!userData.email || !userData.email.includes("@")) {
        throw new Error("Email người dùng không hợp lệ.");
      }
      if (!userData.password || userData.password.length < 6) {
        throw new Error("Mật khẩu phải có tối thiểu 6 ký tự.");
      }

      // Cách 1: Gọi hàm RPC create_user_by_admin (chạy bằng pgcrypto, không làm mất session của admin)
      try {
        const { data, error } = await client.rpc("create_user_by_admin", {
          p_email: userData.email.trim(),
          p_password: userData.password,
          p_full_name: userData.full_name ? userData.full_name.trim() : null,
          p_role: userData.role || "staff",
          p_can_access_transactions: userData.can_access_transactions !== false,
          p_can_access_fnb: userData.can_access_fnb !== false,
          p_can_access_salary_bank: !!userData.can_access_salary_bank,
          p_can_access_system: !!userData.can_access_system,
          p_can_create: userData.can_create !== false,
          p_can_edit: !!userData.can_edit,
          p_can_delete: !!userData.can_delete,
          p_can_import: !!userData.can_import,
          p_notes: userData.notes ? userData.notes.trim() : null
        });

        if (!error && data) {
          return data;
        }

        // Nếu gặp lỗi từ RPC, ghi nhận và thử fallback nếu RPC chưa được tạo trong CSDL
        console.warn("RPC create_user_by_admin chưa sẵn sàng hoặc lỗi:", error);
        if (error && error.message && !error.message.includes("does not exist") && !error.message.includes("not found")) {
          throw new Error(error.message);
        }
      } catch (err) {
        if (!err.message.includes("does not exist") && !err.message.includes("not found")) {
          throw err;
        }
      }

      // Cách 2 Fallback: Sử dụng client tạm thời riêng biệt để đăng ký qua Auth và chèn user_profiles
      const tempClient = supabase.createClient(
        window.SupabaseConfig.CONFIG.url,
        window.SupabaseConfig.getStoredAnonKey(),
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name ? userData.full_name.trim() : userData.email.split("@")[0]
          }
        }
      });

      if (authError) {
        throw new Error("Lỗi khi tạo tài khoản: " + authError.message);
      }

      if (authData.user) {
        const profilePayload = {
          id: authData.user.id,
          email: userData.email.trim().toLowerCase(),
          full_name: userData.full_name ? userData.full_name.trim() : userData.email.split("@")[0],
          role: userData.role || "staff",
          can_access_transactions: userData.can_access_transactions !== false,
          can_access_fnb: userData.can_access_fnb !== false,
          can_access_salary_bank: !!userData.can_access_salary_bank,
          can_access_system: !!userData.can_access_system,
          can_create: userData.can_create !== false,
          can_edit: !!userData.can_edit,
          can_delete: !!userData.can_delete,
          can_import: !!userData.can_import,
          is_active: true,
          notes: userData.notes ? userData.notes.trim() : null
        };

        await client
          .from("user_profiles")
          .upsert([profilePayload]);
      }

      return {
        success: true,
        email: userData.email,
        message: "Đã tạo tài khoản thành công!"
      };
    },

    // 3. LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG (DÀNH CHO ADMIN)
    async getAllUsers() {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
        throw error;
      }
      return data || [];
    },

    // 4. CẬP NHẬT PHÂN QUYỀN & THÔNG TIN NGƯỜI DÙNG
    async updateUserProfile(userId, updateData) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const payload = {
        full_name: updateData.full_name ? updateData.full_name.trim() : null,
        role: updateData.role || "staff",
        can_access_transactions: !!updateData.can_access_transactions,
        can_access_fnb: !!updateData.can_access_fnb,
        can_access_salary_bank: !!updateData.can_access_salary_bank,
        can_access_system: !!updateData.can_access_system,
        can_create: !!updateData.can_create,
        can_edit: !!updateData.can_edit,
        can_delete: !!updateData.can_delete,
        can_import: !!updateData.can_import,
        is_active: updateData.is_active !== false,
        notes: updateData.notes ? updateData.notes.trim() : null
      };

      const { data, error } = await client
        .from("user_profiles")
        .update(payload)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Lỗi khi cập nhật profile người dùng:", error);
        throw error;
      }

      // Nếu đang sửa chính mình thì cập nhật cache
      if (this.myProfile && this.myProfile.id === userId) {
        this.myProfile = data;
      }

      return data;
    },

    // 4. XÓA NGƯỜI DÙNG (CHỈ ADMIN)
    async deleteUserProfile(userId) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const current = window.AuthManager.currentUser;
      if (current && current.id === userId) {
        throw new Error("Không thể tự xóa chính tài khoản bạn đang đăng nhập!");
      }

      const { error } = await client
        .from("user_profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        throw error;
      }
      return true;
    },

    // 5. CÁC HÀM TIỆN ÍCH KIỂM TRA QUYỀN (PERMISSION CHECKS)
    isAdmin() {
      return this.myProfile?.role === "admin";
    },

    canAccess(pageKey) {
      if (!this.myProfile) return true;
      if (this.myProfile.role === "admin") return true;

      switch (pageKey) {
        case "transactions":
          return !!this.myProfile.can_access_transactions;
        case "fnb":
          return !!this.myProfile.can_access_fnb;
        case "salary_bank":
          return !!this.myProfile.can_access_salary_bank;
        case "report":
          return !!this.myProfile.can_access_transactions || !!this.myProfile.can_access_salary_bank;
        case "system":
          return !!this.myProfile.can_access_system;
        default:
          return true;
      }
    },

    canCreate() {
      if (!this.myProfile) return true;
      if (this.myProfile.role === "admin") return true;
      return !!this.myProfile.can_create;
    },

    canEdit() {
      if (!this.myProfile) return true;
      if (this.myProfile.role === "admin") return true;
      return !!this.myProfile.can_edit;
    },

    canDelete() {
      if (!this.myProfile) return true;
      if (this.myProfile.role === "admin") return true;
      return !!this.myProfile.can_delete;
    },

    canImport() {
      if (!this.myProfile) return true;
      if (this.myProfile.role === "admin") return true;
      return !!this.myProfile.can_import;
    }
  };

  window.SystemService = SystemService;
})();
