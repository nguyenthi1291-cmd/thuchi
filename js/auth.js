// ============================================================
// AUTHENTICATION MODULE (SUPABASE AUTH)
// Quản lý đăng ký, đăng nhập, đăng xuất, phiên làm việc
// ============================================================

const AuthManager = {
  currentUser: null,
  currentSession: null,

  async getSession() {
    const client = window.SupabaseConfig.getClient();
    if (!client) return null;

    try {
      const { data, error } = await client.auth.getSession();
      if (error) {
        console.error("Lỗi getSession:", error);
        return null;
      }
      this.currentSession = data.session;
      this.currentUser = data.session ? data.session.user : null;
      return this.currentSession;
    } catch (err) {
      console.error("Lỗi khi kiểm tra phiên đăng nhập:", err);
      return null;
    }
  },

  // Chuẩn hóa tên đăng nhập hoặc email
  normalizeIdentifier(input) {
    if (!input) return "";
    const trimmed = input.trim().toLowerCase();
    if (trimmed.includes("@")) return trimmed;
    // Tên đăng nhập không chứa @ -> tự động định danh bằng domain nội bộ
    const safe = trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9._-]/g, "");
    return `${safe || "user"}@internal.local`;
  },

  async signUp(identifier, password) {
    const client = window.SupabaseConfig.getClient();
    if (!client) {
      throw new Error("Chưa cấu hình Supabase Anon Key. Vui lòng kiểm tra cấu hình.");
    }

    const email = this.normalizeIdentifier(identifier);

    const { data, error } = await client.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      throw new Error(this.translateAuthError(error.message));
    }

    // Kiểm tra xem Supabase có yêu cầu xác nhận qua email hay không
    if (data.user && !data.session) {
      return {
        user: data.user,
        requiresEmailConfirmation: true,
        message: "Đăng ký tài khoản thành công! Một email xác nhận đã được gửi đến " + email + ". Vui lòng kiểm tra hộp thư (cả mục Spam/Junk) và xác nhận trước khi đăng nhập."
      };
    }

    this.currentUser = data.user;
    this.currentSession = data.session;
    return {
      user: data.user,
      session: data.session,
      requiresEmailConfirmation: false,
      message: "Đăng ký thành công và đã tự động đăng nhập!"
    };
  },

  async signIn(identifier, password) {
    const client = window.SupabaseConfig.getClient();
    if (!client) {
      throw new Error("Chưa cấu hình Supabase Anon Key. Vui lòng kiểm tra cấu hình.");
    }

    const email = this.normalizeIdentifier(identifier);

    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      throw new Error(this.translateAuthError(error.message));
    }

    this.currentUser = data.user;
    this.currentSession = data.session;
    return data;
  },

  async signOut() {
    const client = window.SupabaseConfig.getClient();
    if (client) {
      await client.auth.signOut();
    }
    this.currentUser = null;
    this.currentSession = null;
  },

  listenAuthState(onChangeCallback) {
    const client = window.SupabaseConfig.getClient();
    if (!client) return null;

    return client.auth.onAuthStateChange((event, session) => {
      this.currentSession = session;
      this.currentUser = session ? session.user : null;
      if (typeof onChangeCallback === "function") {
        onChangeCallback(event, session);
      }
    });
  },

  translateAuthError(msg) {
    if (!msg) return "Đã xảy ra lỗi xác thực, vui lòng thử lại.";
    const lower = msg.toLowerCase();
    if (lower.includes("invalid login credentials")) {
      return "Email hoặc mật khẩu không chính xác.";
    }
    if (lower.includes("email not confirmed")) {
      return "Tài khoản chưa được kích hoạt qua email. Vui lòng kiểm tra hộp thư của bạn.";
    }
    if (lower.includes("user already registered")) {
      return "Email này đã được đăng ký tài khoản trong hệ thống.";
    }
    if (lower.includes("password should be at least")) {
      return "Mật khẩu phải có tối thiểu 6 ký tự.";
    }
    if (lower.includes("rate limit")) {
      return "Gửi yêu cầu quá nhanh. Vui lòng chờ giây lát rồi thử lại.";
    }
    return msg;
  }
};

window.AuthManager = AuthManager;
