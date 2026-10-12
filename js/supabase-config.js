// ============================================================
// CẤU HÌNH SUPABASE (SUPABASE CONFIGURATION)
// Dự án: Quản lý Thu Chi (Sơn Mài - F&B - Văn phòng)
// ============================================================

const SUPABASE_CONFIG = {
  // Project URL từ Supabase Dashboard
  url: "https://wszzjfkkswuilksznlme.supabase.co",

  // Supabase Anon (Publishable) Key
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzenpqZmtrc3d1aWxrc3pubG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NTM0MTIsImV4cCI6MjEwNzMyOTQxMn0.roxEJLSGjEJJp3JzaX7uX3mOi6lbiwJ7q-qLUzpIJfg"
};

// Khởi tạo Supabase Client
let _supabaseClient = null;

function getStoredAnonKey() {
  if (SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey.trim() !== "") {
    return SUPABASE_CONFIG.anonKey.trim();
  }
  return localStorage.getItem("quanlythuchi_supabase_anon_key") || "";
}

function saveStoredAnonKey(key) {
  if (!key || !key.trim()) return;
  localStorage.setItem("quanlythuchi_supabase_anon_key", key.trim());
  _supabaseClient = null; // Reset để tạo client mới với key vừa lưu
}

function clearStoredAnonKey() {
  localStorage.removeItem("quanlythuchi_supabase_anon_key");
  _supabaseClient = null;
}

function isSupabaseConfigured() {
  const key = getStoredAnonKey();
  return Boolean(SUPABASE_CONFIG.url && key && key.length > 20);
}

function initSupabase() {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  const anonKey = getStoredAnonKey();

  if (!SUPABASE_CONFIG.url || !anonKey) {
    return null;
  }

  if (typeof supabase === "undefined" || !supabase.createClient) {
    console.error("Thư viện Supabase JS chưa được tải!");
    return null;
  }

  _supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  return _supabaseClient;
}

window.SupabaseConfig = {
  CONFIG: SUPABASE_CONFIG,
  getStoredAnonKey,
  saveStoredAnonKey,
  clearStoredAnonKey,
  isSupabaseConfigured,
  initSupabase,
  getClient: () => _supabaseClient || initSupabase()
};
