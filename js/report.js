// ============================================================
// COMPREHENSIVE FINANCIAL REPORT SERVICE
// Báo cáo Thu - Chi tổng quan hợp nhất từ tất cả các trang
// (Sổ giao dịch chung + Đối soát F&B + Chi lương & CK)
// ============================================================

(function () {
  "use strict";

  const ReportService = {
    // 1. TẢI VÀ HỢP NHẤT DỮ LIỆU TỪ 3 NGUỒN THEO KHOẢNG THỜI GIAN
    async generateConsolidatedReport(filters = {}) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const startDate = filters.startDate || null;
      const endDate = filters.endDate || null;

      // A. Truy vấn Sổ Thu Chi Chung (transactions)
      let txQuery = client
        .from("transactions")
        .select(`
          id,
          transaction_date,
          transaction_type,
          amount,
          payment_method,
          description,
          reference_no,
          business_unit_id,
          business_units ( id, code, name ),
          category_id,
          categories ( id, name )
        `);
      if (startDate) txQuery = txQuery.gte("transaction_date", startDate);
      if (endDate) txQuery = txQuery.lte("transaction_date", endDate);

      // B. Truy vấn Đối soát bán hàng F&B (fnb_sales_reconciliations)
      let fnbQuery = client
        .from("fnb_sales_reconciliations")
        .select("*");
      if (startDate) fnbQuery = fnbQuery.gte("reconciliation_date", startDate);
      if (endDate) fnbQuery = fnbQuery.lte("reconciliation_date", endDate);

      // C. Truy vấn Chi Lương & Chuyển Khoản (salary_and_bank_expenses)
      let sbQuery = client
        .from("salary_and_bank_expenses")
        .select(`
          id,
          expense_date,
          expense_type,
          expense_category,
          amount,
          recipient_name,
          source_bank,
          reference_no,
          description,
          business_unit_id,
          business_units ( id, code, name )
        `);
      if (startDate) sbQuery = sbQuery.gte("expense_date", startDate);
      if (endDate) sbQuery = sbQuery.lte("expense_date", endDate);

      // Chạy song song 3 truy vấn
      const [txRes, fnbRes, sbRes] = await Promise.all([
        txQuery.order("transaction_date", { ascending: true }),
        fnbQuery.order("reconciliation_date", { ascending: true }),
        sbQuery.order("expense_date", { ascending: true })
      ]);

      if (txRes.error) console.warn("Lỗi tải transactions:", txRes.error);
      if (fnbRes.error) console.warn("Lỗi tải fnb_reconciliations:", fnbRes.error);
      if (sbRes.error) console.warn("Lỗi tải salary_bank_expenses:", sbRes.error);

      const transactions = txRes.data || [];
      const fnbRecs = fnbRes.data || [];
      const salaryBankExpenses = sbRes.data || [];

      // D. Phân tích & Tính toán tổng hợp
      return this.aggregateData(transactions, fnbRecs, salaryBankExpenses, { startDate, endDate });
    },

    // 2. TỔNG HỢP VÀ PHÂN LOẠI TOÀN BỘ SỐ LIỆU
    aggregateData(transactions, fnbRecs, salaryBankExpenses, timeRange) {
      // 1. Phân loại theo mảng hoạt động
      const units = {
        SON_MAI: { code: "SON_MAI", name: "Sơn Mài", income: 0, expense: 0, net: 0, txCount: 0, sbExpense: 0 },
        FNB: { code: "FNB", name: "F&B", income: 0, expense: 0, net: 0, txCount: 0, fnbRevenue: 0, sbExpense: 0 },
        VAN_PHONG: { code: "VAN_PHONG", name: "Văn phòng", income: 0, expense: 0, net: 0, txCount: 0, sbExpense: 0 },
        OTHER: { code: "OTHER", name: "Khác", income: 0, expense: 0, net: 0, txCount: 0, sbExpense: 0 }
      };

      // A. Tổng hợp từ Sổ thu chi chung (transactions)
      let txTotalIncome = 0;
      let txTotalExpense = 0;

      transactions.forEach(tx => {
        const amt = Number(tx.amount) || 0;
        const uCode = tx.business_units?.code || "OTHER";
        const targetUnit = units[uCode] || units.OTHER;

        if (tx.transaction_type === "income") {
          txTotalIncome += amt;
          targetUnit.income += amt;
        } else if (tx.transaction_type === "expense") {
          txTotalExpense += amt;
          targetUnit.expense += amt;
        }
        targetUnit.txCount += 1;
      });

      // B. Tổng hợp từ Đối soát F&B (Chính là phần tổng thu F&B)
      let fnbKiotvietTotal = 0;
      let fnbCollectedTotal = 0;
      let fnbCashTotal = 0;
      let fnbBankTotal = 0;
      let fnbDiffTotal = 0;
      let fnbDaysCount = fnbRecs.length;
      let fnbMatchedDays = 0;
      let fnbDiscrepantDays = 0;

      fnbRecs.forEach(r => {
        const kv = Number(r.kiotviet_revenue) || 0;
        const cash = Number(r.cash_amount !== undefined ? r.cash_amount : r.actual_cash_collected) || 0;
        const bank = Number(r.mb_bank_amount !== undefined ? r.mb_bank_amount : r.mb_bank_transfer) || 0;
        const collected = Number(r.total_collected !== undefined ? r.total_collected : (cash + bank)) || (cash + bank);
        const diff = Number(r.difference !== undefined ? r.difference : (collected - kv)) || 0;

        fnbKiotvietTotal += kv;
        fnbCashTotal += cash;
        fnbBankTotal += bank;
        fnbCollectedTotal += collected;
        fnbDiffTotal += diff;

        if (diff === 0) fnbMatchedDays += 1;
        else fnbDiscrepantDays += 1;
      });

      // Đối soát F&B chính là nguồn tổng thu của mảng F&B
      // Nếu có đối soát F&B thì lấy số thực thu F&B làm doanh thu F&B, nếu không có đối soát thì dùng thu từ Sổ chung
      const fnbRecordedIncome = units.FNB.income; // Thu từ sổ chung (nếu có)
      const fnbActualIncome = fnbCollectedTotal > 0 ? fnbCollectedTotal : fnbRecordedIncome;
      units.FNB.income = fnbActualIncome;
      units.FNB.fnbRevenue = fnbCollectedTotal;
      units.FNB.txIncome = fnbRecordedIncome;

      // C. Tổng hợp từ Chi Lương & Chuyển Khoản
      let sbTotalSalary = 0;
      let sbTotalBankTransfer = 0;
      let sbTotalExpense = 0;
      const sbCategoryBreakdown = {};

      salaryBankExpenses.forEach(sb => {
        const amt = Number(sb.amount) || 0;
        const uCode = sb.business_units?.code || "OTHER";
        const targetUnit = units[uCode] || units.OTHER;

        sbTotalExpense += amt;
        targetUnit.sbExpense += amt;

        if (sb.expense_type === "salary") {
          sbTotalSalary += amt;
        } else {
          sbTotalBankTransfer += amt;
        }

        const cat = sb.expense_category || "Khác";
        sbCategoryBreakdown[cat] = (sbCategoryBreakdown[cat] || 0) + amt;
      });

      // D. Tính chênh lệch từng mảng
      Object.values(units).forEach(u => {
        // Tổng chi của mảng = chi sổ chung + chi lương & CK
        u.totalExpenseCombined = u.expense + u.sbExpense;
        u.net = u.income - u.totalExpenseCombined;
      });

      // E. TỔNG HỢP TOÀN DOANH NGHIỆP
      // Tổng thu hợp nhất = Thu Sơn Mài + Thu Văn Phòng + Thu Khác (từ Sổ chung) + Thu F&B (từ Đối Soát Bán Hàng)
      const otherUnitsIncome = (units.SON_MAI.income || 0) + (units.VAN_PHONG.income || 0) + (units.OTHER.income || 0);
      const grandTotalIncome = otherUnitsIncome + units.FNB.income;

      // Tổng chi hợp nhất = Sổ chi chung + Chi lương & CK
      const grandTotalExpense = txTotalExpense + sbTotalExpense;
      const grandNetBalance = grandTotalIncome - grandTotalExpense;

      // F. Timeline theo ngày (hợp nhất thu F&B thực thu vào doanh thu từng ngày)
      const dailyMap = {};
      const registerDay = (dateStr) => {
        if (!dateStr) return;
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = {
            date: dateStr,
            income: 0,
            txExpense: 0,
            sbExpense: 0,
            fnbRevenue: 0,
            totalExpense: 0,
            net: 0
          };
        }
      };

      // 1. Ghi nhận giao dịch sổ chung (không tính trùng thu F&B nếu ngày đó đã có đối soát F&B)
      const fnbDateSet = new Set(fnbRecs.map(f => f.reconciliation_date));

      transactions.forEach(t => {
        registerDay(t.transaction_date);
        const day = dailyMap[t.transaction_date];
        const amt = Number(t.amount) || 0;
        const isFnbTx = t.business_units?.code === "FNB";

        if (t.transaction_type === "income") {
          // Nếu là thu F&B và ngày này có đối soát F&B riêng, không cộng trùng ở đây
          if (!isFnbTx || !fnbDateSet.has(t.transaction_date)) {
            day.income += amt;
          }
        } else {
          day.txExpense += amt;
        }
      });

      salaryBankExpenses.forEach(s => {
        registerDay(s.expense_date);
        const day = dailyMap[s.expense_date];
        const amt = Number(s.amount) || 0;
        day.sbExpense += amt;
      });

      fnbRecs.forEach(f => {
        registerDay(f.reconciliation_date);
        const day = dailyMap[f.reconciliation_date];
        const cash = Number(f.cash_amount !== undefined ? f.cash_amount : f.actual_cash_collected) || 0;
        const bank = Number(f.mb_bank_amount !== undefined ? f.mb_bank_amount : f.mb_bank_transfer) || 0;
        const collected = Number(f.total_collected !== undefined ? f.total_collected : (cash + bank)) || (cash + bank);

        day.fnbRevenue += collected;
        day.income += collected; // Thu F&B cộng trực tiếp vào tổng thu của ngày
      });

      const timeline = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));
      timeline.forEach(d => {
        d.totalExpense = d.txExpense + d.sbExpense;
        d.net = d.income - d.totalExpense;
      });

      return {
        timeRange,
        grandTotalIncome,
        grandTotalExpense,
        grandNetBalance,
        // Chi tiết từng nguồn
        sourceDetails: {
          transactions: {
            totalIncome: txTotalIncome,
            totalExpense: txTotalExpense,
            count: transactions.length
          },
          fnb: {
            kiotvietTotal: fnbKiotvietTotal,
            collectedTotal: fnbCollectedTotal,
            cashTotal: fnbCashTotal,
            bankTotal: fnbBankTotal,
            diffTotal: fnbDiffTotal,
            daysCount: fnbDaysCount,
            matchedDays: fnbMatchedDays,
            discrepantDays: fnbDiscrepantDays
          },
          salaryBank: {
            totalExpense: sbTotalExpense,
            totalSalary: sbTotalSalary,
            totalBankTransfer: sbTotalBankTransfer,
            count: salaryBankExpenses.length,
            categories: sbCategoryBreakdown
          }
        },
        units,
        timeline,
        rawCounts: {
          transactions: transactions.length,
          fnbRecs: fnbRecs.length,
          salaryBankExpenses: salaryBankExpenses.length
        }
      };
    },

    // 3. XUẤT BÁO CÁO RA FILE EXCEL TỔNG HỢP (DÙNG SHEETJS)
    exportToExcel(reportData) {
      if (typeof XLSX === "undefined") {
        throw new Error("Thư viện SheetJS chưa được tải.");
      }

      const wb = XLSX.utils.book_new();

      // Sheet 1: Tổng Quan Thu Chi
      const summaryRows = [
        ["BÁO CÁO TỔNG QUAN THU - CHI HỢP NHẤT TOÀN HỆ THỐNG"],
        [`Kỳ báo cáo: ${reportData.timeRange.startDate || "Tất cả"} đến ${reportData.timeRange.endDate || "Hiện tại"}`],
        [`Ngày xuất: ${new Date().toLocaleString("vi-VN")}`],
        [],
        ["1. CHỈ SỐ TÀI CHÍNH TỔNG HỢP", "GIÁ TRỊ (VND)"],
        ["Tổng Thu Hợp Nhất (Sơn Mài + VP + Đối Soát F&B)", reportData.grandTotalIncome],
        ["  - Doanh thu thực thu F&B (Từ Đối Soát Bán Hàng)", reportData.units.FNB.income],
        ["  - Thu mảng Sơn Mài & Văn Phòng (Từ Sổ Chung)", (reportData.grandTotalIncome - reportData.units.FNB.income)],
        ["Tổng Chi Hợp Nhất (Chi sổ + Lương & CK)", reportData.grandTotalExpense],
        ["  - Chi phí từ Sổ chung", reportData.sourceDetails.transactions.totalExpense],
        ["  - Chi phí Lương nhân sự", reportData.sourceDetails.salaryBank.totalSalary],
        ["  - Chi phí Chuyển khoản vận hành", reportData.sourceDetails.salaryBank.totalBankTransfer],
        ["Chênh Lệch Thu - Chi Ròng", reportData.grandNetBalance],
        [],
        ["2. ĐỐI SOÁT DOANH THU F&B (NGUỒN THU CHÍNH F&B)", ""],
        ["Doanh thu phần mềm KiotViet", reportData.sourceDetails.fnb.kiotvietTotal],
        ["Thực thu thực tế F&B (Tiền mặt + Chuyển khoản MB)", reportData.sourceDetails.fnb.collectedTotal],
        ["  - Thực thu tiền mặt", reportData.sourceDetails.fnb.cashTotal],
        ["  - Chuyển khoản MB", reportData.sourceDetails.fnb.bankTotal],
        ["Chênh lệch đối soát F&B (Thừa / Thiếu)", reportData.sourceDetails.fnb.diffTotal],
        ["Số ngày khớp / lệch", `${reportData.sourceDetails.fnb.matchedDays} ngày khớp / ${reportData.sourceDetails.fnb.discrepantDays} ngày lệch`],
        [],
        ["3. BÁO CÁO THEO TỪNG MẢNG KINH DOANH", "THU (VND)", "CHI SỔ CHUNG", "CHI LƯƠNG & CK", "TỔNG CHI", "CHÊNH LỆCH"]
      ];

      Object.values(reportData.units).forEach(u => {
        summaryRows.push([
          u.name,
          u.income,
          u.expense,
          u.sbExpense,
          u.totalExpenseCombined,
          u.net
        ]);
      });

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng Quan");

      // Sheet 2: Chi tiết từng ngày (Timeline)
      const timelineRows = [
        ["Ngày", "Tổng Thu (VND)", "Chi Sổ Chung", "Chi Lương & CK", "Tổng Chi", "Chênh Lệch Ngày", "Doanh Thu F&B"]
      ];
      reportData.timeline.forEach(d => {
        timelineRows.push([
          d.date,
          d.income,
          d.txExpense,
          d.sbExpense,
          d.totalExpense,
          d.net,
          d.fnbRevenue
        ]);
      });
      const wsTimeline = XLSX.utils.aoa_to_sheet(timelineRows);
      XLSX.utils.book_append_sheet(wb, wsTimeline, "Theo Ngày");

      // Tạo tên file và tải về
      const startTag = reportData.timeRange.startDate || "all";
      const endTag = reportData.timeRange.endDate || "now";
      const filename = `Bao_Cao_Thu_Chi_Tong_Quan_${startTag}_den_${endTag}.xlsx`;

      XLSX.writeFile(wb, filename);
    }
  };

  window.ReportService = ReportService;
})();
