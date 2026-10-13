// ============================================================
// APP CONTROLLER (MAIN APPLICATION LOGIC)
// Điều phối tương tác giao diện, sự kiện, Modal, Filter & Toasts
// ============================================================

(function () {
  "use strict";

  // Application State
  const AppState = {
    businessUnits: [],
    categories: [],
    cashAccounts: [],
    currentTransactions: [],
    editingTransactionId: null,
    currentFnbReconciliations: [],
    editingFnbRecId: null,
    currentSalaryBankExpenses: [],
    salaryCategories: [],
    editingSalaryCategoryCode: null,
    editingSalaryBankExpenseId: null,
    allUsers: []
  };

  // DOM Elements
  const DOM = {
    // Nav Tabs & Views
    mainNavTabs: document.getElementById("main-nav-tabs"),
    navBtnTransactions: document.getElementById("nav-btn-transactions"),
    navBtnFnbRec: document.getElementById("nav-btn-fnb-rec"),
    navBtnSalaryBank: document.getElementById("nav-btn-salary-bank"),
    navBtnReport: document.getElementById("nav-btn-report"),
    navBtnSystem: document.getElementById("nav-btn-system"),
    viewTransactions: document.getElementById("view-transactions"),
    viewFnbRec: document.getElementById("view-fnb-reconciliation"),
    viewSalaryBank: document.getElementById("view-salary-bank"),
    viewReport: document.getElementById("view-report"),
    viewSystem: document.getElementById("view-system"),
    // Salary Categories view & controls
    navBtnSalaryCategories: document.getElementById("nav-btn-salary-categories"),
    viewSalaryCategories: document.getElementById("view-salary-categories"),
    btnAddSalaryCategory: document.getElementById("btn-add-salary-category"),
    salaryCategoryTbody: document.getElementById("salary-category-tbody"),
    modalSalaryCategory: document.getElementById("modal-salary-category"),
    closeSalaryCategoryModal: document.getElementById("close-salary-category-modal"),
    formSalaryCategory: document.getElementById("form-salary-category"),
    inputCategoryCode: document.getElementById("sb-category-code"),
    inputCategoryLabel: document.getElementById("sb-category-label"),
    btnSaveSalaryCategory: document.getElementById("btn-save-salary-category"),
    modalSalaryCategoryTitle: document.getElementById("modal-salary-category-title"),

    // Config
    configAlertBanner: document.getElementById("config-alert-banner"),
    btnOpenConfigBanner: document.getElementById("btn-open-config-banner"),
    btnConfig: document.getElementById("btn-config"),
    modalConfig: document.getElementById("modal-config"),
    configAnonKey: document.getElementById("config-anon-key"),
    btnSaveConfig: document.getElementById("btn-save-config"),

    // Auth
    authSection: document.getElementById("auth-section"),
    tabLogin: document.getElementById("tab-login"),
    tabRegister: document.getElementById("tab-register"),
    formLogin: document.getElementById("form-login"),
    formRegister: document.getElementById("form-register"),
    btnSubmitLogin: document.getElementById("btn-submit-login"),
    btnSubmitRegister: document.getElementById("btn-submit-register"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    regEmail: document.getElementById("reg-email"),
    regPassword: document.getElementById("reg-password"),
    authMsgBox: document.getElementById("auth-message-box"),

    // Header & User
    userInfoArea: document.getElementById("user-info-area"),
    userEmailDisplay: document.getElementById("user-email-display"),
    btnLogout: document.getElementById("btn-logout"),

    // Main App
    appSection: document.getElementById("app-section"),

    // Filters (Transactions)
    filterStartDate: document.getElementById("filter-start-date"),
    filterEndDate: document.getElementById("filter-end-date"),
    filterUnit: document.getElementById("filter-unit"),
    filterType: document.getElementById("filter-type"),
    filterCategory: document.getElementById("filter-category"),
    filterPayment: document.getElementById("filter-payment"),
    filterSearch: document.getElementById("filter-search"),
    btnApplyFilter: document.getElementById("btn-apply-filter"),
    btnResetFilter: document.getElementById("btn-reset-filter"),
    presetBtns: document.querySelectorAll(".preset-btn:not(.fnb-preset-btn)"),

    // Table (Transactions)
    tableWrapper: document.getElementById("table-wrapper"),
    tableLoading: document.getElementById("table-loading"),
    tableEmpty: document.getElementById("table-empty"),
    transactionTbody: document.getElementById("transaction-tbody"),
    btnAddTransaction: document.getElementById("btn-add-transaction"),

    // Transaction Modal
    modalTransaction: document.getElementById("modal-transaction"),
    modalTransactionTitle: document.getElementById("modal-transaction-title"),
    formTransaction: document.getElementById("form-transaction"),
    txId: document.getElementById("tx-id"),
    txDate: document.getElementById("tx-date"),
    txUnit: document.getElementById("tx-unit"),
    txType: document.getElementById("tx-type"),
    btnTypeIncome: document.getElementById("btn-type-income"),
    btnTypeExpense: document.getElementById("btn-type-expense"),
    txCategory: document.getElementById("tx-category"),
    txAmount: document.getElementById("tx-amount"),
    amountPreview: document.getElementById("amount-preview"),
    txPayment: document.getElementById("tx-payment"),
    txDescription: document.getElementById("tx-description"),
    txReference: document.getElementById("tx-reference"),
    btnSaveTx: document.getElementById("btn-save-tx"),

    // Delete Modal (Transactions)
    modalDelete: document.getElementById("modal-delete"),
    deleteTargetId: document.getElementById("delete-target-id"),
    btnConfirmDelete: document.getElementById("btn-confirm-delete"),

    // ================= F&B RECONCILIATION DOM =================
    // Inline Form directly on page
    inlineFormCard: document.getElementById("inline-form-card"),
    inlineRecFormTitle: document.getElementById("inline-rec-form-title"),
    inlineRecBadgeMode: document.getElementById("inline-rec-badge-mode"),
    btnInlineResetForm: document.getElementById("btn-inline-reset-form"),
    formInlineFnbRec: document.getElementById("form-inline-fnb-rec"),
    inlineRecId: document.getElementById("inline-rec-id"),
    inlineRecDate: document.getElementById("inline-rec-date"),
    inlineDateHint: document.getElementById("inline-date-hint"),
    inlineRecKiotviet: document.getElementById("inline-rec-kiotviet"),
    inlineRecPreviewKiotviet: document.getElementById("inline-rec-preview-kiotviet"),
    inlineRecCash: document.getElementById("inline-rec-cash"),
    inlineRecPreviewCash: document.getElementById("inline-rec-preview-cash"),
    inlineRecMb: document.getElementById("inline-rec-mb"),
    inlineRecPreviewMb: document.getElementById("inline-rec-preview-mb"),
    inlineRecCalcKiotviet: document.getElementById("inline-rec-calc-kiotviet"),
    inlineRecCalcCollected: document.getElementById("inline-rec-calc-collected"),
    inlineRecCalcDiff: document.getElementById("inline-rec-calc-diff"),
    inlineRecCalcBadge: document.getElementById("inline-rec-calc-badge"),
    inlineRecDiffWarning: document.getElementById("inline-rec-diff-warning"),
    inlineRecReason: document.getElementById("inline-rec-reason"),
    inlineRecReasonRequiredMark: document.getElementById("inline-rec-reason-required-mark"),
    inlineRecNotes: document.getElementById("inline-rec-notes"),
    btnSaveInlineFnbRec: document.getElementById("btn-save-inline-fnb-rec"),

    // KPI & Filters
    fnbKpiKiotviet: document.getElementById("fnb-kpi-kiotviet"),
    fnbKpiCash: document.getElementById("fnb-kpi-cash"),
    fnbKpiMb: document.getElementById("fnb-kpi-mb"),
    fnbKpiDiff: document.getElementById("fnb-kpi-diff"),
    fnbKpiDiffBadge: document.getElementById("fnb-kpi-diff-badge"),
    fnbKpiTotalCollected: document.getElementById("fnb-kpi-total-collected"),

    fnbFilterStartDate: document.getElementById("fnb-filter-start-date"),
    fnbFilterEndDate: document.getElementById("fnb-filter-end-date"),
    fnbFilterStatus: document.getElementById("fnb-filter-status"),
    fnbFilterSearch: document.getElementById("fnb-filter-search"),
    btnFnbApplyFilter: document.getElementById("btn-fnb-apply-filter"),
    btnFnbResetFilter: document.getElementById("btn-fnb-reset-filter"),
    fnbPresetBtns: document.querySelectorAll(".fnb-preset-btn"),

    fnbTableWrapper: document.getElementById("fnb-table-wrapper"),
    fnbTableLoading: document.getElementById("fnb-table-loading"),
    fnbTableEmpty: document.getElementById("fnb-table-empty"),
    fnbRecTbody: document.getElementById("fnb-rec-tbody"),
    btnAddFnbRec: document.getElementById("btn-add-fnb-rec"),

    // F&B Modal (optional secondary)
    modalFnbRec: document.getElementById("modal-fnb-rec"),
    modalFnbRecTitle: document.getElementById("modal-fnb-rec-title"),
    formFnbRec: document.getElementById("form-fnb-rec"),
    recId: document.getElementById("rec-id"),
    recDate: document.getElementById("rec-date"),
    recKiotviet: document.getElementById("rec-kiotviet"),
    recPreviewKiotviet: document.getElementById("rec-preview-kiotviet"),
    recCash: document.getElementById("rec-cash"),
    recPreviewCash: document.getElementById("rec-preview-cash"),
    recMb: document.getElementById("rec-mb"),
    recPreviewMb: document.getElementById("rec-preview-mb"),
    recCalcKiotviet: document.getElementById("rec-calc-kiotviet"),
    recCalcCollected: document.getElementById("rec-calc-collected"),
    recCalcDiff: document.getElementById("rec-calc-diff"),
    recCalcBadge: document.getElementById("rec-calc-badge"),
    recDiffWarning: document.getElementById("rec-diff-warning"),
    recReason: document.getElementById("rec-reason"),
    recReasonRequiredMark: document.getElementById("rec-reason-required-mark"),
    recNotes: document.getElementById("rec-notes"),
    btnSaveFnbRec: document.getElementById("btn-save-fnb-rec"),

    modalFnbDelete: document.getElementById("modal-fnb-delete"),
    fnbDeleteTargetId: document.getElementById("fnb-delete-target-id"),
    btnConfirmFnbDelete: document.getElementById("btn-confirm-fnb-delete"),

    // ================= SALARY & BANK EXPENSES DOM =================
    inlineSbFormCard: document.getElementById("inline-sb-form-card"),
    inlineSbFormTitle: document.getElementById("inline-sb-form-title"),
    inlineSbBadgeMode: document.getElementById("inline-sb-badge-mode"),
    btnSbResetForm: document.getElementById("btn-sb-reset-form"),
    formInlineSalaryBank: document.getElementById("form-inline-salary-bank"),
    sbId: document.getElementById("sb-id"),
    sbDate: document.getElementById("sb-date"),
    sbUnit: document.getElementById("sb-unit"),
    btnSbTypeSalary: document.getElementById("btn-sb-type-salary"),
    btnSbTypeTransfer: document.getElementById("btn-sb-type-transfer"),
    sbType: document.getElementById("sb-type"),
    sbCategory: document.getElementById("sb-category"),
    sbRecipient: document.getElementById("sb-recipient"),
    sbAmount: document.getElementById("sb-amount"),
    sbAmountPreview: document.getElementById("sb-amount-preview"),
    sbSourceBank: document.getElementById("sb-source-bank"),
    sbRecipientBank: document.getElementById("sb-recipient-bank"),
    sbRecipientAccount: document.getElementById("sb-recipient-account"),
    sbRef: document.getElementById("sb-ref"),
    sbDesc: document.getElementById("sb-desc"),
    sbNotes: document.getElementById("sb-notes"),
    btnSaveSalaryBank: document.getElementById("btn-save-salary-bank"),
    btnAddSalaryBank: document.getElementById("btn-add-salary-bank"),

    // KPI & Filters (Salary & Bank)
    sbKpiTotal: document.getElementById("sb-kpi-total"),
    sbKpiSubStats: document.getElementById("sb-kpi-sub-stats"),
    sbKpiSonmai: document.getElementById("sb-kpi-sonmai"),
    sbKpiSonmaiCount: document.getElementById("sb-kpi-sonmai-count"),
    sbKpiFnb: document.getElementById("sb-kpi-fnb"),
    sbKpiFnbCount: document.getElementById("sb-kpi-fnb-count"),
    sbKpiVanphong: document.getElementById("sb-kpi-vanphong"),
    sbKpiVanphongCount: document.getElementById("sb-kpi-vanphong-count"),

    sbFilterStartDate: document.getElementById("sb-filter-start-date"),
    sbFilterEndDate: document.getElementById("sb-filter-end-date"),
    sbFilterUnit: document.getElementById("sb-filter-unit"),
    sbFilterType: document.getElementById("sb-filter-type"),
    sbFilterSearch: document.getElementById("sb-filter-search"),
    btnSbApplyFilter: document.getElementById("btn-sb-apply-filter"),
    btnSbResetFilter: document.getElementById("btn-sb-reset-filter"),
    sbPresetBtns: document.querySelectorAll(".sb-preset-btn"),

    sbTableWrapper: document.getElementById("sb-table-wrapper"),
    sbTableLoading: document.getElementById("sb-table-loading"),
    sbTableEmpty: document.getElementById("sb-table-empty"),
    sbTbody: document.getElementById("sb-tbody"),

    modalSbDelete: document.getElementById("modal-sb-delete"),
    sbDeleteTargetId: document.getElementById("sb-delete-target-id"),
    btnConfirmSbDelete: document.getElementById("btn-confirm-sb-delete"),

    // ================= EXCEL TEMPLATES & IMPORT DOM =================
    btnOpenExcelModal: document.getElementById("btn-open-excel-modal"),
    modalExcelImport: document.getElementById("modal-excel-import"),
    excelTargetType: document.getElementById("excel-target-type"),
    excelFileInput: document.getElementById("excel-file-input"),
    btnSubmitExcelImport: document.getElementById("btn-submit-excel-import"),
    excelPreviewBox: document.getElementById("excel-preview-box"),
    excelPreviewText: document.getElementById("excel-preview-text"),
    excelErrorBox: document.getElementById("excel-error-box"),
    excelErrorText: document.getElementById("excel-error-text"),
    btnTriggerImports: document.querySelectorAll(".btn-trigger-import"),

    // ================= SYSTEM & USER PERMISSIONS DOM =================
    myProfileRoleBadge: document.getElementById("my-profile-role-badge"),
    myProfileEmail: document.getElementById("my-profile-email"),
    myProfileName: document.getElementById("my-profile-name"),
    myPermissionsBadges: document.getElementById("my-permissions-badges"),

    sysKpiTotalUsers: document.getElementById("sys-kpi-total-users"),
    sysKpiAdminCount: document.getElementById("sys-kpi-admin-count"),
    sysKpiManagerCount: document.getElementById("sys-kpi-manager-count"),
    sysKpiActiveCount: document.getElementById("sys-kpi-active-count"),

    btnRefreshUsers: document.getElementById("btn-refresh-users"),
    btnAddUser: document.getElementById("btn-add-user"),
    sysTableLoading: document.getElementById("sys-table-loading"),
    sysTableEmpty: document.getElementById("sys-table-empty"),
    sysTableWrapper: document.getElementById("sys-table-wrapper"),
    sysUsersTbody: document.getElementById("sys-users-tbody"),

    // Modal Create User
    modalCreateUser: document.getElementById("modal-create-user"),
    formCreateUser: document.getElementById("form-create-user"),
    createUserEmail: document.getElementById("create-user-email"),
    createUserPassword: document.getElementById("create-user-password"),
    createUserName: document.getElementById("create-user-name"),
    createUserRole: document.getElementById("create-user-role"),
    createPermPageTx: document.getElementById("create-perm-page-tx"),
    createPermPageFnb: document.getElementById("create-perm-page-fnb"),
    createPermPageSb: document.getElementById("create-perm-page-sb"),
    createPermPageSys: document.getElementById("create-perm-page-sys"),
    createPermActionCreate: document.getElementById("create-perm-action-create"),
    createPermActionEdit: document.getElementById("create-perm-action-edit"),
    createPermActionDelete: document.getElementById("create-perm-action-delete"),
    createPermActionImport: document.getElementById("create-perm-action-import"),
    createUserNotes: document.getElementById("create-user-notes"),
    btnSubmitCreateUser: document.getElementById("btn-submit-create-user"),

    modalEditUser: document.getElementById("modal-edit-user"),
    modalEditUserTitle: document.getElementById("modal-edit-user-title"),
    formEditUser: document.getElementById("form-edit-user"),
    userEditId: document.getElementById("user-edit-id"),
    userEditEmail: document.getElementById("user-edit-email"),
    userEditName: document.getElementById("user-edit-name"),
    userEditRole: document.getElementById("user-edit-role"),
    userEditStatus: document.getElementById("user-edit-status"),
    userEditNotes: document.getElementById("user-edit-notes"),

    permPageTx: document.getElementById("perm-page-tx"),
    permPageFnb: document.getElementById("perm-page-fnb"),
    permPageSb: document.getElementById("perm-page-sb"),
    permPageSys: document.getElementById("perm-page-sys"),

    permActionCreate: document.getElementById("perm-action-create"),
    permActionEdit: document.getElementById("perm-action-edit"),
    permActionDelete: document.getElementById("perm-action-delete"),
    permActionImport: document.getElementById("perm-action-import"),
    btnSaveUserPerm: document.getElementById("btn-save-user-perm"),

    // ================= REPORT DOM =================
    btnRefreshReport: document.getElementById("btn-refresh-report"),
    btnExportReportExcel: document.getElementById("btn-export-report-excel"),
    btnPrintReport: document.getElementById("btn-print-report"),
    reportFilterStartDate: document.getElementById("report-filter-start-date"),
    reportFilterEndDate: document.getElementById("report-filter-end-date"),
    btnReportApplyFilter: document.getElementById("btn-report-apply-filter"),
    reportPresetBtns: document.querySelectorAll(".report-preset-btn"),
    reportLoading: document.getElementById("report-loading"),
    reportContentWrapper: document.getElementById("report-content-wrapper"),

    repGrandIncome: document.getElementById("rep-grand-income"),
    repGrandIncomeSub: document.getElementById("rep-grand-income-sub"),
    repGrandExpense: document.getElementById("rep-grand-expense"),
    repGrandExpenseSub: document.getElementById("rep-grand-expense-sub"),
    repGrandNet: document.getElementById("rep-grand-net"),
    repNetBadge: document.getElementById("rep-net-badge"),
    repFnbCollected: document.getElementById("rep-fnb-collected"),
    repFnbDiffStatus: document.getElementById("rep-fnb-diff-status"),

    repUnitSonmaiBadge: document.getElementById("rep-unit-sonmai-badge"),
    repUnitSonmaiIncome: document.getElementById("rep-unit-sonmai-income"),
    repUnitSonmaiTxExpense: document.getElementById("rep-unit-sonmai-tx-expense"),
    repUnitSonmaiSbExpense: document.getElementById("rep-unit-sonmai-sb-expense"),
    repUnitSonmaiTotalExpense: document.getElementById("rep-unit-sonmai-total-expense"),
    repUnitSonmaiNet: document.getElementById("rep-unit-sonmai-net"),

    repUnitFnbBadge: document.getElementById("rep-unit-fnb-badge"),
    repUnitFnbIncome: document.getElementById("rep-unit-fnb-income"),
    repUnitFnbTxExpense: document.getElementById("rep-unit-fnb-tx-expense"),
    repUnitFnbSbExpense: document.getElementById("rep-unit-fnb-sb-expense"),
    repUnitFnbTotalExpense: document.getElementById("rep-unit-fnb-total-expense"),
    repUnitFnbNet: document.getElementById("rep-unit-fnb-net"),

    repUnitVpBadge: document.getElementById("rep-unit-vp-badge"),
    repUnitVpIncome: document.getElementById("rep-unit-vp-income"),
    repUnitVpTxExpense: document.getElementById("rep-unit-vp-tx-expense"),
    repUnitVpSbExpense: document.getElementById("rep-unit-vp-sb-expense"),
    repUnitVpTotalExpense: document.getElementById("rep-unit-vp-total-expense"),
    repUnitVpNet: document.getElementById("rep-unit-vp-net"),

    repSrcTxCount: document.getElementById("rep-src-tx-count"),
    repSrcTxIncome: document.getElementById("rep-src-tx-income"),
    repSrcTxExpense: document.getElementById("rep-src-tx-expense"),
    repSrcFnbDays: document.getElementById("rep-src-fnb-days"),
    repSrcFnbCollected: document.getElementById("rep-src-fnb-collected"),
    repSrcFnbDiff: document.getElementById("rep-src-fnb-diff"),
    repSrcSbCount: document.getElementById("rep-src-sb-count"),
    repSrcSbSalary: document.getElementById("rep-src-sb-salary"),
    repSrcSbTransfer: document.getElementById("rep-src-sb-transfer"),

    repSbCategoryTbody: document.getElementById("rep-sb-category-tbody"),
    repTimelineBadge: document.getElementById("rep-timeline-badge"),
    repTimelineTbody: document.getElementById("rep-timeline-tbody"),

    // Toast Container
    toastContainer: document.getElementById("toast-container")
  };

  // ================= UTILITIES =================
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDateVN(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function openModal(modalEl) {
    if (modalEl) modalEl.classList.add("active");
  }

  function closeModal(modalEl) {
    if (modalEl) modalEl.classList.remove("active");
  }

  // ================= SUPABASE CONFIGURATION =================
  function checkSupabaseConfig() {
    const isConfigured = window.SupabaseConfig.isSupabaseConfigured();
    if (!isConfigured) {
      DOM.configAlertBanner.classList.remove("hidden");
    } else {
      DOM.configAlertBanner.classList.add("hidden");
    }
    return isConfigured;
  }

  function setupConfigEvents() {
    const openConfigHandler = () => {
      DOM.configAnonKey.value = window.SupabaseConfig.getStoredAnonKey();
      openModal(DOM.modalConfig);
    };

    DOM.btnOpenConfigBanner.addEventListener("click", openConfigHandler);
    DOM.btnConfig.addEventListener("click", openConfigHandler);

    DOM.btnSaveConfig.addEventListener("click", () => {
      const key = DOM.configAnonKey.value.trim();
      if (!key) {
        showToast("Vui lòng nhập Supabase Anon Key.", "warning");
        return;
      }

      window.SupabaseConfig.saveStoredAnonKey(key);
      const client = window.SupabaseConfig.initSupabase();

      if (client) {
        showToast("Đã lưu cấu hình Supabase Anon Key thành công!", "success");
        closeModal(DOM.modalConfig);
        checkSupabaseConfig();
        initAuthAndSession();
      } else {
        showToast("Không thể khởi tạo Supabase Client. Kiểm tra lại Anon Key.", "error");
      }
    });
  }

  // ================= AUTHENTICATION =================
  function setupAuthEvents() {
    // Chuyển tab Đăng nhập / Đăng ký
    DOM.tabLogin.addEventListener("click", () => {
      DOM.tabLogin.classList.add("active");
      DOM.tabRegister.classList.remove("active");
      DOM.formLogin.classList.remove("hidden");
      DOM.formRegister.classList.add("hidden");
      hideAuthMessage();
    });

    DOM.tabRegister.addEventListener("click", () => {
      DOM.tabRegister.classList.add("active");
      DOM.tabLogin.classList.remove("active");
      DOM.formRegister.classList.remove("hidden");
      DOM.formLogin.classList.add("hidden");
      hideAuthMessage();
    });

    // Submit Đăng nhập
    DOM.formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = DOM.loginEmail.value.trim();
      const password = DOM.loginPassword.value;

      if (!checkSupabaseConfig()) {
        showToast("Vui lòng cấu hình Supabase Anon Key trước khi đăng nhập.", "warning");
        openModal(DOM.modalConfig);
        return;
      }

      DOM.btnSubmitLogin.disabled = true;
      DOM.btnSubmitLogin.textContent = "Đang đăng nhập...";
      hideAuthMessage();

      try {
        await window.AuthManager.signIn(email, password);
        showToast("Đăng nhập thành công!", "success");
        DOM.loginPassword.value = "";
        await onUserSignedIn();
      } catch (err) {
        showAuthMessage(err.message, "error");
        showToast(err.message, "error");
      } finally {
        DOM.btnSubmitLogin.disabled = false;
        DOM.btnSubmitLogin.textContent = "Đăng nhập";
      }
    });

    // Submit Đăng ký
    DOM.formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = DOM.regEmail.value.trim();
      const password = DOM.regPassword.value;

      if (!checkSupabaseConfig()) {
        showToast("Vui lòng cấu hình Supabase Anon Key trước khi đăng ký.", "warning");
        openModal(DOM.modalConfig);
        return;
      }

      if (password.length < 6) {
        showAuthMessage("Mật khẩu phải có tối thiểu 6 ký tự.", "error");
        return;
      }

      DOM.btnSubmitRegister.disabled = true;
      DOM.btnSubmitRegister.textContent = "Đang tạo tài khoản...";
      hideAuthMessage();

      try {
        const result = await window.AuthManager.signUp(email, password);
        if (result.requiresEmailConfirmation) {
          showAuthMessage(result.message, "info");
          showToast("Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư!", "info");
        } else {
          showToast("Tạo tài khoản thành công!", "success");
          DOM.regPassword.value = "";
          await onUserSignedIn();
        }
      } catch (err) {
        showAuthMessage(err.message, "error");
        showToast(err.message, "error");
      } finally {
        DOM.btnSubmitRegister.disabled = false;
        DOM.btnSubmitRegister.textContent = "Tạo tài khoản mới";
      }
    });

    // Đăng xuất
    DOM.btnLogout.addEventListener("click", async () => {
      try {
        await window.AuthManager.signOut();
        showToast("Đã đăng xuất thành công.", "info");
        onUserSignedOut();
      } catch (err) {
        console.error("Lỗi khi đăng xuất:", err);
      }
    });
  }

  function showAuthMessage(text, type = "error") {
    DOM.authMsgBox.textContent = text;
    DOM.authMsgBox.className = "";
    if (type === "error") {
      DOM.authMsgBox.style.background = "#fee2e2";
      DOM.authMsgBox.style.color = "#b91c1c";
      DOM.authMsgBox.style.border = "1px solid #fca5a5";
    } else {
      DOM.authMsgBox.style.background = "#e0f2fe";
      DOM.authMsgBox.style.color = "#0369a1";
      DOM.authMsgBox.style.border = "1px solid #7dd3fc";
    }
    DOM.authMsgBox.classList.remove("hidden");
  }

  function hideAuthMessage() {
    DOM.authMsgBox.classList.add("hidden");
  }

  async function initAuthAndSession() {
    if (!checkSupabaseConfig()) return;

    window.SupabaseConfig.initSupabase();

    const session = await window.AuthManager.getSession();
    if (session && session.user) {
      await onUserSignedIn();
    } else {
      onUserSignedOut();
    }

    window.AuthManager.listenAuthState((event, session) => {
      if (event === "SIGNED_IN" && session) {
        onUserSignedIn();
      } else if (event === "SIGNED_OUT") {
        onUserSignedOut();
      }
    });
  }

  async function onUserSignedIn() {
    const user = window.AuthManager.currentUser;
    DOM.userEmailDisplay.textContent = user?.email || "Người dùng";
    DOM.userInfoArea.classList.remove("hidden");
    DOM.btnLogout.classList.remove("hidden");
    if (DOM.btnOpenExcelModal) DOM.btnOpenExcelModal.classList.remove("hidden");
    if (DOM.mainNavTabs) DOM.mainNavTabs.classList.remove("hidden");
    DOM.authSection.classList.add("hidden");
    DOM.appSection.classList.remove("hidden");

    // 0. Tải hồ sơ người dùng & phân quyền hệ thống
    try {
      await window.SystemService.getMyProfile();
      applyUserPermissionsToUI();
    } catch (e) {
      console.warn("Lỗi kiểm tra quyền hạn:", e);
    }

    // Tải dữ liệu ban đầu
    await loadInitialData();
  }

  function applyUserPermissionsToUI() {
    const prof = window.SystemService.myProfile;
    if (!prof) return;

    // Header role badge
    const roleInfo = window.SystemService.ROLES[prof.role] || window.SystemService.ROLES.staff;
    if (DOM.myProfileRoleBadge) {
      DOM.myProfileRoleBadge.textContent = roleInfo.name;
      DOM.myProfileRoleBadge.className = `badge ${roleInfo.badge}`;
    }
    if (DOM.myProfileEmail) DOM.myProfileEmail.textContent = prof.email || "";
    if (DOM.myProfileName) DOM.myProfileName.textContent = prof.full_name || prof.email.split("@")[0];

    // Render permission badges on profile card
    if (DOM.myPermissionsBadges) {
      DOM.myPermissionsBadges.innerHTML = "";
      const badges = [];
      if (prof.role === "admin") {
        badges.push('<span class="badge badge-danger">⭐ Toàn quyền hệ thống</span>');
      } else {
        if (prof.can_create) badges.push('<span class="badge badge-success">➕ Được thêm</span>');
        if (prof.can_edit) badges.push('<span class="badge badge-primary">✏️ Được sửa</span>');
        if (prof.can_delete) badges.push('<span class="badge badge-danger">🗑️ Được xóa</span>');
        if (prof.can_import) badges.push('<span class="badge badge-office">📥 Được import</span>');
      }
      DOM.myPermissionsBadges.innerHTML = badges.join(" ");
    }

    // Phân quyền hiển thị Nav Tabs (Trang được phép truy cập)
    if (DOM.navBtnTransactions) {
      DOM.navBtnTransactions.style.display = window.SystemService.canAccess("transactions") ? "" : "none";
    }
    if (DOM.navBtnFnbRec) {
      DOM.navBtnFnbRec.style.display = window.SystemService.canAccess("fnb") ? "" : "none";
    }
    if (DOM.navBtnSalaryBank) {
      DOM.navBtnSalaryBank.style.display = window.SystemService.canAccess("salary_bank") ? "" : "none";
    }
    if (DOM.navBtnSalaryCategories) {
      DOM.navBtnSalaryCategories.style.display = window.SystemService.canAccess("salary_bank") ? "" : "none";
    }
    if (DOM.navBtnReport) {
      DOM.navBtnReport.style.display = window.SystemService.canAccess("report") ? "" : "none";
    }
    if (DOM.navBtnSystem) {
      DOM.navBtnSystem.style.display = window.SystemService.canAccess("system") ? "" : "none";
    }

    // Phân quyền nút Thêm mới
    const canCreate = window.SystemService.canCreate();
    if (DOM.btnAddTransaction) DOM.btnAddTransaction.style.display = canCreate ? "" : "none";
    if (DOM.btnAddFnbRec) DOM.btnAddFnbRec.style.display = canCreate ? "" : "none";
    if (DOM.btnAddSalaryBank) DOM.btnAddSalaryBank.style.display = canCreate ? "" : "none";
    if (DOM.btnSaveSalaryBank) DOM.btnSaveSalaryBank.style.display = canCreate ? "" : "none";
    if (DOM.btnAddSalaryCategory) DOM.btnAddSalaryCategory.style.display = canCreate ? "" : "none";
    if (DOM.btnSaveInlineFnbRec) DOM.btnSaveInlineFnbRec.style.display = canCreate ? "" : "none";

    // Phân quyền nút Import Excel
    const canImport = window.SystemService.canImport();
    if (DOM.btnOpenExcelModal) DOM.btnOpenExcelModal.style.display = canImport ? "" : "none";
    if (DOM.btnTriggerImports) {
      DOM.btnTriggerImports.forEach(btn => {
        btn.style.display = canImport ? "" : "none";
      });
    }

    // Phân quyền nút Tạo tài khoản (chỉ Admin)
    const isAdmin = window.SystemService.isAdmin();
    if (DOM.btnAddUser) DOM.btnAddUser.style.display = isAdmin ? "" : "none";
  }

  function onUserSignedOut() {
    DOM.userInfoArea.classList.add("hidden");
    DOM.btnLogout.classList.add("hidden");
    if (DOM.btnOpenExcelModal) DOM.btnOpenExcelModal.classList.add("hidden");
    if (DOM.mainNavTabs) DOM.mainNavTabs.classList.add("hidden");
    DOM.appSection.classList.add("hidden");
    DOM.authSection.classList.remove("hidden");
    DOM.transactionTbody.innerHTML = "";
    if (DOM.fnbRecTbody) DOM.fnbRecTbody.innerHTML = "";
    DOM.txDate.value = getTodayString();
  }

  // ================= LOAD INITIAL METADATA =================
  async function loadInitialData() {
    try {
      // 1. Tải mảng kinh doanh
      AppState.businessUnits = await window.TransactionService.getBusinessUnits();
      populateBusinessUnitDropdowns();

      // 2. Tải toàn bộ danh mục
      AppState.categories = await window.TransactionService.getCategories();
      populateCategoryDropdowns();

      // 3. Tải và lọc giao dịch thu chi chung
      await applyFilters();

      // 4. Tải dữ liệu đối soát F&B
      await applyFnbFilters();

      // 5. Tải danh mục chi lương & CK (không chặn nếu lỗi – dùng danh mục mặc định)
      await loadSalaryCategories({ silent: true });

      // 6. Tải dữ liệu chi lương & chuyển khoản
      await applySalaryBankFilters();
    } catch (err) {
      console.error("Lỗi khi tải metadata ban đầu:", err);
      showToast("Lỗi kết nối CSDL: " + (err.message || "Vui lòng kiểm tra RLS hoặc schema"), "error");
    }
  }

  function populateBusinessUnitDropdowns() {
    // Filter dropdown (Transactions)
    DOM.filterUnit.innerHTML = '<option value="">-- Tất cả mảng --</option>';
    AppState.businessUnits.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      DOM.filterUnit.appendChild(opt);
    });

    // Form modal dropdown (Transactions)
    DOM.txUnit.innerHTML = '<option value="">-- Chọn mảng hoạt động --</option>';
    AppState.businessUnits.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      DOM.txUnit.appendChild(opt);
    });

    // Filter dropdown (Salary & Bank)
    if (DOM.sbFilterUnit) {
      DOM.sbFilterUnit.innerHTML = '<option value="">-- Tất cả mảng --</option>';
      AppState.businessUnits.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.name;
        DOM.sbFilterUnit.appendChild(opt);
      });
    }

    // Inline form dropdown (Salary & Bank)
    if (DOM.sbUnit) {
      DOM.sbUnit.innerHTML = '<option value="">-- Chọn mảng hoạt động --</option>';
      AppState.businessUnits.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = `${u.name} [${u.code}]`;
        DOM.sbUnit.appendChild(opt);
      });
    }
  }

  function populateCategoryDropdowns(unitId = null, transactionType = null) {
    // 1. Filter Category dropdown
    const filterUnitId = DOM.filterUnit.value ? Number(DOM.filterUnit.value) : null;
    const filterTypeVal = DOM.filterType.value || null;

    let availableForFilter = AppState.categories;
    if (filterUnitId) {
      availableForFilter = availableForFilter.filter(c => !c.business_unit_id || c.business_unit_id === filterUnitId);
    }
    if (filterTypeVal) {
      availableForFilter = availableForFilter.filter(c => c.transaction_type === filterTypeVal);
    }

    DOM.filterCategory.innerHTML = '<option value="">-- Tất cả danh mục --</option>';
    availableForFilter.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      DOM.filterCategory.appendChild(opt);
    });

    // 2. Modal Form Category dropdown
    updateModalCategoryDropdown();
  }

  function updateModalCategoryDropdown() {
    const selectedUnitId = DOM.txUnit.value ? Number(DOM.txUnit.value) : null;
    const selectedType = DOM.txType.value || "income";

    let available = AppState.categories.filter(c => c.transaction_type === selectedType);
    if (selectedUnitId) {
      available = available.filter(c => !c.business_unit_id || c.business_unit_id === selectedUnitId);
    }

    DOM.txCategory.innerHTML = '<option value="">-- Chọn danh mục --</option>';
    available.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      DOM.txCategory.appendChild(opt);
    });
  }

  // ================= FILTERS & PRESETS =================
  function setupFilterEvents() {
    // Nút chọn nhanh khoảng ngày
    DOM.presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        DOM.presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const preset = btn.getAttribute("data-preset");
        applyDatePreset(preset);
        applyFilters();
      });
    });

    // Khi đổi mảng hoặc loại ở filter -> cập nhật danh mục filter
    DOM.filterUnit.addEventListener("change", () => {
      populateCategoryDropdowns();
      applyFilters();
    });

    DOM.filterType.addEventListener("change", () => {
      populateCategoryDropdowns();
      applyFilters();
    });

    DOM.filterCategory.addEventListener("change", () => applyFilters());
    DOM.filterPayment.addEventListener("change", () => applyFilters());

    DOM.btnApplyFilter.addEventListener("click", () => applyFilters());

    // Nút đặt lại bộ lọc
    DOM.btnResetFilter.addEventListener("click", () => {
      DOM.filterStartDate.value = "";
      DOM.filterEndDate.value = "";
      DOM.filterUnit.value = "";
      DOM.filterType.value = "";
      DOM.filterCategory.value = "";
      DOM.filterPayment.value = "";
      DOM.filterSearch.value = "";

      DOM.presetBtns.forEach(b => b.classList.remove("active"));
      const allBtn = document.querySelector('.preset-btn[data-preset="all"]');
      if (allBtn) allBtn.classList.add("active");

      populateCategoryDropdowns();
      applyFilters();
    });

    // Tìm kiếm khi nhấn Enter
    DOM.filterSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        applyFilters();
      }
    });
  }

  function applyDatePreset(preset) {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    if (preset === "today") {
      const dStr = getTodayString();
      DOM.filterStartDate.value = dStr;
      DOM.filterEndDate.value = dStr;
    } else if (preset === "month") {
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      DOM.filterStartDate.value = formatDateIso(firstDay);
      DOM.filterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "quarter") {
      const qMonth = Math.floor(m / 3) * 3;
      const firstDay = new Date(y, qMonth, 1);
      const lastDay = new Date(y, qMonth + 3, 0);
      DOM.filterStartDate.value = formatDateIso(firstDay);
      DOM.filterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "all") {
      DOM.filterStartDate.value = "";
      DOM.filterEndDate.value = "";
    }
  }

  function formatDateIso(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async function applyFilters() {
    const filters = {
      startDate: DOM.filterStartDate.value || null,
      endDate: DOM.filterEndDate.value || null,
      businessUnitId: DOM.filterUnit.value ? Number(DOM.filterUnit.value) : null,
      transactionType: DOM.filterType.value || null,
      categoryId: DOM.filterCategory.value ? Number(DOM.filterCategory.value) : null,
      paymentMethod: DOM.filterPayment.value || null,
      search: DOM.filterSearch.value.trim() || null
    };

    DOM.tableLoading.classList.remove("hidden");
    DOM.tableEmpty.classList.add("hidden");
    DOM.transactionTbody.innerHTML = "";

    try {
      const transactions = await window.TransactionService.getTransactions(filters);
      AppState.currentTransactions = transactions;

      // Cập nhật Dashboard & Thống kê
      window.DashboardManager.renderDashboard(transactions);

      // Render bảng
      renderTransactionTable(transactions);
    } catch (err) {
      console.error("Lỗi khi lọc giao dịch:", err);
      showToast("Lỗi khi tải dữ liệu giao dịch: " + err.message, "error");
    } finally {
      DOM.tableLoading.classList.add("hidden");
    }
  }

  // ================= RENDER TABLE =================
  function renderTransactionTable(transactions) {
    DOM.transactionTbody.innerHTML = "";

    if (!transactions || transactions.length === 0) {
      DOM.tableEmpty.classList.remove("hidden");
      return;
    }

    DOM.tableEmpty.classList.add("hidden");

    const paymentLabels = {
      cash: "Tiền mặt",
      bank_transfer: "Chuyển khoản",
      card: "Thẻ NH",
      other: "Khác"
    };

    transactions.forEach(tx => {
      const tr = document.createElement("tr");

      const isIncome = tx.transaction_type === "income";
      const unitCode = tx.business_units?.code || "";
      const unitName = tx.business_units?.name || "Khác";
      const categoryName = tx.categories?.name || "-";
      const formattedAmount = window.DashboardManager.formatVND(tx.amount);

      let unitBadgeClass = "badge-office";
      if (unitCode === "SON_MAI") unitBadgeClass = "badge-sonmai";
      if (unitCode === "FNB") unitBadgeClass = "badge-fnb";

      tr.innerHTML = `
        <td style="font-weight: 500;">${formatDateVN(tx.transaction_date)}</td>
        <td><span class="badge ${unitBadgeClass}">${escapeHtml(unitName)}</span></td>
        <td>
          <span class="badge ${isIncome ? "badge-income" : "badge-expense"}">
            ${isIncome ? "Thu (+)" : "Chi (-)"}
          </span>
        </td>
        <td style="color: var(--text-main); font-weight: 500;">${escapeHtml(categoryName)}</td>
        <td style="text-align: right;" class="${isIncome ? "amount-income" : "amount-expense"}">
          ${isIncome ? "+" : "-"}${formattedAmount}
        </td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${paymentLabels[tx.payment_method] || tx.payment_method}</td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(tx.description || "-")}</div>
          ${tx.reference_no ? `<small style="color: var(--text-muted);">Mã: ${escapeHtml(tx.reference_no)}</small>` : ""}
        </td>
        <td style="text-align: center;">
          <div class="action-btns" style="justify-content: center;">
            <button class="btn btn-sm btn-outline btn-edit-tx" data-id="${tx.id}" title="Chỉnh sửa">
              ✏️
            </button>
            <button class="btn btn-sm btn-outline btn-delete-tx" data-id="${tx.id}" title="Xóa" style="color: var(--expense-red);">
              🗑️
            </button>
          </div>
        </td>
      `;

      DOM.transactionTbody.appendChild(tr);
    });

    // Gắn sự kiện cho các nút Sửa & Xóa
    DOM.transactionTbody.querySelectorAll(".btn-edit-tx").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        openEditTransactionModal(id);
      });
    });

    DOM.transactionTbody.querySelectorAll(".btn-delete-tx").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        openDeleteModal(id);
      });
    });
  }

  // ================= MODAL THÊM / SỬA GIAO DỊCH =================
  function setupTransactionModalEvents() {
    // Mở modal thêm mới
    DOM.btnAddTransaction.addEventListener("click", () => {
      openCreateTransactionModal();
    });

    // Preview VND khi gõ số tiền
    DOM.txAmount.addEventListener("input", () => {
      const val = Number(DOM.txAmount.value);
      DOM.amountPreview.textContent = isNaN(val) || val <= 0 ? "0 ₫" : window.DashboardManager.formatVND(val);
    });

    // Toggle Loại giao dịch trong Form: Thu (+) / Chi (-)
    DOM.btnTypeIncome.addEventListener("click", () => {
      DOM.btnTypeIncome.classList.add("active");
      DOM.btnTypeExpense.classList.remove("active");
      DOM.txType.value = "income";
      updateModalCategoryDropdown();
    });

    DOM.btnTypeExpense.addEventListener("click", () => {
      DOM.btnTypeExpense.classList.add("active");
      DOM.btnTypeIncome.classList.remove("active");
      DOM.txType.value = "expense";
      updateModalCategoryDropdown();
    });

    // Khi đổi Mảng hoạt động trong Form -> cập nhật dropdown Danh mục
    DOM.txUnit.addEventListener("change", () => {
      updateModalCategoryDropdown();
    });

    // Submit Form Lưu giao dịch
    DOM.formTransaction.addEventListener("submit", async (e) => {
      e.preventDefault();

      const txId = DOM.txId.value ? Number(DOM.txId.value) : null;
      const amountVal = Number(DOM.txAmount.value);

      if (isNaN(amountVal) || amountVal <= 0) {
        showToast("Số tiền giao dịch phải là số dương lớn hơn 0.", "warning");
        DOM.txAmount.focus();
        return;
      }

      if (!DOM.txUnit.value) {
        showToast("Vui lòng chọn mảng hoạt động.", "warning");
        DOM.txUnit.focus();
        return;
      }

      const payload = {
        transaction_date: DOM.txDate.value,
        business_unit_id: Number(DOM.txUnit.value),
        category_id: DOM.txCategory.value ? Number(DOM.txCategory.value) : null,
        transaction_type: DOM.txType.value,
        amount: amountVal,
        payment_method: DOM.txPayment.value,
        description: DOM.txDescription.value,
        reference_no: DOM.txReference.value
      };

      DOM.btnSaveTx.disabled = true;
      DOM.btnSaveTx.textContent = "Đang lưu vào Supabase...";

      try {
        if (txId) {
          await window.TransactionService.updateTransaction(txId, payload);
          showToast("Cập nhật giao dịch thành công!", "success");
        } else {
          await window.TransactionService.createTransaction(payload);
          showToast("Ghi nhận giao dịch mới thành công!", "success");
        }

        closeModal(DOM.modalTransaction);
        await applyFilters();
      } catch (err) {
        console.error("Lỗi khi lưu giao dịch:", err);
        showToast("Không thể lưu giao dịch: " + (err.message || "Lỗi database"), "error");
      } finally {
        DOM.btnSaveTx.disabled = false;
        DOM.btnSaveTx.textContent = "Lưu giao dịch";
      }
    });

    // Xóa giao dịch: nút xác nhận
    DOM.btnConfirmDelete.addEventListener("click", async () => {
      const id = Number(DOM.deleteTargetId.value);
      if (!id) return;

      DOM.btnConfirmDelete.disabled = true;
      DOM.btnConfirmDelete.textContent = "Đang xóa...";

      try {
        await window.TransactionService.deleteTransaction(id);
        showToast("Đã xóa giao dịch thành công khỏi Supabase.", "success");
        closeModal(DOM.modalDelete);
        await applyFilters();
      } catch (err) {
        console.error("Lỗi khi xóa giao dịch:", err);
        showToast("Lỗi khi xóa giao dịch: " + err.message, "error");
      } finally {
        DOM.btnConfirmDelete.disabled = false;
        DOM.btnConfirmDelete.textContent = "Xóa giao dịch";
      }
    });

    // Đóng modal khi bấm nút close hoặc click overlay
    // Dùng event delegation: áp dụng cho MỌI modal (kể cả Excel import, xóa Chi lương, user...)
    document.addEventListener("click", (e) => {
      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        closeModal(closeBtn.closest(".modal-overlay"));
        return;
      }
      // Đóng khi click ngoài backdrop
      if (e.target.classList && e.target.classList.contains("modal-overlay")) {
        closeModal(e.target);
      }
    });

    // Đóng modal đang mở bằng phím Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => closeModal(m));
      }
    });
  }

  function openCreateTransactionModal() {
    AppState.editingTransactionId = null;
    DOM.txId.value = "";
    DOM.modalTransactionTitle.textContent = "Thêm Giao dịch Mới";
    DOM.txDate.value = getTodayString();
    
    // Mặc định Thu tiền
    DOM.txType.value = "income";
    DOM.btnTypeIncome.classList.add("active");
    DOM.btnTypeExpense.classList.remove("active");

    // Chọn mảng đầu tiên nếu có
    if (AppState.businessUnits.length > 0) {
      DOM.txUnit.value = AppState.businessUnits[0].id;
    } else {
      DOM.txUnit.value = "";
    }

    updateModalCategoryDropdown();

    DOM.txAmount.value = "";
    DOM.amountPreview.textContent = "0 ₫";
    DOM.txPayment.value = "cash";
    DOM.txDescription.value = "";
    DOM.txReference.value = "";

    openModal(DOM.modalTransaction);
  }

  function openEditTransactionModal(id) {
    if (!window.SystemService.canEdit()) {
      showToast("Tài khoản của bạn không có quyền Chỉnh sửa dữ liệu. Vui lòng liên hệ Admin.", "warning");
      return;
    }

    const tx = AppState.currentTransactions.find(t => t.id === id);
    if (!tx) {
      showToast("Không tìm thấy thông tin giao dịch cần sửa.", "error");
      return;
    }

    AppState.editingTransactionId = id;
    DOM.txId.value = id;
    DOM.modalTransactionTitle.textContent = `Chỉnh sửa Giao dịch #${id}`;
    DOM.txDate.value = tx.transaction_date;

    DOM.txType.value = tx.transaction_type;
    if (tx.transaction_type === "income") {
      DOM.btnTypeIncome.classList.add("active");
      DOM.btnTypeExpense.classList.remove("active");
    } else {
      DOM.btnTypeExpense.classList.add("active");
      DOM.btnTypeIncome.classList.remove("active");
    }

    DOM.txUnit.value = tx.business_unit_id;
    updateModalCategoryDropdown();
    DOM.txCategory.value = tx.category_id || "";

    DOM.txAmount.value = tx.amount;
    DOM.amountPreview.textContent = window.DashboardManager.formatVND(tx.amount);
    DOM.txPayment.value = tx.payment_method;
    DOM.txDescription.value = tx.description || "";
    DOM.txReference.value = tx.reference_no || "";

    openModal(DOM.modalTransaction);
  }

  function openDeleteModal(id) {
    if (!window.SystemService.canDelete()) {
      showToast("Tài khoản của bạn không có quyền Xóa dữ liệu. Vui lòng liên hệ Admin.", "warning");
      return;
    }

    DOM.deleteTargetId.value = id;
    openModal(DOM.modalDelete);
  }

  // ================= NAVIGATION VIEW SWITCHING =================
  function setupNavigationEvents() {
    if (!DOM.navBtnTransactions || !DOM.navBtnFnbRec) return;

    function activateTab(activeBtn, activeView) {
      [DOM.navBtnTransactions, DOM.navBtnFnbRec, DOM.navBtnSalaryBank, DOM.navBtnSalaryCategories, DOM.navBtnReport, DOM.navBtnSystem].forEach(btn => {
        if (btn) btn.classList.remove("active");
      });
      [DOM.viewTransactions, DOM.viewFnbRec, DOM.viewSalaryBank, DOM.viewSalaryCategories, DOM.viewReport, DOM.viewSystem].forEach(view => {
        if (view) view.classList.add("hidden");
      });

      if (activeBtn) activeBtn.classList.add("active");
      if (activeView) activeView.classList.remove("hidden");
    }

    DOM.navBtnTransactions.addEventListener("click", () => {
      activateTab(DOM.navBtnTransactions, DOM.viewTransactions);
    });

    DOM.navBtnFnbRec.addEventListener("click", () => {
      activateTab(DOM.navBtnFnbRec, DOM.viewFnbRec);
      applyFnbFilters();
    });

    if (DOM.navBtnSalaryBank) {
      DOM.navBtnSalaryBank.addEventListener("click", () => {
        activateTab(DOM.navBtnSalaryBank, DOM.viewSalaryBank);
        applySalaryBankFilters();
      });
    }

    // [FIX] Gắn sự kiện cho tab "Danh mục Lương & CK" (trước đây bị thiếu)
    if (DOM.navBtnSalaryCategories) {
      DOM.navBtnSalaryCategories.addEventListener("click", () => {
        activateTab(DOM.navBtnSalaryCategories, DOM.viewSalaryCategories);
        loadSalaryCategories();
      });
    }

    if (DOM.navBtnReport) {
      DOM.navBtnReport.addEventListener("click", () => {
        activateTab(DOM.navBtnReport, DOM.viewReport);
        loadComprehensiveReport();
      });
    }

    if (DOM.navBtnSystem) {
      DOM.navBtnSystem.addEventListener("click", () => {
        activateTab(DOM.navBtnSystem, DOM.viewSystem);
        loadSystemUsers();
      });
    }
  }

  // ================= F&B RECONCILIATION LOGIC =================
  // ================= F&B RECONCILIATION LOGIC =================
  function setupFnbReconciliationEvents() {
    if (!DOM.formInlineFnbRec && !DOM.btnAddFnbRec) return;

    // A. XỬ LÝ FORM NHẬP LIỆU TRỰC TIẾP TRÊN TRANG (INLINE FORM)
    if (DOM.formInlineFnbRec) {
      // 1. Tính toán realtime khi gõ tiền trong Inline Form
      const inlineCalcHandler = () => updateLiveInlineFnbCalculation();
      DOM.inlineRecKiotviet.addEventListener("input", inlineCalcHandler);
      DOM.inlineRecCash.addEventListener("input", inlineCalcHandler);
      DOM.inlineRecMb.addEventListener("input", inlineCalcHandler);

      // 2. Khi đổi ngày đối soát trên Inline Form -> kiểm tra xem đã có dữ liệu chưa
      DOM.inlineRecDate.addEventListener("change", async () => {
        const selectedDate = DOM.inlineRecDate.value;
        if (!selectedDate) return;

        try {
          const existing = await window.FnbReconciliationService.getByDate(selectedDate);
          if (existing) {
            showToast(`Ngày ${formatDateVN(selectedDate)} đã có dữ liệu đối soát. Đang nạp để chỉnh sửa.`, "info");
            populateInlineFnbForm(existing);
          } else {
            DOM.inlineRecId.value = "";
            DOM.inlineRecFormTitle.innerHTML = `<span>📝 Form Nhập Liệu Đối Soát Doanh Thu F&B Hàng Ngày</span><span id="inline-rec-badge-mode" class="badge badge-neutral" style="font-size: 0.75rem;">Tạo mới</span>`;
            DOM.inlineDateHint.textContent = `Tạo mới đối soát cho ngày ${formatDateVN(selectedDate)}`;
            DOM.inlineDateHint.style.color = "var(--text-muted)";
            DOM.inlineRecKiotviet.value = "";
            DOM.inlineRecCash.value = "";
            DOM.inlineRecMb.value = "";
            DOM.inlineRecReason.value = "";
            DOM.inlineRecNotes.value = "";
            updateLiveInlineFnbCalculation();
          }
        } catch (err) {
          console.error("Lỗi kiểm tra ngày:", err);
        }
      });

      // 3. Nút "Nhập ngày khác" / Reset Inline Form
      DOM.btnInlineResetForm.addEventListener("click", () => {
        resetInlineFnbForm();
        showToast("Đã làm mới form đối soát.", "info");
      });

      // 4. Submit Inline Form lưu đối soát vào Supabase
      DOM.formInlineFnbRec.addEventListener("submit", async (e) => {
        e.preventDefault();

        const kiotviet = Number(DOM.inlineRecKiotviet.value) || 0;
        const cash = Number(DOM.inlineRecCash.value) || 0;
        const mb = Number(DOM.inlineRecMb.value) || 0;
        const diff = (cash + mb) - kiotviet;

        if (diff !== 0 && (!DOM.inlineRecReason.value || DOM.inlineRecReason.value.trim() === "")) {
          showToast("⚠️ Phát hiện chênh lệch thu tiền! Vui lòng nhập lý do giải thích cụ thể.", "warning");
          DOM.inlineRecReason.focus();
          return;
        }

        const payload = {
          id: DOM.inlineRecId.value ? Number(DOM.inlineRecId.value) : null,
          reconciliation_date: DOM.inlineRecDate.value,
          kiotviet_revenue: kiotviet,
          cash_amount: cash,
          mb_bank_amount: mb,
          discrepancy_reason: DOM.inlineRecReason.value.trim(),
          notes: DOM.inlineRecNotes.value.trim()
        };

        DOM.btnSaveInlineFnbRec.disabled = true;
        DOM.btnSaveInlineFnbRec.textContent = "Đang lưu vào Supabase...";

        try {
          const saved = await window.FnbReconciliationService.saveReconciliation(payload);
          showToast(`Đã lưu đối soát ngày ${formatDateVN(payload.reconciliation_date)} vào Supabase thành công!`, "success");
          
          // Cập nhật lại id và trạng thái form thành chỉnh sửa
          populateInlineFnbForm(saved);

          // Tải lại bảng và KPI
          await applyFnbFilters();
        } catch (err) {
          console.error("Lỗi khi lưu đối soát F&B:", err);
          showToast("Lỗi khi lưu: " + (err.message || "Không thể ghi vào database"), "error");
        } finally {
          DOM.btnSaveInlineFnbRec.disabled = false;
          DOM.btnSaveInlineFnbRec.textContent = "💾 Lưu Đối Soát vào Supabase";
        }
      });
    }

    // B. NÚT "+ TẠO ĐỐI SOÁT NGÀY MỚI" TỪ HEADER BẢNG
    if (DOM.btnAddFnbRec) {
      DOM.btnAddFnbRec.addEventListener("click", () => {
        resetInlineFnbForm();
        if (DOM.inlineFormCard) {
          DOM.inlineFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => {
            if (DOM.inlineRecKiotviet) DOM.inlineRecKiotviet.focus();
          }, 400);
        }
      });
    }

    // C. CÁC SỰ KIỆN KHÁC (Xóa, Bộ lọc)
    // Nút xác nhận xóa đối soát F&B
    DOM.btnConfirmFnbDelete.addEventListener("click", async () => {
      const id = Number(DOM.fnbDeleteTargetId.value);
      if (!id) return;

      DOM.btnConfirmFnbDelete.disabled = true;
      DOM.btnConfirmFnbDelete.textContent = "Đang xóa...";

      try {
        await window.FnbReconciliationService.deleteReconciliation(id);
        showToast("Đã xóa bản ghi đối soát khỏi Supabase.", "success");
        closeModal(DOM.modalFnbDelete);
        
        // Nếu đang sửa đúng bản ghi vừa xóa, reset form
        if (DOM.inlineRecId && Number(DOM.inlineRecId.value) === id) {
          resetInlineFnbForm();
        }

        await applyFnbFilters();
      } catch (err) {
        console.error("Lỗi khi xóa đối soát:", err);
        showToast("Lỗi khi xóa: " + err.message, "error");
      } finally {
        DOM.btnConfirmFnbDelete.disabled = false;
        DOM.btnConfirmFnbDelete.textContent = "Xóa bản ghi";
      }
    });

    // Bộ lọc và presets ngày cho đối soát F&B
    DOM.fnbPresetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        DOM.fnbPresetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const preset = btn.getAttribute("data-preset");
        applyFnbDatePreset(preset);
        applyFnbFilters();
      });
    });

    DOM.fnbFilterStatus.addEventListener("change", () => applyFnbFilters());
    DOM.btnFnbApplyFilter.addEventListener("click", () => applyFnbFilters());

    DOM.btnFnbResetFilter.addEventListener("click", () => {
      DOM.fnbFilterStartDate.value = "";
      DOM.fnbFilterEndDate.value = "";
      DOM.fnbFilterStatus.value = "all";
      DOM.fnbFilterSearch.value = "";

      DOM.fnbPresetBtns.forEach(b => b.classList.remove("active"));
      const allBtn = document.querySelector('.fnb-preset-btn[data-preset="all"]');
      if (allBtn) allBtn.classList.add("active");

      applyFnbFilters();
    });

    DOM.fnbFilterSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFnbFilters();
    });
  }

  function applyFnbDatePreset(preset) {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    if (preset === "today") {
      const dStr = getTodayString();
      DOM.fnbFilterStartDate.value = dStr;
      DOM.fnbFilterEndDate.value = dStr;
    } else if (preset === "month") {
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      DOM.fnbFilterStartDate.value = formatDateIso(firstDay);
      DOM.fnbFilterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "quarter") {
      const qMonth = Math.floor(m / 3) * 3;
      const firstDay = new Date(y, qMonth, 1);
      const lastDay = new Date(y, qMonth + 3, 0);
      DOM.fnbFilterStartDate.value = formatDateIso(firstDay);
      DOM.fnbFilterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "all") {
      DOM.fnbFilterStartDate.value = "";
      DOM.fnbFilterEndDate.value = "";
    }
  }

  // ================= TÍNH TOÁN & THAO TÁC INLINE FORM =================
  function updateLiveInlineFnbCalculation() {
    if (!DOM.inlineRecKiotviet) return;

    const kv = Number(DOM.inlineRecKiotviet.value) || 0;
    const cash = Number(DOM.inlineRecCash.value) || 0;
    const mb = Number(DOM.inlineRecMb.value) || 0;

    DOM.inlineRecPreviewKiotviet.textContent = window.DashboardManager.formatVND(kv);
    DOM.inlineRecPreviewCash.textContent = window.DashboardManager.formatVND(cash);
    DOM.inlineRecPreviewMb.textContent = window.DashboardManager.formatVND(mb);

    const collected = cash + mb;
    const diff = collected - kv;

    DOM.inlineRecCalcKiotviet.textContent = window.DashboardManager.formatVND(kv);
    DOM.inlineRecCalcCollected.textContent = window.DashboardManager.formatVND(collected);

    if (diff === 0) {
      DOM.inlineRecCalcDiff.textContent = "0 ₫";
      DOM.inlineRecCalcDiff.style.color = "var(--income-green)";
      DOM.inlineRecCalcBadge.textContent = "Khớp 100%";
      DOM.inlineRecCalcBadge.className = "badge badge-matched";
      DOM.inlineRecDiffWarning.classList.add("hidden");
      DOM.inlineRecReasonRequiredMark.classList.add("hidden");
    } else if (diff > 0) {
      DOM.inlineRecCalcDiff.textContent = "+" + window.DashboardManager.formatVND(diff);
      DOM.inlineRecCalcDiff.style.color = "#d97706";
      DOM.inlineRecCalcBadge.textContent = "Thừa tiền (+)";
      DOM.inlineRecCalcBadge.className = "badge badge-surplus";
      DOM.inlineRecDiffWarning.classList.remove("hidden");
      DOM.inlineRecReasonRequiredMark.classList.remove("hidden");
    } else {
      DOM.inlineRecCalcDiff.textContent = "-" + window.DashboardManager.formatVND(Math.abs(diff));
      DOM.inlineRecCalcDiff.style.color = "var(--expense-red)";
      DOM.inlineRecCalcBadge.textContent = "Thiếu tiền (-)";
      DOM.inlineRecCalcBadge.className = "badge badge-deficit";
      DOM.inlineRecDiffWarning.classList.remove("hidden");
      DOM.inlineRecReasonRequiredMark.classList.remove("hidden");
    }
  }

  function resetInlineFnbForm() {
    if (!DOM.inlineRecDate) return;
    DOM.inlineRecId.value = "";
    DOM.inlineRecDate.value = getTodayString();
    DOM.inlineRecFormTitle.innerHTML = `<span>📝 Form Nhập Liệu Đối Soát Doanh Thu F&B Hàng Ngày</span><span id="inline-rec-badge-mode" class="badge badge-neutral" style="font-size: 0.75rem;">Tạo mới</span>`;
    DOM.inlineDateHint.textContent = `Ngày đối soát: ${formatDateVN(getTodayString())}`;
    DOM.inlineDateHint.style.color = "var(--text-muted)";
    DOM.inlineRecKiotviet.value = "";
    DOM.inlineRecCash.value = "";
    DOM.inlineRecMb.value = "";
    DOM.inlineRecReason.value = "";
    DOM.inlineRecNotes.value = "";

    updateLiveInlineFnbCalculation();
  }

  function populateInlineFnbForm(record) {
    if (!record || !DOM.inlineRecDate) return;
    DOM.inlineRecId.value = record.id;
    DOM.inlineRecDate.value = record.reconciliation_date;
    DOM.inlineRecFormTitle.innerHTML = `<span>📝 Chỉnh sửa Đối Soát Ngày ${formatDateVN(record.reconciliation_date)}</span><span id="inline-rec-badge-mode" class="badge badge-warning" style="font-size: 0.75rem; background: #fef3c7; color: #b45309;">Chỉnh sửa #${record.id}</span>`;
    DOM.inlineDateHint.textContent = `Đang chỉnh sửa bản ghi ngày ${formatDateVN(record.reconciliation_date)}`;
    DOM.inlineDateHint.style.color = "var(--primary)";

    DOM.inlineRecKiotviet.value = record.kiotviet_revenue || 0;
    DOM.inlineRecCash.value = record.cash_amount || 0;
    DOM.inlineRecMb.value = record.mb_bank_amount || 0;
    DOM.inlineRecReason.value = record.discrepancy_reason || "";
    DOM.inlineRecNotes.value = record.notes || "";

    updateLiveInlineFnbCalculation();
  }

  function openDeleteFnbRecModal(id) {
    DOM.fnbDeleteTargetId.value = id;
    openModal(DOM.modalFnbDelete);
  }

  async function applyFnbFilters() {
    if (!DOM.fnbRecTbody) return;

    const filters = {
      startDate: DOM.fnbFilterStartDate.value || null,
      endDate: DOM.fnbFilterEndDate.value || null,
      status: DOM.fnbFilterStatus.value || "all",
      search: DOM.fnbFilterSearch.value.trim() || null
    };

    DOM.fnbTableLoading.classList.remove("hidden");
    DOM.fnbTableEmpty.classList.add("hidden");
    DOM.fnbRecTbody.innerHTML = "";

    try {
      const records = await window.FnbReconciliationService.getReconciliations(filters);
      AppState.currentFnbReconciliations = records;

      // Tính tổng hợp chỉ số
      const summary = window.FnbReconciliationService.calculateSummary(records);
      renderFnbSummary(summary);

      // Render bảng dữ liệu
      renderFnbReconciliationTable(records);
    } catch (err) {
      console.error("Lỗi khi lọc đối soát F&B:", err);
      showToast("Lỗi khi tải đối soát F&B: " + err.message, "error");
    } finally {
      DOM.fnbTableLoading.classList.add("hidden");
    }
  }

  function renderFnbSummary(summary) {
    DOM.fnbKpiKiotviet.textContent = window.DashboardManager.formatVND(summary.totalKiotviet);
    DOM.fnbKpiCash.textContent = window.DashboardManager.formatVND(summary.totalCash);
    DOM.fnbKpiMb.textContent = window.DashboardManager.formatVND(summary.totalMb);
    DOM.fnbKpiTotalCollected.textContent = window.DashboardManager.formatVND(summary.totalCollected);

    const diff = summary.totalDifference;
    DOM.fnbKpiDiff.textContent = (diff > 0 ? "+" : "") + window.DashboardManager.formatVND(diff);

    if (diff === 0) {
      DOM.fnbKpiDiff.className = "kpi-value text-positive";
      DOM.fnbKpiDiffBadge.textContent = "Khớp chuẩn";
      DOM.fnbKpiDiffBadge.className = "badge badge-matched";
    } else if (diff > 0) {
      DOM.fnbKpiDiff.className = "kpi-value text-positive";
      DOM.fnbKpiDiffBadge.textContent = "Thừa tiền (+)";
      DOM.fnbKpiDiffBadge.className = "badge badge-surplus";
    } else {
      DOM.fnbKpiDiff.className = "kpi-value text-negative";
      DOM.fnbKpiDiffBadge.textContent = "Thiếu tiền (-)";
      DOM.fnbKpiDiffBadge.className = "badge badge-deficit";
    }
  }

  function renderFnbReconciliationTable(records) {
    DOM.fnbRecTbody.innerHTML = "";

    if (!records || records.length === 0) {
      DOM.fnbTableEmpty.classList.remove("hidden");
      return;
    }

    DOM.fnbTableEmpty.classList.add("hidden");

    records.forEach(r => {
      const tr = document.createElement("tr");

      const kv = Number(r.kiotviet_revenue) || 0;
      const cash = Number(r.cash_amount) || 0;
      const mb = Number(r.mb_bank_amount) || 0;
      const collected = cash + mb;
      const diff = collected - kv;

      let badgeHtml = '<span class="badge badge-matched">Khớp 100%</span>';
      let diffClass = "text-positive font-bold";
      let diffSign = "";

      if (diff > 0) {
        badgeHtml = '<span class="badge badge-surplus">Thừa tiền</span>';
        diffSign = "+";
      } else if (diff < 0) {
        badgeHtml = '<span class="badge badge-deficit">Thiếu tiền</span>';
        diffClass = "text-negative font-bold";
      }

      tr.innerHTML = `
        <td style="font-weight: 600;">${formatDateVN(r.reconciliation_date)}</td>
        <td style="text-align: right; font-weight: 500;">${window.DashboardManager.formatVND(kv)}</td>
        <td style="text-align: right; color: var(--text-main);">${window.DashboardManager.formatVND(cash)}</td>
        <td style="text-align: right; color: var(--text-main);">${window.DashboardManager.formatVND(mb)}</td>
        <td style="text-align: right; font-weight: 600; color: var(--income-green);">${window.DashboardManager.formatVND(collected)}</td>
        <td style="text-align: right;" class="${diffClass}">${diffSign}${window.DashboardManager.formatVND(diff)}</td>
        <td style="text-align: center;">${badgeHtml}</td>
        <td>
          <div style="font-weight: 500; color: ${diff !== 0 ? 'var(--text-main)' : 'var(--text-muted)'};">
            ${escapeHtml(r.discrepancy_reason || (diff === 0 ? "Khớp số liệu" : "Chưa có lý do"))}
          </div>
          ${r.notes ? `<small style="color: var(--text-muted);">Ghi chú: ${escapeHtml(r.notes)}</small>` : ""}
        </td>
        <td style="text-align: center;">
          <div class="action-btns" style="justify-content: center;">
            <button class="btn btn-sm btn-outline btn-edit-fnb" data-id="${r.id}" title="Sửa">✏️</button>
            <button class="btn btn-sm btn-outline btn-delete-fnb" data-id="${r.id}" title="Xóa" style="color: var(--expense-red);">🗑️</button>
          </div>
        </td>
      `;

      DOM.fnbRecTbody.appendChild(tr);
    });

    // Gắn sự kiện nút Sửa & Xóa F&B
    DOM.fnbRecTbody.querySelectorAll(".btn-edit-fnb").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!window.SystemService.canEdit()) {
          showToast("Tài khoản của bạn không có quyền Chỉnh sửa dữ liệu. Vui lòng liên hệ Admin.", "warning");
          return;
        }

        const id = Number(btn.getAttribute("data-id"));
        const record = AppState.currentFnbReconciliations.find(r => r.id === id);
        if (record) {
          populateInlineFnbForm(record);
          if (DOM.inlineFormCard) {
            DOM.inlineFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          showToast(`Đang chỉnh sửa đối soát ngày ${formatDateVN(record.reconciliation_date)} trên form.`, "info");
        }
      });
    });

    DOM.fnbRecTbody.querySelectorAll(".btn-delete-fnb").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!window.SystemService.canDelete()) {
          showToast("Tài khoản của bạn không có quyền Xóa dữ liệu. Vui lòng liên hệ Admin.", "warning");
          return;
        }

        const id = Number(btn.getAttribute("data-id"));
        openDeleteFnbRecModal(id);
      });
    });
  }

  // ================= SALARY & BANK EXPENSES LOGIC =================
  function setupSalaryBankEvents() {
    if (!DOM.formInlineSalaryBank && !DOM.btnAddSalaryBank) return;

    // 1. Chuyển đổi loại: Chi Lương vs Chi Chuyển Khoản khác
    function updateSbCategoryDropdown(selectedCategory = null) {
      renderSbCategoryOptions(DOM.sbType ? DOM.sbType.value : "bank_transfer", selectedCategory);
    }

    if (DOM.btnSbTypeSalary && DOM.btnSbTypeTransfer) {
      DOM.btnSbTypeSalary.addEventListener("click", () => {
        DOM.sbType.value = "salary";
        DOM.btnSbTypeSalary.classList.add("active", "type-expense");
        DOM.btnSbTypeTransfer.classList.remove("active", "type-expense");
        updateSbCategoryDropdown();
      });

      DOM.btnSbTypeTransfer.addEventListener("click", () => {
        DOM.sbType.value = "bank_transfer";
        DOM.btnSbTypeTransfer.classList.add("active", "type-expense");
        DOM.btnSbTypeSalary.classList.remove("active", "type-expense");
        updateSbCategoryDropdown();
      });
    }

    // Khởi tạo danh mục ban đầu cho form
    updateSbCategoryDropdown();

    // 2. Format số tiền realtime
    if (DOM.sbAmount) {
      DOM.sbAmount.addEventListener("input", () => {
        const val = Number(DOM.sbAmount.value) || 0;
        DOM.sbAmountPreview.textContent = window.DashboardManager.formatVND(val);
      });
    }

    // 3. Nút Làm mới form
    if (DOM.btnSbResetForm) {
      DOM.btnSbResetForm.addEventListener("click", () => {
        resetInlineSbForm();
        showToast("Đã làm mới form nhập chi phí.", "info");
      });
    }

    // Nút scroll đến form khi bấm "+ Nhập khoản chi mới"
    if (DOM.btnAddSalaryBank) {
      DOM.btnAddSalaryBank.addEventListener("click", () => {
        resetInlineSbForm();
        if (DOM.inlineSbFormCard) {
          DOM.inlineSbFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (DOM.sbRecipient) DOM.sbRecipient.focus();
      });
    }

    // 4. Submit Form ghi nhận chi phí vào Supabase
    if (DOM.formInlineSalaryBank) {
      DOM.formInlineSalaryBank.addEventListener("submit", async (e) => {
        e.preventDefault();

        const amount = Number(DOM.sbAmount.value) || 0;
        if (amount <= 0) {
          showToast("Vui lòng nhập số tiền chi lớn hơn 0.", "warning");
          if (DOM.sbAmount) DOM.sbAmount.focus();
          return;
        }

        if (!DOM.sbUnit.value) {
          showToast("Vui lòng chọn mảng hoạt động.", "warning");
          if (DOM.sbUnit) DOM.sbUnit.focus();
          return;
        }

        const formData = {
          id: DOM.sbId.value ? Number(DOM.sbId.value) : null,
          expense_date: DOM.sbDate.value || getTodayString(),
          business_unit_id: Number(DOM.sbUnit.value),
          expense_type: DOM.sbType.value || "bank_transfer",
          expense_category: DOM.sbCategory.value || "other_expense",
          recipient_name: DOM.sbRecipient.value.trim(),
          recipient_bank: DOM.sbRecipientBank.value.trim() || null,
          recipient_account: DOM.sbRecipientAccount.value.trim() || null,
          amount: amount,
          source_bank: DOM.sbSourceBank.value.trim() || "MB Bank",
          reference_no: DOM.sbRef.value.trim() || null,
          description: DOM.sbDesc.value.trim() || null,
          notes: DOM.sbNotes.value.trim() || null
        };

        DOM.btnSaveSalaryBank.disabled = true;
        DOM.btnSaveSalaryBank.textContent = "Đang lưu vào Supabase...";

        try {
          await window.SalaryBankExpenseService.saveExpense(formData);
          const isEdit = !!formData.id;
          showToast(
            isEdit ? "Đã cập nhật khoản chi thành công!" : "Đã lưu khoản chi mới thành công!",
            "success"
          );

          resetInlineSbForm();
          await applySalaryBankFilters();
        } catch (err) {
          console.error("Lỗi khi lưu khoản chi:", err);
          showToast("Không thể lưu chi phí: " + (err.message || "Lỗi RLS hoặc kết nối"), "error");
        } finally {
          DOM.btnSaveSalaryBank.disabled = false;
          DOM.btnSaveSalaryBank.textContent = "💾 Lưu Khoản Chi vào Supabase";
        }
      });
    }

    // 5. Bộ lọc chi phí
    if (DOM.sbPresetBtns) {
      DOM.sbPresetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          DOM.sbPresetBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");

          const preset = btn.getAttribute("data-preset");
          applySbDatePreset(preset);
          applySalaryBankFilters();
        });
      });
    }

    if (DOM.sbFilterUnit) {
      DOM.sbFilterUnit.addEventListener("change", () => applySalaryBankFilters());
    }
    if (DOM.sbFilterType) {
      DOM.sbFilterType.addEventListener("change", () => applySalaryBankFilters());
    }

    if (DOM.btnSbApplyFilter) {
      DOM.btnSbApplyFilter.addEventListener("click", () => applySalaryBankFilters());
    }

    if (DOM.btnSbResetFilter) {
      DOM.btnSbResetFilter.addEventListener("click", () => {
        DOM.sbFilterStartDate.value = "";
        DOM.sbFilterEndDate.value = "";
        if (DOM.sbFilterUnit) DOM.sbFilterUnit.value = "";
        if (DOM.sbFilterType) DOM.sbFilterType.value = "all";
        if (DOM.sbFilterSearch) DOM.sbFilterSearch.value = "";

        DOM.sbPresetBtns.forEach(b => b.classList.remove("active"));
        const allBtn = document.querySelector('.sb-preset-btn[data-preset="all"]');
        if (allBtn) allBtn.classList.add("active");

        applySalaryBankFilters();
      });
    }

    if (DOM.sbFilterSearch) {
      DOM.sbFilterSearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applySalaryBankFilters();
      });
    }

    // 6. Xóa khoản chi
    if (DOM.btnConfirmSbDelete) {
      DOM.btnConfirmSbDelete.addEventListener("click", async () => {
        const id = DOM.sbDeleteTargetId.value ? Number(DOM.sbDeleteTargetId.value) : null;
        if (!id) return;

        DOM.btnConfirmSbDelete.disabled = true;
        DOM.btnConfirmSbDelete.textContent = "Đang xóa...";

        try {
          await window.SalaryBankExpenseService.deleteExpense(id);
          showToast("Đã xóa khoản chi thành công.", "success");
          closeModal(DOM.modalSbDelete);

          // Nếu đang sửa chính dòng này trên inline form thì reset
          if (AppState.editingSalaryBankExpenseId === id) {
            resetInlineSbForm();
          }

          await applySalaryBankFilters();
        } catch (err) {
          console.error("Lỗi khi xóa khoản chi:", err);
          showToast("Không thể xóa khoản chi: " + (err.message || "Lỗi Supabase"), "error");
        } finally {
          DOM.btnConfirmSbDelete.disabled = false;
          DOM.btnConfirmSbDelete.textContent = "Xóa bản ghi";
        }
      });
    }
  }

  function resetInlineSbForm() {
    AppState.editingSalaryBankExpenseId = null;
    if (DOM.sbId) DOM.sbId.value = "";
    if (DOM.sbDate) DOM.sbDate.value = getTodayString();
    if (DOM.sbRecipient) DOM.sbRecipient.value = "";
    if (DOM.sbAmount) DOM.sbAmount.value = "";
    if (DOM.sbAmountPreview) DOM.sbAmountPreview.textContent = "0 ₫";
    if (DOM.sbSourceBank) DOM.sbSourceBank.value = "MB Bank";
    if (DOM.sbRecipientBank) DOM.sbRecipientBank.value = "";
    if (DOM.sbRecipientAccount) DOM.sbRecipientAccount.value = "";
    if (DOM.sbRef) DOM.sbRef.value = "";
    if (DOM.sbDesc) DOM.sbDesc.value = "";
    if (DOM.sbNotes) DOM.sbNotes.value = "";

    if (DOM.inlineSbFormTitle) {
      DOM.inlineSbFormTitle.innerHTML = `<span>💳 Nhập Chi Phí Lương & Chuyển Khoản Theo Mảng</span><span id="inline-sb-badge-mode" class="badge badge-neutral" style="font-size: 0.75rem;">Tạo mới</span>`;
    }
    if (DOM.btnSaveSalaryBank) {
      DOM.btnSaveSalaryBank.textContent = "💾 Lưu Khoản Chi vào Supabase";
    }
  }

  // ================= [FIX] DANH MỤC CHI LƯƠNG & CHUYỂN KHOẢN =================
  // Vẽ lại dropdown danh mục trong form Chi Lương & CK theo loại chi
  function renderSbCategoryOptions(type, selectedCategory = null) {
    if (!DOM.sbCategory) return;
    const list = window.SalaryBankExpenseService.getCategoriesForType(type || "bank_transfer");
    DOM.sbCategory.innerHTML = "";

    list.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.label;
      if (selectedCategory && selectedCategory === c.code) opt.selected = true;
      DOM.sbCategory.appendChild(opt);
    });

    // Bản ghi cũ dùng danh mục đã bị xóa/đổi loại → vẫn hiện để không mất dữ liệu khi sửa
    if (selectedCategory && !list.some(c => c.code === selectedCategory)) {
      const opt = document.createElement("option");
      opt.value = selectedCategory;
      opt.textContent = (window.SalaryBankExpenseService.CATEGORY_LABELS[selectedCategory] || selectedCategory) + " (không còn trong danh mục)";
      opt.selected = true;
      DOM.sbCategory.appendChild(opt);
    }
  }

  function isMissingTableError(err) {
    const msg = String(err?.message || "");
    return err?.code === "42P01" || err?.code === "PGRST205" || /salary_bank_categories/.test(msg) && /(does not exist|could not find)/i.test(msg);
  }

  // Tải danh mục từ Supabase → cập nhật bảng + dropdown
  async function loadSalaryCategories(opts = {}) {
    const silent = !!opts.silent;
    if (DOM.salaryCategoryTbody && !silent) {
      DOM.salaryCategoryTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">Đang tải danh mục...</td></tr>`;
    }
    try {
      AppState.salaryCategories = await window.SalaryBankExpenseService.getCategories();
      renderSalaryCategoryTable();
    } catch (err) {
      console.error("Lỗi tải danh mục chi lương & CK:", err);
      AppState.salaryCategories = [];
      const hint = isMissingTableError(err)
        ? "Chưa có bảng <code>salary_bank_categories</code> trên Supabase. Vui lòng chạy file SQL tạo bảng (đang dùng danh mục mặc định)."
        : "Không tải được danh mục: " + escapeHtml(err.message || "Lỗi database") + " (đang dùng danh mục mặc định).";
      if (DOM.salaryCategoryTbody) {
        DOM.salaryCategoryTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger, #dc2626); padding: 1.5rem;">${hint}</td></tr>`;
      }
      if (!silent) showToast(isMissingTableError(err) ? "Chưa tạo bảng danh mục trên Supabase." : "Lỗi tải danh mục: " + (err.message || ""), "error");
    }
    // Luôn làm mới dropdown form Chi Lương (giữ lựa chọn hiện tại nếu có)
    renderSbCategoryOptions(DOM.sbType ? DOM.sbType.value : "bank_transfer", DOM.sbCategory ? DOM.sbCategory.value : null);
  }

  function renderSalaryCategoryTable() {
    if (!DOM.salaryCategoryTbody) return;
    const list = AppState.salaryCategories || [];
    if (list.length === 0) {
      DOM.salaryCategoryTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">Chưa có danh mục nào. Bấm "+ Thêm danh mục" để tạo.</td></tr>`;
      return;
    }

    const canEdit = window.SystemService.canEdit();
    const canDelete = window.SystemService.canDelete();
    const typeLabels = window.SalaryBankExpenseService.EXPENSE_TYPE_LABELS;

    DOM.salaryCategoryTbody.innerHTML = list.map(c => `
      <tr>
        <td style="font-family: monospace;">${escapeHtml(c.code)}</td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(c.label)}</div>
          <small style="color: var(--text-muted);">${escapeHtml(typeLabels[c.expense_type] || c.expense_type)}</small>
        </td>
        <td><small style="color: var(--text-muted);">${escapeHtml(c.created_by_email || "Hệ thống")}</small></td>
        <td style="white-space: nowrap;">
          ${canEdit ? `<button type="button" class="btn btn-outline btn-sm" data-cat-action="edit" data-code="${escapeHtml(c.code)}">✏️ Sửa</button>` : ""}
          ${canDelete ? `<button type="button" class="btn btn-outline btn-sm" data-cat-action="delete" data-code="${escapeHtml(c.code)}">🗑️ Xóa</button>` : ""}
        </td>
      </tr>
    `).join("");
  }

  function openSalaryCategoryModal(cat = null) {
    if (!DOM.modalSalaryCategory) return;
    const typeSelect = document.getElementById("sb-category-type");
    AppState.editingSalaryCategoryCode = cat ? cat.code : null;

    if (DOM.inputCategoryCode) {
      DOM.inputCategoryCode.value = cat ? cat.code : "";
      DOM.inputCategoryCode.readOnly = !!cat; // Không cho đổi mã vì các khoản chi đang tham chiếu theo mã
    }
    if (DOM.inputCategoryLabel) DOM.inputCategoryLabel.value = cat ? cat.label : "";
    if (typeSelect) typeSelect.value = cat ? cat.expense_type : "salary";
    if (DOM.modalSalaryCategoryTitle) {
      DOM.modalSalaryCategoryTitle.textContent = cat ? `✏️ Sửa danh mục: ${cat.code}` : "➕ Thêm danh mục chi lương & CK";
    }
    openModal(DOM.modalSalaryCategory);
  }

  function setupSalaryCategoryEvents() {
    if (!DOM.viewSalaryCategories) return;

    // Chuẩn hóa modal: index.html đặt class "modal hidden" và nằm trong view,
    // trong khi các modal khác dùng "modal-overlay" + openModal() thêm class "active".
    if (DOM.modalSalaryCategory) {
      DOM.modalSalaryCategory.className = "modal-overlay";
      document.body.appendChild(DOM.modalSalaryCategory);
    }

    // Bổ sung ô chọn "Loại chi" vào form (form gốc chỉ có Mã + Nhãn)
    if (DOM.formSalaryCategory && !document.getElementById("sb-category-type")) {
      const group = document.createElement("div");
      group.className = "form-group";
      group.innerHTML = `
        <label for="sb-category-type">Áp dụng cho loại chi</label>
        <select id="sb-category-type" class="form-control">
          <option value="salary">👥 Chi lương</option>
          <option value="bank_transfer">🏦 Chi chuyển khoản</option>
          <option value="both">↔️ Dùng chung cả hai</option>
        </select>`;
      const anchor = DOM.btnSaveSalaryCategory ? DOM.btnSaveSalaryCategory.closest(".form-group, .modal-footer, div") : null;
      if (anchor && anchor !== DOM.formSalaryCategory && DOM.formSalaryCategory.contains(anchor)) {
        anchor.parentNode.insertBefore(group, anchor);
      } else {
        DOM.formSalaryCategory.insertBefore(group, DOM.btnSaveSalaryCategory || null);
      }
    }

    if (DOM.btnAddSalaryCategory) {
      DOM.btnAddSalaryCategory.addEventListener("click", () => {
        if (!window.SystemService.canCreate()) {
          showToast("Tài khoản của bạn không có quyền Thêm dữ liệu.", "warning");
          return;
        }
        openSalaryCategoryModal(null);
      });
    }

    if (DOM.closeSalaryCategoryModal) {
      DOM.closeSalaryCategoryModal.addEventListener("click", () => closeModal(DOM.modalSalaryCategory));
    }
    if (DOM.modalSalaryCategory) {
      DOM.modalSalaryCategory.addEventListener("click", (e) => {
        if (e.target === DOM.modalSalaryCategory) closeModal(DOM.modalSalaryCategory);
      });
    }

    if (DOM.formSalaryCategory) {
      DOM.formSalaryCategory.addEventListener("submit", async (e) => {
        e.preventDefault();
        const isEdit = !!AppState.editingSalaryCategoryCode;
        const typeSelect = document.getElementById("sb-category-type");
        const formData = {
          code: isEdit ? AppState.editingSalaryCategoryCode : DOM.inputCategoryCode.value,
          label: DOM.inputCategoryLabel.value,
          expense_type: typeSelect ? typeSelect.value : "bank_transfer"
        };

        const btn = DOM.btnSaveSalaryCategory;
        if (btn) { btn.disabled = true; btn.textContent = "Đang lưu..."; }
        try {
          await window.SalaryBankExpenseService.saveCategory(formData, isEdit);
          showToast(isEdit ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới.", "success");
          closeModal(DOM.modalSalaryCategory);
          await loadSalaryCategories();
        } catch (err) {
          console.error(err);
          showToast(isMissingTableError(err) ? "Chưa tạo bảng salary_bank_categories trên Supabase." : (err.message || "Lỗi lưu danh mục"), "error");
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = "Lưu"; }
        }
      });
    }

    // Sửa / Xóa trong bảng (event delegation)
    if (DOM.salaryCategoryTbody) {
      DOM.salaryCategoryTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-cat-action]");
        if (!btn) return;
        const code = btn.dataset.code;
        const cat = (AppState.salaryCategories || []).find(c => c.code === code);
        if (!cat) return;

        if (btn.dataset.catAction === "edit") {
          if (!window.SystemService.canEdit()) {
            showToast("Tài khoản của bạn không có quyền Chỉnh sửa dữ liệu.", "warning");
            return;
          }
          openSalaryCategoryModal(cat);
        } else if (btn.dataset.catAction === "delete") {
          if (!window.SystemService.canDelete()) {
            showToast("Tài khoản của bạn không có quyền Xóa dữ liệu.", "warning");
            return;
          }
          if (!confirm(`Xóa danh mục "${cat.label}" (${cat.code})?`)) return;
          try {
            await window.SalaryBankExpenseService.deleteCategory(code);
            showToast("Đã xóa danh mục.", "success");
            await loadSalaryCategories();
          } catch (err) {
            console.error(err);
            showToast(err.message || "Lỗi xóa danh mục", "error");
          }
        }
      });
    }
  }

  function populateInlineSbForm(record) {
    AppState.editingSalaryBankExpenseId = record.id;
    if (DOM.sbId) DOM.sbId.value = record.id;
    if (DOM.sbDate) DOM.sbDate.value = record.expense_date;
    if (DOM.sbUnit) DOM.sbUnit.value = record.business_unit_id;

    // Type
    const type = record.expense_type || "bank_transfer";
    if (DOM.sbType) DOM.sbType.value = type;
    if (type === "salary") {
      if (DOM.btnSbTypeSalary) DOM.btnSbTypeSalary.classList.add("active", "type-expense");
      if (DOM.btnSbTypeTransfer) DOM.btnSbTypeTransfer.classList.remove("active", "type-expense");
    } else {
      if (DOM.btnSbTypeTransfer) DOM.btnSbTypeTransfer.classList.add("active", "type-expense");
      if (DOM.btnSbTypeSalary) DOM.btnSbTypeSalary.classList.remove("active", "type-expense");
    }

    // Category (đọc từ danh mục đã tải)
    renderSbCategoryOptions(type, record.expense_category);

    if (DOM.sbRecipient) DOM.sbRecipient.value = record.recipient_name || "";
    if (DOM.sbAmount) DOM.sbAmount.value = record.amount || "";
    if (DOM.sbAmountPreview) DOM.sbAmountPreview.textContent = window.DashboardManager.formatVND(record.amount || 0);
    if (DOM.sbSourceBank) DOM.sbSourceBank.value = record.source_bank || "MB Bank";
    if (DOM.sbRecipientBank) DOM.sbRecipientBank.value = record.recipient_bank || "";
    if (DOM.sbRecipientAccount) DOM.sbRecipientAccount.value = record.recipient_account || "";
    if (DOM.sbRef) DOM.sbRef.value = record.reference_no || "";
    if (DOM.sbDesc) DOM.sbDesc.value = record.description || "";
    if (DOM.sbNotes) DOM.sbNotes.value = record.notes || "";

    if (DOM.inlineSbFormTitle) {
      DOM.inlineSbFormTitle.innerHTML = `<span>✏️ Chỉnh Sửa Khoản Chi #${record.id}</span><span id="inline-sb-badge-mode" class="badge badge-warning" style="font-size: 0.75rem;">Đang sửa</span>`;
    }
    if (DOM.btnSaveSalaryBank) {
      DOM.btnSaveSalaryBank.textContent = "💾 Cập nhật Khoản Chi";
    }
  }

  function applySbDatePreset(preset) {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    if (preset === "today") {
      const dStr = getTodayString();
      DOM.sbFilterStartDate.value = dStr;
      DOM.sbFilterEndDate.value = dStr;
    } else if (preset === "month") {
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      DOM.sbFilterStartDate.value = formatDateIso(firstDay);
      DOM.sbFilterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "quarter") {
      const qMonth = Math.floor(m / 3) * 3;
      const firstDay = new Date(y, qMonth, 1);
      const lastDay = new Date(y, qMonth + 3, 0);
      DOM.sbFilterStartDate.value = formatDateIso(firstDay);
      DOM.sbFilterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "all") {
      DOM.sbFilterStartDate.value = "";
      DOM.sbFilterEndDate.value = "";
    }
  }

  async function applySalaryBankFilters() {
    if (!window.SalaryBankExpenseService) return;

    const filters = {
      startDate: DOM.sbFilterStartDate ? DOM.sbFilterStartDate.value || null : null,
      endDate: DOM.sbFilterEndDate ? DOM.sbFilterEndDate.value || null : null,
      businessUnitId: DOM.sbFilterUnit && DOM.sbFilterUnit.value ? Number(DOM.sbFilterUnit.value) : null,
      expenseType: DOM.sbFilterType ? DOM.sbFilterType.value || "all" : "all",
      search: DOM.sbFilterSearch ? DOM.sbFilterSearch.value.trim() : null
    };

    if (DOM.sbTableLoading) DOM.sbTableLoading.classList.remove("hidden");
    if (DOM.sbTableEmpty) DOM.sbTableEmpty.classList.add("hidden");

    try {
      const expenses = await window.SalaryBankExpenseService.getExpenses(filters);
      AppState.currentSalaryBankExpenses = expenses;

      const summary = window.SalaryBankExpenseService.calculateSummary(expenses);
      updateSalaryBankKpiCards(summary);
      renderSalaryBankTable(expenses);
    } catch (err) {
      console.error("Lỗi khi tải sổ chi lương và chuyển khoản:", err);
      showToast("Lỗi khi tải dữ liệu chi phí: " + (err.message || "Kiểm tra RLS Supabase"), "error");
    } finally {
      if (DOM.sbTableLoading) DOM.sbTableLoading.classList.add("hidden");
    }
  }

  function updateSalaryBankKpiCards(summary) {
    if (!summary) return;

    if (DOM.sbKpiTotal) {
      DOM.sbKpiTotal.textContent = window.DashboardManager.formatVND(summary.totalAmount);
    }
    if (DOM.sbKpiSubStats) {
      DOM.sbKpiSubStats.textContent = `Lương: ${window.DashboardManager.formatVND(summary.totalSalary)} | CK khác: ${window.DashboardManager.formatVND(summary.totalBankTransfer)}`;
    }

    const sm = summary.unitsSummary.SON_MAI || { amount: 0, count: 0 };
    if (DOM.sbKpiSonmai) DOM.sbKpiSonmai.textContent = window.DashboardManager.formatVND(sm.amount);
    if (DOM.sbKpiSonmaiCount) DOM.sbKpiSonmaiCount.textContent = `${sm.count} khoản chi`;

    const fnb = summary.unitsSummary.FNB || { amount: 0, count: 0 };
    if (DOM.sbKpiFnb) DOM.sbKpiFnb.textContent = window.DashboardManager.formatVND(fnb.amount);
    if (DOM.sbKpiFnbCount) DOM.sbKpiFnbCount.textContent = `${fnb.count} khoản chi`;

    const vp = summary.unitsSummary.VAN_PHONG || { amount: 0, count: 0 };
    if (DOM.sbKpiVanphong) DOM.sbKpiVanphong.textContent = window.DashboardManager.formatVND(vp.amount);
    if (DOM.sbKpiVanphongCount) DOM.sbKpiVanphongCount.textContent = `${vp.count} khoản chi`;
  }

  function renderSalaryBankTable(expenses) {
    if (!DOM.sbTbody) return;
    DOM.sbTbody.innerHTML = "";

    if (!expenses || expenses.length === 0) {
      if (DOM.sbTableEmpty) DOM.sbTableEmpty.classList.remove("hidden");
      return;
    }

    if (DOM.sbTableEmpty) DOM.sbTableEmpty.classList.add("hidden");

    const categoryLabels = window.SalaryBankExpenseService.CATEGORY_LABELS || {};

    expenses.forEach(e => {
      const tr = document.createElement("tr");

      const uCode = e.business_units?.code || "OTHER";
      let unitBadge = `<span class="badge badge-neutral">${escapeHtml(e.business_units?.name || "Khác")}</span>`;
      if (uCode === "SON_MAI") {
        unitBadge = `<span class="badge badge-sonmai">SƠN MÀI</span>`;
      } else if (uCode === "FNB") {
        unitBadge = `<span class="badge badge-fnb">F&B</span>`;
      } else if (uCode === "VAN_PHONG") {
        unitBadge = `<span class="badge badge-office">VĂN PHÒNG</span>`;
      }

      const isSalary = e.expense_type === "salary";
      const catText = categoryLabels[e.expense_category] || e.expense_category || "Chi phí";
      const catBadge = isSalary
        ? `<span class="badge" style="background: #ede9fe; color: #6d28d9;">👥 ${catText}</span>`
        : `<span class="badge badge-neutral">🏦 ${catText}</span>`;

      const amt = Number(e.amount) || 0;
      const bankInfo = e.recipient_bank
        ? `<strong>${escapeHtml(e.recipient_bank)}</strong><br><span style="font-family: monospace; font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(e.recipient_account || "")}</span>`
        : `<span style="color: var(--text-muted); font-size: 0.82rem;">${escapeHtml(e.recipient_account || "N/A")}</span>`;

      tr.innerHTML = `
        <td style="font-weight: 600;">${formatDateVN(e.expense_date)}</td>
        <td>${unitBadge}</td>
        <td>${catBadge}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(e.recipient_name)}</div>
          <small style="color: var(--text-muted);">Trích từ: ${escapeHtml(e.source_bank || "MB Bank")}</small>
        </td>
        <td style="text-align: right; font-weight: 700; color: var(--expense-red); font-size: 0.95rem;">
          ${window.DashboardManager.formatVND(amt)}
        </td>
        <td>${bankInfo}</td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(e.description || "—")}</div>
          ${e.reference_no ? `<small style="font-family: monospace; color: #2563eb; background: #eff6ff; padding: 2px 5px; border-radius: 3px;">Mã: ${escapeHtml(e.reference_no)}</small>` : ""}
          ${e.notes ? `<br><small style="color: var(--text-muted);">Ghi chú: ${escapeHtml(e.notes)}</small>` : ""}
        </td>
        <td style="text-align: center;">
          <div class="action-btns" style="justify-content: center;">
            <button class="btn btn-sm btn-outline btn-edit-sb" data-id="${e.id}" title="Sửa khoản chi">✏️</button>
            <button class="btn btn-sm btn-outline btn-delete-sb" data-id="${e.id}" title="Xóa khoản chi" style="color: var(--expense-red);">🗑️</button>
          </div>
        </td>
      `;

      DOM.sbTbody.appendChild(tr);
    });

    // Sự kiện Sửa & Xóa
    DOM.sbTbody.querySelectorAll(".btn-edit-sb").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!window.SystemService.canEdit()) {
          showToast("Tài khoản của bạn không có quyền Chỉnh sửa dữ liệu. Vui lòng liên hệ Admin.", "warning");
          return;
        }

        const id = Number(btn.getAttribute("data-id"));
        const record = AppState.currentSalaryBankExpenses.find(x => x.id === id);
        if (record) {
          populateInlineSbForm(record);
          if (DOM.inlineSbFormCard) {
            DOM.inlineSbFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          if (DOM.sbAmount) DOM.sbAmount.focus();
          showToast(`Đang chỉnh sửa khoản chi #${id} trên form.`, "info");
        }
      });
    });

    DOM.sbTbody.querySelectorAll(".btn-delete-sb").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!window.SystemService.canDelete()) {
          showToast("Tài khoản của bạn không có quyền Xóa dữ liệu. Vui lòng liên hệ Admin.", "warning");
          return;
        }

        const id = Number(btn.getAttribute("data-id"));
        if (DOM.sbDeleteTargetId) DOM.sbDeleteTargetId.value = id;
        openModal(DOM.modalSbDelete);
      });
    });
  }

  // ================= EXCEL TEMPLATES & IMPORT EVENTS =================
  function setupExcelImportEvents() {
    if (!DOM.modalExcelImport) return;

    // 1. Mở modal từ nút trên Header
    if (DOM.btnOpenExcelModal) {
      DOM.btnOpenExcelModal.addEventListener("click", () => {
        resetExcelImportModal();
        openModal(DOM.modalExcelImport);
      });
    }

    // 2. Mở modal từ các nút "📥 Import Excel" ở từng View
    if (DOM.btnTriggerImports) {
      DOM.btnTriggerImports.forEach(btn => {
        btn.addEventListener("click", () => {
          const importType = btn.getAttribute("data-import-type") || "transactions";
          resetExcelImportModal();
          if (DOM.excelTargetType) DOM.excelTargetType.value = importType;
          openModal(DOM.modalExcelImport);
        });
      });
    }

    // 2b. Tải tệp Excel mẫu chuẩn kèm Droplist
    document.querySelectorAll(".btn-download-template").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const type = btn.getAttribute("data-template-type") || "salary_bank";
        try {
          window.ExcelImportService.downloadTemplate(type);
          showToast(`Đã tải xuống file mẫu "${type}" có sẵn droplist!`, "success");
        } catch (err) {
          console.error("Lỗi tải template:", err);
          showToast("Không thể tải file mẫu: " + err.message, "error");
        }
      });
    });

    // 3. Reset trạng thái khi đổi loại import hoặc chọn file
    if (DOM.excelTargetType) {
      DOM.excelTargetType.addEventListener("change", () => {
        if (DOM.excelPreviewBox) DOM.excelPreviewBox.classList.add("hidden");
        if (DOM.excelErrorBox) DOM.excelErrorBox.classList.add("hidden");
      });
    }

    if (DOM.excelFileInput) {
      DOM.excelFileInput.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (DOM.excelPreviewBox) DOM.excelPreviewBox.classList.add("hidden");
        if (DOM.excelErrorBox) DOM.excelErrorBox.classList.add("hidden");

        try {
          const rows = await window.ExcelImportService.parseExcelFile(file);
          if (DOM.excelPreviewBox && DOM.excelPreviewText) {
            DOM.excelPreviewText.textContent = `✅ Đã đọc tệp: "${file.name}" — tìm thấy ${rows.length} dòng dữ liệu.`;
            DOM.excelPreviewBox.classList.remove("hidden");
          }
        } catch (err) {
          if (DOM.excelErrorBox && DOM.excelErrorText) {
            DOM.excelErrorText.textContent = `❌ ${err.message}`;
            DOM.excelErrorBox.classList.remove("hidden");
          }
        }
      });
    }

    // 4. Bắt đầu Import
    if (DOM.btnSubmitExcelImport) {
      DOM.btnSubmitExcelImport.addEventListener("click", async () => {
        const file = DOM.excelFileInput && DOM.excelFileInput.files && DOM.excelFileInput.files[0];
        if (!file) {
          showToast("Vui lòng chọn một file Excel (.xlsx) trước khi bấm Import.", "warning");
          if (DOM.excelFileInput) DOM.excelFileInput.focus();
          return;
        }

        const targetType = DOM.excelTargetType ? DOM.excelTargetType.value : "transactions";

        DOM.btnSubmitExcelImport.disabled = true;
        DOM.btnSubmitExcelImport.textContent = "Đang xử lý import...";
        if (DOM.excelErrorBox) DOM.excelErrorBox.classList.add("hidden");

        try {
          const rows = await window.ExcelImportService.parseExcelFile(file);
          if (!rows || rows.length === 0) {
            throw new Error("Tệp Excel rỗng hoặc không có dữ liệu ở Sheet đầu tiên.");
          }

          let result;
          if (targetType === "transactions") {
            result = await window.ExcelImportService.importTransactions(
              rows,
              AppState.businessUnits,
              AppState.categories
            );
            await applyFilters();
          } else if (targetType === "fnb_reconciliation") {
            result = await window.ExcelImportService.importFnbReconciliations(rows);
            await applyFnbFilters();
          } else if (targetType === "salary_bank") {
            result = await window.ExcelImportService.importSalaryBankExpenses(
              rows,
              AppState.businessUnits
            );
            await applySalaryBankFilters();
          }

          let msg = `🎉 Import thành công ${result.successCount}/${result.totalRows} bản ghi vào Supabase!`;
          showToast(msg, "success");

          if (result.errors && result.errors.length > 0) {
            if (DOM.excelErrorBox && DOM.excelErrorText) {
              DOM.excelErrorText.textContent = `⚠️ Đã nhập ${result.successCount} dòng. Lưu ý các dòng sau bị bỏ qua:\n` + result.errors.slice(0, 10).join("\n");
              DOM.excelErrorBox.classList.remove("hidden");
            }
          } else {
            closeModal(DOM.modalExcelImport);
          }
        } catch (err) {
          console.error("Lỗi khi import Excel:", err);
          showToast("Import thất bại: " + err.message, "error");
          if (DOM.excelErrorBox && DOM.excelErrorText) {
            DOM.excelErrorText.textContent = `❌ ${err.message}`;
            DOM.excelErrorBox.classList.remove("hidden");
          }
        } finally {
          DOM.btnSubmitExcelImport.disabled = false;
          DOM.btnSubmitExcelImport.textContent = "🚀 Bắt đầu Import vào Supabase";
        }
      });
    }
  }

  function resetExcelImportModal() {
    if (DOM.excelFileInput) DOM.excelFileInput.value = "";
    if (DOM.excelPreviewBox) DOM.excelPreviewBox.classList.add("hidden");
    if (DOM.excelErrorBox) DOM.excelErrorBox.classList.add("hidden");
    if (DOM.btnSubmitExcelImport) {
      DOM.btnSubmitExcelImport.disabled = false;
      DOM.btnSubmitExcelImport.textContent = "🚀 Bắt đầu Import vào Supabase";
    }
  }

  // ================= SYSTEM & USER MANAGEMENT LOGIC =================
  async function loadSystemUsers() {
    if (!window.SystemService) return;

    if (DOM.sysTableLoading) DOM.sysTableLoading.classList.remove("hidden");
    if (DOM.sysTableEmpty) DOM.sysTableEmpty.classList.add("hidden");

    try {
      const users = await window.SystemService.getAllUsers();
      AppState.allUsers = users;
      updateSystemKpis(users);
      renderSystemUsersTable(users);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      showToast("Lỗi khi tải người dùng: " + (err.message || "Kiểm tra quyền RLS"), "error");
    } finally {
      if (DOM.sysTableLoading) DOM.sysTableLoading.classList.add("hidden");
    }
  }

  function updateSystemKpis(users = []) {
    const total = users.length;
    const adminCount = users.filter(u => u.role === "admin").length;
    const mgrCount = users.filter(u => u.role === "manager" || u.role === "accountant").length;
    const activeCount = users.filter(u => u.is_active).length;

    if (DOM.sysKpiTotalUsers) DOM.sysKpiTotalUsers.textContent = total;
    if (DOM.sysKpiAdminCount) DOM.sysKpiAdminCount.textContent = adminCount;
    if (DOM.sysKpiManagerCount) DOM.sysKpiManagerCount.textContent = mgrCount;
    if (DOM.sysKpiActiveCount) DOM.sysKpiActiveCount.textContent = activeCount;
  }

  function renderSystemUsersTable(users = []) {
    if (!DOM.sysUsersTbody) return;
    DOM.sysUsersTbody.innerHTML = "";

    if (!users || users.length === 0) {
      if (DOM.sysTableEmpty) DOM.sysTableEmpty.classList.remove("hidden");
      return;
    }

    if (DOM.sysTableEmpty) DOM.sysTableEmpty.classList.add("hidden");

    const rolesMap = window.SystemService.ROLES || {};
    const isAdmin = window.SystemService.isAdmin();

    users.forEach(u => {
      const tr = document.createElement("tr");

      const roleInfo = rolesMap[u.role] || { name: u.role, badge: "badge-neutral" };
      const statusBadge = u.is_active
        ? '<span class="badge badge-matched">Hoạt động</span>'
        : '<span class="badge badge-danger">Đã khóa</span>';

      // Tạo badges cho trang được phép truy cập
      const pageTags = [];
      if (u.can_access_transactions) pageTags.push('<span class="badge badge-neutral" style="font-size: 0.72rem;">📑 Thu Chi</span>');
      if (u.can_access_fnb) pageTags.push('<span class="badge badge-fnb" style="font-size: 0.72rem;">⚖️ F&B</span>');
      if (u.can_access_salary_bank) pageTags.push('<span class="badge" style="font-size: 0.72rem; background: #ede9fe; color: #6d28d9;">💳 Lương & CK</span>');
      if (u.can_access_system) pageTags.push('<span class="badge badge-danger" style="font-size: 0.72rem;">⚙️ Hệ thống</span>');

      // Tạo badges cho thao tác
      const actionTags = [];
      if (u.can_create) actionTags.push('<span class="badge badge-success" style="font-size: 0.72rem;">+ Thêm</span>');
      if (u.can_edit) actionTags.push('<span class="badge badge-primary" style="font-size: 0.72rem;">✏️ Sửa</span>');
      if (u.can_delete) actionTags.push('<span class="badge badge-danger" style="font-size: 0.72rem;">🗑️ Xóa</span>');
      if (u.can_import) actionTags.push('<span class="badge badge-office" style="font-size: 0.72rem;">📥 Import</span>');

      const isCurrentMe = window.AuthManager.currentUser?.id === u.id;

      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--text-main);">
            ${escapeHtml(u.full_name || u.email.split("@")[0])}
            ${isCurrentMe ? '<span class="badge badge-primary" style="font-size: 0.7rem; margin-left: 4px;">Bạn</span>' : ''}
          </div>
          <small style="color: var(--text-muted); font-family: monospace;">${escapeHtml(u.email)}</small>
        </td>
        <td style="text-align: center;">
          <span class="badge ${roleInfo.badge}">${escapeHtml(roleInfo.name)}</span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${pageTags.length > 0 ? pageTags.join(" ") : '<span style="color: var(--text-muted); font-size: 0.8rem;">Không có</span>'}
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${actionTags.length > 0 ? actionTags.join(" ") : '<span style="color: var(--text-muted); font-size: 0.8rem;">Chỉ xem</span>'}
          </div>
        </td>
        <td style="text-align: center;">
          ${statusBadge}
        </td>
        <td style="text-align: center;">
          <div class="action-btns" style="justify-content: center;">
            <button class="btn btn-sm btn-outline btn-edit-user" data-id="${u.id}" title="Phân quyền & Chỉnh sửa">
              ⚙️ Phân quyền
            </button>
          </div>
        </td>
      `;

      DOM.sysUsersTbody.appendChild(tr);
    });

    // Gắn sự kiện nút mở Modal Phân Quyền
    DOM.sysUsersTbody.querySelectorAll(".btn-edit-user").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const user = AppState.allUsers.find(u => u.id === id);
        if (user) {
          openEditUserModal(user);
        }
      });
    });
  }

  function openEditUserModal(user) {
    if (!DOM.modalEditUser) return;

    if (DOM.userEditId) DOM.userEditId.value = user.id;
    if (DOM.userEditEmail) DOM.userEditEmail.value = user.email || "";
    if (DOM.userEditName) DOM.userEditName.value = user.full_name || "";
    if (DOM.userEditRole) DOM.userEditRole.value = user.role || "staff";
    if (DOM.userEditStatus) DOM.userEditStatus.value = user.is_active ? "active" : "inactive";
    if (DOM.userEditNotes) DOM.userEditNotes.value = user.notes || "";

    // Pages
    if (DOM.permPageTx) DOM.permPageTx.checked = !!user.can_access_transactions;
    if (DOM.permPageFnb) DOM.permPageFnb.checked = !!user.can_access_fnb;
    if (DOM.permPageSb) DOM.permPageSb.checked = !!user.can_access_salary_bank;
    if (DOM.permPageSys) DOM.permPageSys.checked = !!user.can_access_system;

    // Actions
    if (DOM.permActionCreate) DOM.permActionCreate.checked = !!user.can_create;
    if (DOM.permActionEdit) DOM.permActionEdit.checked = !!user.can_edit;
    if (DOM.permActionDelete) DOM.permActionDelete.checked = !!user.can_delete;
    if (DOM.permActionImport) DOM.permActionImport.checked = !!user.can_import;

    // Khi chọn Admin, tự động tích toàn bộ
    if (DOM.userEditRole) {
      DOM.userEditRole.onchange = () => {
        if (DOM.userEditRole.value === "admin") {
          if (DOM.permPageTx) DOM.permPageTx.checked = true;
          if (DOM.permPageFnb) DOM.permPageFnb.checked = true;
          if (DOM.permPageSb) DOM.permPageSb.checked = true;
          if (DOM.permPageSys) DOM.permPageSys.checked = true;
          if (DOM.permActionCreate) DOM.permActionCreate.checked = true;
          if (DOM.permActionEdit) DOM.permActionEdit.checked = true;
          if (DOM.permActionDelete) DOM.permActionDelete.checked = true;
          if (DOM.permActionImport) DOM.permActionImport.checked = true;
        }
      };
    }

    if (DOM.modalEditUserTitle) {
      DOM.modalEditUserTitle.textContent = `⚙️ Phân Quyền Cho: ${user.email}`;
    }

    openModal(DOM.modalEditUser);
  }

  function resetCreateUserForm() {
    if (DOM.formCreateUser) DOM.formCreateUser.reset();
    if (DOM.createUserEmail) DOM.createUserEmail.value = "";
    if (DOM.createUserPassword) DOM.createUserPassword.value = "";
    if (DOM.createUserName) DOM.createUserName.value = "";
    if (DOM.createUserRole) DOM.createUserRole.value = "staff";
    if (DOM.createPermPageTx) DOM.createPermPageTx.checked = true;
    if (DOM.createPermPageFnb) DOM.createPermPageFnb.checked = true;
    if (DOM.createPermPageSb) DOM.createPermPageSb.checked = false;
    if (DOM.createPermPageSys) DOM.createPermPageSys.checked = false;
    if (DOM.createPermActionCreate) DOM.createPermActionCreate.checked = true;
    if (DOM.createPermActionEdit) DOM.createPermActionEdit.checked = false;
    if (DOM.createPermActionDelete) DOM.createPermActionDelete.checked = false;
    if (DOM.createPermActionImport) DOM.createPermActionImport.checked = false;
    if (DOM.createUserNotes) DOM.createUserNotes.value = "";
    if (DOM.btnSubmitCreateUser) {
      DOM.btnSubmitCreateUser.disabled = false;
      DOM.btnSubmitCreateUser.textContent = "➕ Tạo Tài Khoản Mới";
    }
  }

  function setupSystemEvents() {
    // Nút mở modal tạo tài khoản mới
    if (DOM.btnAddUser) {
      DOM.btnAddUser.addEventListener("click", () => {
        if (!window.SystemService.isAdmin()) {
          showToast("Chỉ Admin mới được tạo tài khoản mới.", "error");
          return;
        }
        resetCreateUserForm();
        openModal(DOM.modalCreateUser);
      });
    }

    // Auto-check tất cả quyền khi chọn vai trò Admin trong form tạo mới
    if (DOM.createUserRole) {
      DOM.createUserRole.addEventListener("change", () => {
        if (DOM.createUserRole.value === "admin") {
          if (DOM.createPermPageTx) DOM.createPermPageTx.checked = true;
          if (DOM.createPermPageFnb) DOM.createPermPageFnb.checked = true;
          if (DOM.createPermPageSb) DOM.createPermPageSb.checked = true;
          if (DOM.createPermPageSys) DOM.createPermPageSys.checked = true;
          if (DOM.createPermActionCreate) DOM.createPermActionCreate.checked = true;
          if (DOM.createPermActionEdit) DOM.createPermActionEdit.checked = true;
          if (DOM.createPermActionDelete) DOM.createPermActionDelete.checked = true;
          if (DOM.createPermActionImport) DOM.createPermActionImport.checked = true;
        }
      });
    }

    // Xử lý submit form tạo tài khoản mới
    if (DOM.formCreateUser) {
      DOM.formCreateUser.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = (DOM.createUserEmail?.value || "").trim();
        const password = DOM.createUserPassword?.value || "";
        const fullName = (DOM.createUserName?.value || "").trim();
        const role = DOM.createUserRole?.value || "staff";

        if (!email || !email.includes("@")) {
          showToast("Vui lòng nhập email hợp lệ.", "error");
          return;
        }
        if (!password || password.length < 6) {
          showToast("Mật khẩu phải có tối thiểu 6 ký tự.", "error");
          return;
        }

        const userData = {
          email,
          password,
          full_name: fullName || email.split("@")[0],
          role,
          can_access_transactions: !!DOM.createPermPageTx?.checked,
          can_access_fnb: !!DOM.createPermPageFnb?.checked,
          can_access_salary_bank: !!DOM.createPermPageSb?.checked,
          can_access_system: !!DOM.createPermPageSys?.checked,
          can_create: !!DOM.createPermActionCreate?.checked,
          can_edit: !!DOM.createPermActionEdit?.checked,
          can_delete: !!DOM.createPermActionDelete?.checked,
          can_import: !!DOM.createPermActionImport?.checked,
          notes: (DOM.createUserNotes?.value || "").trim() || null
        };

        DOM.btnSubmitCreateUser.disabled = true;
        DOM.btnSubmitCreateUser.textContent = "⏳ Đang tạo tài khoản...";

        try {
          await window.SystemService.createUserByAdmin(userData);
          showToast(`🎉 Đã tạo tài khoản "${email}" thành công!`, "success");
          closeModal(DOM.modalCreateUser);
          await loadSystemUsers();
        } catch (err) {
          console.error("Lỗi tạo tài khoản:", err);
          showToast("Lỗi tạo tài khoản: " + (err.message || "Vui lòng thử lại"), "error");
        } finally {
          if (DOM.btnSubmitCreateUser) {
            DOM.btnSubmitCreateUser.disabled = false;
            DOM.btnSubmitCreateUser.textContent = "➕ Tạo Tài Khoản Mới";
          }
        }
      });
    }

    if (DOM.btnRefreshUsers) {
      DOM.btnRefreshUsers.addEventListener("click", () => {
        loadSystemUsers();
        showToast("Đã làm mới danh sách người dùng.", "info");
      });
    }

    if (DOM.formEditUser) {
      DOM.formEditUser.addEventListener("submit", async (e) => {
        e.preventDefault();

        const userId = DOM.userEditId.value;
        if (!userId) return;

        const updateData = {
          full_name: DOM.userEditName.value.trim(),
          role: DOM.userEditRole.value,
          is_active: DOM.userEditStatus.value === "active",
          can_access_transactions: DOM.permPageTx.checked,
          can_access_fnb: DOM.permPageFnb.checked,
          can_access_salary_bank: DOM.permPageSb.checked,
          can_access_system: DOM.permPageSys.checked,
          can_create: DOM.permActionCreate.checked,
          can_edit: DOM.permActionEdit.checked,
          can_delete: DOM.permActionDelete.checked,
          can_import: DOM.permActionImport.checked,
          notes: DOM.userEditNotes.value.trim()
        };

        DOM.btnSaveUserPerm.disabled = true;
        DOM.btnSaveUserPerm.textContent = "Đang lưu phân quyền...";

        try {
          await window.SystemService.updateUserProfile(userId, updateData);
          showToast("Đã cập nhật phân quyền người dùng thành công!", "success");
          closeModal(DOM.modalEditUser);

          // Nếu đang cập nhật chính mình thì áp dụng lại UI ngay
          if (window.AuthManager.currentUser?.id === userId) {
            applyUserPermissionsToUI();
          }

          await loadSystemUsers();
        } catch (err) {
          console.error("Lỗi cập nhật quyền:", err);
          showToast("Không thể lưu phân quyền: " + (err.message || "Lỗi Supabase"), "error");
        } finally {
          DOM.btnSaveUserPerm.disabled = false;
          DOM.btnSaveUserPerm.textContent = "💾 Lưu Phân Quyền";
        }
      });
    }
  }

  // ================= COMPREHENSIVE FINANCIAL REPORT LOGIC =================
  let currentReportData = null;

  async function loadComprehensiveReport() {
    if (!window.ReportService) return;

    if (DOM.reportLoading) DOM.reportLoading.classList.remove("hidden");
    if (DOM.reportContentWrapper) DOM.reportContentWrapper.style.opacity = "0.5";

    const filters = {
      startDate: DOM.reportFilterStartDate ? DOM.reportFilterStartDate.value : null,
      endDate: DOM.reportFilterEndDate ? DOM.reportFilterEndDate.value : null
    };

    try {
      const data = await window.ReportService.generateConsolidatedReport(filters);
      currentReportData = data;
      renderComprehensiveReport(data);
    } catch (err) {
      console.error("Lỗi tạo báo cáo tổng hợp:", err);
      showToast("Không thể tải dữ liệu báo cáo: " + (err.message || "Lỗi Supabase"), "error");
    } finally {
      if (DOM.reportLoading) DOM.reportLoading.classList.add("hidden");
      if (DOM.reportContentWrapper) DOM.reportContentWrapper.style.opacity = "1";
    }
  }

  function renderComprehensiveReport(data) {
    if (!data) return;

    // 1. KPI TỔNG HỢP TOÀN HỆ THỐNG
    if (DOM.repGrandIncome) {
      DOM.repGrandIncome.textContent = window.DashboardManager.formatVND(data.grandTotalIncome);
    }
    if (DOM.repGrandIncomeSub) {
      const fnbThu = window.DashboardManager.formatVND(data.units.FNB?.income || 0);
      const otherThu = window.DashboardManager.formatVND((data.grandTotalIncome - (data.units.FNB?.income || 0)));
      DOM.repGrandIncomeSub.textContent = `F&B (Đối soát): ${fnbThu} | Sơn Mài & VP: ${otherThu}`;
    }

    if (DOM.repGrandExpense) {
      DOM.repGrandExpense.textContent = window.DashboardManager.formatVND(data.grandTotalExpense);
    }
    if (DOM.repGrandExpenseSub) {
      const txExp = window.DashboardManager.formatVND(data.sourceDetails.transactions.totalExpense);
      const sbExp = window.DashboardManager.formatVND(data.sourceDetails.salaryBank.totalExpense);
      DOM.repGrandExpenseSub.textContent = `Sổ chung: ${txExp} | Lương & CK: ${sbExp}`;
    }

    if (DOM.repGrandNet) {
      DOM.repGrandNet.textContent = window.DashboardManager.formatVND(data.grandNetBalance);
      DOM.repGrandNet.className = "kpi-value " + (data.grandNetBalance >= 0 ? "text-positive" : "text-negative");
    }

    if (DOM.repNetBadge) {
      if (data.grandNetBalance > 0) {
        DOM.repNetBadge.textContent = "Thặng dư (+)";
        DOM.repNetBadge.className = "badge badge-success";
      } else if (data.grandNetBalance < 0) {
        DOM.repNetBadge.textContent = "Thâm hụt (-)";
        DOM.repNetBadge.className = "badge badge-danger";
      } else {
        DOM.repNetBadge.textContent = "Cân bằng";
        DOM.repNetBadge.className = "badge badge-neutral";
      }
    }

    if (DOM.repFnbCollected) {
      DOM.repFnbCollected.textContent = window.DashboardManager.formatVND(data.sourceDetails.fnb.collectedTotal);
    }
    if (DOM.repFnbDiffStatus) {
      const diffVal = data.sourceDetails.fnb.diffTotal;
      const diffStr = window.DashboardManager.formatVND(diffVal);
      if (diffVal === 0) {
        DOM.repFnbDiffStatus.textContent = `Khớp 100% (${data.sourceDetails.fnb.matchedDays} ngày)`;
      } else if (diffVal > 0) {
        DOM.repFnbDiffStatus.textContent = `Thừa: +${diffStr} (${data.sourceDetails.fnb.discrepantDays} ngày lệch)`;
      } else {
        DOM.repFnbDiffStatus.textContent = `Thiếu: ${diffStr} (${data.sourceDetails.fnb.discrepantDays} ngày lệch)`;
      }
    }

    // 2. CHI TIẾT 3 MẢNG HOẠT ĐỘNG
    const sm = data.units.SON_MAI || { income: 0, expense: 0, sbExpense: 0, totalExpenseCombined: 0, net: 0, txCount: 0 };
    if (DOM.repUnitSonmaiBadge) DOM.repUnitSonmaiBadge.textContent = `${sm.txCount} GD`;
    if (DOM.repUnitSonmaiIncome) DOM.repUnitSonmaiIncome.textContent = window.DashboardManager.formatVND(sm.income);
    if (DOM.repUnitSonmaiTxExpense) DOM.repUnitSonmaiTxExpense.textContent = window.DashboardManager.formatVND(sm.expense);
    if (DOM.repUnitSonmaiSbExpense) DOM.repUnitSonmaiSbExpense.textContent = window.DashboardManager.formatVND(sm.sbExpense);
    if (DOM.repUnitSonmaiTotalExpense) DOM.repUnitSonmaiTotalExpense.textContent = window.DashboardManager.formatVND(sm.totalExpenseCombined);
    if (DOM.repUnitSonmaiNet) {
      DOM.repUnitSonmaiNet.textContent = window.DashboardManager.formatVND(sm.net);
      DOM.repUnitSonmaiNet.className = "unit-net-value " + (sm.net >= 0 ? "text-positive" : "text-negative");
    }

    const fnb = data.units.FNB || { income: 0, expense: 0, sbExpense: 0, totalExpenseCombined: 0, net: 0, txCount: 0 };
    if (DOM.repUnitFnbBadge) DOM.repUnitFnbBadge.textContent = `${fnb.txCount} GD`;
    if (DOM.repUnitFnbIncome) DOM.repUnitFnbIncome.textContent = window.DashboardManager.formatVND(fnb.income);
    if (DOM.repUnitFnbTxExpense) DOM.repUnitFnbTxExpense.textContent = window.DashboardManager.formatVND(fnb.expense);
    if (DOM.repUnitFnbSbExpense) DOM.repUnitFnbSbExpense.textContent = window.DashboardManager.formatVND(fnb.sbExpense);
    if (DOM.repUnitFnbTotalExpense) DOM.repUnitFnbTotalExpense.textContent = window.DashboardManager.formatVND(fnb.totalExpenseCombined);
    if (DOM.repUnitFnbNet) {
      DOM.repUnitFnbNet.textContent = window.DashboardManager.formatVND(fnb.net);
      DOM.repUnitFnbNet.className = "unit-net-value " + (fnb.net >= 0 ? "text-positive" : "text-negative");
    }

    const vp = data.units.VAN_PHONG || { income: 0, expense: 0, sbExpense: 0, totalExpenseCombined: 0, net: 0, txCount: 0 };
    if (DOM.repUnitVpBadge) DOM.repUnitVpBadge.textContent = `${vp.txCount} GD`;
    if (DOM.repUnitVpIncome) DOM.repUnitVpIncome.textContent = window.DashboardManager.formatVND(vp.income);
    if (DOM.repUnitVpTxExpense) DOM.repUnitVpTxExpense.textContent = window.DashboardManager.formatVND(vp.expense);
    if (DOM.repUnitVpSbExpense) DOM.repUnitVpSbExpense.textContent = window.DashboardManager.formatVND(vp.sbExpense);
    if (DOM.repUnitVpTotalExpense) DOM.repUnitVpTotalExpense.textContent = window.DashboardManager.formatVND(vp.totalExpenseCombined);
    if (DOM.repUnitVpNet) {
      DOM.repUnitVpNet.textContent = window.DashboardManager.formatVND(vp.net);
      DOM.repUnitVpNet.className = "unit-net-value " + (vp.net >= 0 ? "text-positive" : "text-negative");
    }

    // 3. CƠ CẤU NGUỒN DỮ LIỆU
    if (DOM.repSrcTxCount) DOM.repSrcTxCount.textContent = `${data.sourceDetails.transactions.count} giao dịch`;
    if (DOM.repSrcTxIncome) DOM.repSrcTxIncome.textContent = `Thu: ${window.DashboardManager.formatVND(data.sourceDetails.transactions.totalIncome)}`;
    if (DOM.repSrcTxExpense) DOM.repSrcTxExpense.textContent = `Chi: ${window.DashboardManager.formatVND(data.sourceDetails.transactions.totalExpense)}`;

    if (DOM.repSrcFnbDays) DOM.repSrcFnbDays.textContent = `${data.sourceDetails.fnb.daysCount} ngày đối soát`;
    if (DOM.repSrcFnbCollected) DOM.repSrcFnbCollected.textContent = `Thực thu: ${window.DashboardManager.formatVND(data.sourceDetails.fnb.collectedTotal)}`;
    if (DOM.repSrcFnbDiff) {
      DOM.repSrcFnbDiff.textContent = `KiotViet: ${window.DashboardManager.formatVND(data.sourceDetails.fnb.kiotvietTotal)} | Chênh: ${window.DashboardManager.formatVND(data.sourceDetails.fnb.diffTotal)}`;
    }

    if (DOM.repSrcSbCount) DOM.repSrcSbCount.textContent = `${data.sourceDetails.salaryBank.count} giao dịch`;
    if (DOM.repSrcSbSalary) DOM.repSrcSbSalary.textContent = `Lương: ${window.DashboardManager.formatVND(data.sourceDetails.salaryBank.totalSalary)}`;
    if (DOM.repSrcSbTransfer) DOM.repSrcSbTransfer.textContent = `Chi CK: ${window.DashboardManager.formatVND(data.sourceDetails.salaryBank.totalBankTransfer)}`;

    // 4. BẢNG CƠ CẤU DANH MỤC LƯƠNG & CHUYỂN KHOẢN
    if (DOM.repSbCategoryTbody) {
      DOM.repSbCategoryTbody.innerHTML = "";
      const catMap = data.sourceDetails.salaryBank.categories || {};
      const totalSb = data.sourceDetails.salaryBank.totalExpense || 1;
      const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

      if (sortedCats.length === 0) {
        DOM.repSbCategoryTbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Không có chi phí lương / CK trong kỳ</td></tr>`;
      } else {
        const labels = window.SalaryBankExpenseService?.CATEGORY_LABELS || {};
        sortedCats.forEach(([catKey, amount]) => {
          const pct = Math.round((amount / totalSb) * 100);
          const label = labels[catKey] || catKey;
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHtml(label)}</strong></td>
            <td style="text-align: right; font-weight: 600; color: #6d28d9;">${window.DashboardManager.formatVND(amount)}</td>
            <td style="text-align: center;">
              <span class="badge" style="background: #ede9fe; color: #6d28d9; font-weight: 600;">${pct}%</span>
            </td>
          `;
          DOM.repSbCategoryTbody.appendChild(tr);
        });
      }
    }

    // 5. BẢNG DÒNG TIỀN THEO NGÀY (TIMELINE)
    if (DOM.repTimelineTbody) {
      DOM.repTimelineTbody.innerHTML = "";
      if (DOM.repTimelineBadge) DOM.repTimelineBadge.textContent = `${data.timeline.length} ngày phát sinh`;

      if (data.timeline.length === 0) {
        DOM.repTimelineTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Không có phát sinh thu chi trong khoảng thời gian này</td></tr>`;
      } else {
        data.timeline.forEach(d => {
          const tr = document.createElement("tr");
          const netClass = d.net >= 0 ? "text-positive" : "text-negative";
          tr.innerHTML = `
            <td style="font-weight: 600;">${formatDateVN(d.date)}</td>
            <td style="text-align: right; font-weight: 600;" class="text-positive">${window.DashboardManager.formatVND(d.income)}</td>
            <td style="text-align: right;" class="text-negative">${window.DashboardManager.formatVND(d.txExpense)}</td>
            <td style="text-align: right; color: #6d28d9;">${window.DashboardManager.formatVND(d.sbExpense)}</td>
            <td style="text-align: right; font-weight: 700;" class="text-negative">${window.DashboardManager.formatVND(d.totalExpense)}</td>
            <td style="text-align: right; font-weight: 700;" class="${netClass}">${window.DashboardManager.formatVND(d.net)}</td>
            <td style="text-align: right; color: #c2410c;">${d.fnbRevenue > 0 ? window.DashboardManager.formatVND(d.fnbRevenue) : "-"}</td>
          `;
          DOM.repTimelineTbody.appendChild(tr);
        });
      }
    }
  }

  function setupReportEvents() {
    if (DOM.btnRefreshReport) {
      DOM.btnRefreshReport.addEventListener("click", () => {
        loadComprehensiveReport();
        showToast("Đã cập nhật số liệu báo cáo tổng quan.", "info");
      });
    }

    if (DOM.btnReportApplyFilter) {
      DOM.btnReportApplyFilter.addEventListener("click", () => {
        loadComprehensiveReport();
      });
    }

    // Presets khoảng ngày cho Báo cáo
    DOM.reportPresetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        DOM.reportPresetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const preset = btn.getAttribute("data-preset");
        applyReportDatePreset(preset);
        loadComprehensiveReport();
      });
    });

    // Xuất Excel tổng hợp
    if (DOM.btnExportReportExcel) {
      DOM.btnExportReportExcel.addEventListener("click", () => {
        if (!currentReportData) {
          showToast("Chưa có dữ liệu báo cáo để xuất.", "warning");
          return;
        }
        try {
          window.ReportService.exportToExcel(currentReportData);
          showToast("Đã tải xuống file Excel báo cáo tổng hợp!", "success");
        } catch (e) {
          console.error("Lỗi xuất Excel:", e);
          showToast("Không thể xuất Excel: " + e.message, "error");
        }
      });
    }

    // In báo cáo (Print)
    if (DOM.btnPrintReport) {
      DOM.btnPrintReport.addEventListener("click", () => {
        window.print();
      });
    }
  }

  function applyReportDatePreset(preset) {
    if (!DOM.reportFilterStartDate || !DOM.reportFilterEndDate) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    if (preset === "today") {
      const dStr = getTodayString();
      DOM.reportFilterStartDate.value = dStr;
      DOM.reportFilterEndDate.value = dStr;
    } else if (preset === "month") {
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      DOM.reportFilterStartDate.value = formatDateIso(firstDay);
      DOM.reportFilterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "quarter") {
      const qMonth = Math.floor(m / 3) * 3;
      const firstDay = new Date(y, qMonth, 1);
      const lastDay = new Date(y, qMonth + 3, 0);
      DOM.reportFilterStartDate.value = formatDateIso(firstDay);
      DOM.reportFilterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "year") {
      const firstDay = new Date(y, 0, 1);
      const lastDay = new Date(y, 11, 31);
      DOM.reportFilterStartDate.value = formatDateIso(firstDay);
      DOM.reportFilterEndDate.value = formatDateIso(lastDay);
    } else if (preset === "all") {
      DOM.reportFilterStartDate.value = "";
      DOM.reportFilterEndDate.value = "";
    }
  }

  // ================= INIT APPLICATION =================
  function init() {
    setupConfigEvents();
    setupAuthEvents();
    setupNavigationEvents();
    setupFilterEvents();
    setupTransactionModalEvents();
    setupFnbReconciliationEvents();
    setupSalaryBankEvents();
    setupSalaryCategoryEvents();
    setupExcelImportEvents();
    setupSystemEvents();
    setupReportEvents();

    // Khởi tạo ngày hôm nay cho modals và form nhập liệu
    DOM.txDate.value = getTodayString();
    if (DOM.recDate) DOM.recDate.value = getTodayString();
    resetInlineFnbForm();
    resetInlineSbForm();

    // Khởi tạo Auth
    initAuthAndSession();
  }

  // Chạy khi DOM đã sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

