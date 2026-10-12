// ============================================================
// EXCEL IMPORT SERVICE & TEMPLATES
// Hỗ trợ tải file Excel mẫu và nhập dữ liệu hàng loạt từ file Excel
// Sử dụng SheetJS (xlsx.full.min.js)
// ============================================================

(function () {
  "use strict";

  const ExcelImportService = {
    // 1. Danh sách file mẫu đính kèm lưu trên web
    TEMPLATES: {
      transactions: {
        title: "Sổ Thu Chi Chung",
        filename: "mau_so_thu_chi_chung.xlsx",
        path: "templates/mau_so_thu_chi_chung.xlsx",
        description: "Mẫu nhập giao dịch thu, chi gắn với mảng hoạt động (SON_MAI, FNB, VAN_PHONG)",
        columns: [
          "Ngay_Giao_Dich (YYYY-MM-DD)",
          "Ma_Mang_Hoat_Dong (SON_MAI, FNB, VAN_PHONG)",
          "Loai_Giao_Dich (Thu hoặc Chi)",
          "Danh_Muc (Tên danh mục)",
          "So_Tien (Số dương)",
          "Hinh_Thuc_Thanh_Toan (Chuyen_Khoan, Tien_Mat, Card...)",
          "Dien_Giai",
          "Ma_Chung_Tu"
        ]
      },
      fnb_reconciliation: {
        title: "Đối Soát Doanh Thu F&B",
        filename: "mau_doi_soat_fnb.xlsx",
        path: "templates/mau_doi_soat_fnb.xlsx",
        description: "Mẫu nhập đối soát doanh thu KiotViet so với tiền mặt và chuyển khoản MB theo ngày",
        columns: [
          "Ngay_Doi_Soat (YYYY-MM-DD)",
          "Doanh_Thu_KiotViet",
          "Tien_Mat_Thuc_Thu",
          "Chuyen_Khoan_MB",
          "Ly_Do_Chenh_Lech (Bắt buộc nếu có chênh lệch)",
          "Ghi_Chu"
        ]
      },
      salary_bank: {
        title: "Chi Lương & Chuyển Khoản Theo Mảng",
        filename: "mau_chi_luong_chuyen_khoan.xlsx",
        path: "templates/mau_chi_luong_chuyen_khoan.xlsx",
        description: "Mẫu nhập chi lương nhân sự và các khoản chi chuyển khoản có gắn mã hoạt động",
        columns: [
          "Ngay_Chi (YYYY-MM-DD)",
          "Ma_Mang_Hoat_Dong (SON_MAI, FNB, VAN_PHONG)",
          "Phan_Loai_Chi (Luong hoặc Chuyen_Khoan)",
          "Khoan_Muc_Chi",
          "Nguoi_Nhan",
          "So_Tien",
          "Ngan_Hang_Nhan",
          "So_Tai_Khoan_Nhan",
          "Ma_UNC_Giao_Dich",
          "Tai_Khoan_Trich_Chi",
          "Dien_Giai",
          "Ghi_Chu"
        ]
      }
    },

    // 2. Tải file mẫu trực tiếp về máy
    downloadTemplate(type) {
      const tmpl = this.TEMPLATES[type];
      if (!tmpl) {
        throw new Error("Không tìm thấy mẫu file yêu cầu: " + type);
      }
      const link = document.createElement("a");
      link.href = tmpl.path;
      link.download = tmpl.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // 3. Đọc dữ liệu file Excel (sử dụng SheetJS)
    async parseExcelFile(file) {
      if (!window.XLSX) {
        throw new Error("Thư viện đọc Excel (SheetJS) chưa được tải. Vui lòng kiểm tra kết nối mạng hoặc file js/xlsx.full.min.js.");
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = window.XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // Đọc thành mảng object theo header dòng 1
            const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            resolve(jsonData);
          } catch (err) {
            reject(new Error("Lỗi khi đọc nội dung file Excel: " + err.message));
          }
        };
        reader.onerror = () => reject(new Error("Không thể đọc tệp tin đã chọn."));
        reader.readAsArrayBuffer(file);
      });
    },

    // 4. Chuẩn hóa định dạng ngày sang YYYY-MM-DD
    formatDateValue(val) {
      if (!val) return null;
      if (typeof val === "number") {
        // Xử lý Excel serial date number
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const dateObj = new Date(excelEpoch.getTime() + val * 86400000);
        return dateObj.toISOString().slice(0, 10);
      }
      const s = String(val).trim();
      // YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // DD/MM/YYYY
      const parts = s.split("/");
      if (parts.length === 3) {
        const d = parts[0].padStart(2, "0");
        const m = parts[1].padStart(2, "0");
        const y = parts[2].length === 2 ? "20" + parts[2] : parts[2];
        return `${y}-${m}-${d}`;
      }
      return s;
    },

    // 5. IMPORT VÀO SỔ THU CHI CHUNG
    async importTransactions(rows, businessUnits, categories) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const unitMap = {};
      businessUnits.forEach(u => {
        unitMap[u.code.toUpperCase()] = u.id;
        unitMap[u.name.toLowerCase()] = u.id;
      });

      const catMap = {};
      categories.forEach(c => {
        catMap[c.name.toLowerCase().trim()] = c.id;
      });

      const validPayloads = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const line = i + 2; // Dòng 1 là header

        // Tìm trường ngày
        const rawDate = r["Ngay_Giao_Dich"] || r["Ngày giao dịch"] || r["Ngay"] || r["Ngày"];
        const txDate = this.formatDateValue(rawDate);
        if (!txDate) {
          errors.push(`Dòng ${line}: Thiếu ngày giao dịch.`);
          continue;
        }

        // Tìm mảng hoạt động
        const rawUnit = (r["Ma_Mang_Hoat_Dong"] || r["Mã mảng"] || r["Mảng"] || r["Mang"] || "").toString().trim();
        const unitId = unitMap[rawUnit.toUpperCase()] || unitMap[rawUnit.toLowerCase()];
        if (!unitId) {
          errors.push(`Dòng ${line}: Mã mảng '${rawUnit}' không hợp lệ (hợp lệ: SON_MAI, FNB, VAN_PHONG).`);
          continue;
        }

        // Tìm loại giao dịch (Thu / Chi)
        const rawType = (r["Loai_Giao_Dich"] || r["Loại"] || r["Type"] || "").toString().trim().toLowerCase();
        let txType = "expense";
        if (rawType.includes("thu") || rawType === "income") {
          txType = "income";
        } else if (rawType.includes("chi") || rawType === "expense") {
          txType = "expense";
        }

        // Số tiền
        const rawAmount = r["So_Tien"] || r["Số tiền"] || r["Amount"];
        const amount = Number(String(rawAmount).replace(/[^0-9.-]+/g, "")) || 0;
        if (amount <= 0) {
          errors.push(`Dòng ${line}: Số tiền phải lớn hơn 0.`);
          continue;
        }

        // Danh mục
        const rawCat = (r["Danh_Muc"] || r["Danh mục"] || "").toString().trim().toLowerCase();
        const catId = catMap[rawCat] || null;

        // Hình thức thanh toán
        const rawPay = (r["Hinh_Thuc_Thanh_Toan"] || r["Hình thức thanh toán"] || "Chuyen_Khoan").toString().toLowerCase();
        let paymentMethod = "bank_transfer";
        if (rawPay.includes("tien_mat") || rawPay.includes("tiền mặt") || rawPay === "cash") {
          paymentMethod = "cash";
        } else if (rawPay.includes("card") || rawPay.includes("thẻ")) {
          paymentMethod = "card";
        }

        const desc = (r["Dien_Giai"] || r["Diễn giải"] || r["Noi_Dung"] || "").toString().trim() || null;
        const ref = (r["Ma_Chung_Tu"] || r["Số hóa đơn"] || r["Chung_Tu"] || "").toString().trim() || null;

        validPayloads.push({
          transaction_date: txDate,
          business_unit_id: unitId,
          category_id: catId,
          transaction_type: txType,
          amount: amount,
          payment_method: paymentMethod,
          description: desc,
          reference_no: ref
        });
      }

      if (validPayloads.length === 0) {
        throw new Error("Không có dòng dữ liệu hợp lệ nào để import.\n" + errors.slice(0, 5).join("\n"));
      }

      // Ghi hàng loạt vào Supabase
      const { data, error } = await client
        .from("transactions")
        .insert(validPayloads)
        .select("id");

      if (error) throw error;

      return {
        successCount: data.length,
        totalRows: rows.length,
        errors
      };
    },

    // 6. IMPORT VÀO ĐỐI SOÁT FNB
    async importFnbReconciliations(rows) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const validPayloads = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const line = i + 2;

        const rawDate = r["Ngay_Doi_Soat"] || r["Ngày đối soát"] || r["Ngay"];
        const recDate = this.formatDateValue(rawDate);
        if (!recDate) {
          errors.push(`Dòng ${line}: Thiếu ngày đối soát.`);
          continue;
        }

        const kv = Number(String(r["Doanh_Thu_KiotViet"] || r["KiotViet"] || 0).replace(/[^0-9.-]+/g, "")) || 0;
        const cash = Number(String(r["Tien_Mat_Thuc_Thu"] || r["Tiền mặt"] || 0).replace(/[^0-9.-]+/g, "")) || 0;
        const mb = Number(String(r["Chuyen_Khoan_MB"] || r["CK MB"] || 0).replace(/[^0-9.-]+/g, "")) || 0;
        const diff = (cash + mb) - kv;

        const reason = (r["Ly_Do_Chenh_Lech"] || r["Lý do chênh lệch"] || "").toString().trim();
        if (diff !== 0 && !reason) {
          errors.push(`Dòng ${line} (${recDate}): Có chênh lệch (${diff} ₫) nhưng thiếu lý do giải trình.`);
          continue;
        }

        const notes = (r["Ghi_Chu"] || r["Ghi chú"] || "").toString().trim() || null;

        validPayloads.push({
          reconciliation_date: recDate,
          kiotviet_revenue: kv,
          cash_amount: cash,
          mb_bank_amount: mb,
          discrepancy_reason: reason || null,
          notes: notes
        });
      }

      if (validPayloads.length === 0) {
        throw new Error("Không có dòng đối soát hợp lệ nào để import.\n" + errors.slice(0, 5).join("\n"));
      }

      // Upsert theo reconciliation_date
      const { data, error } = await client
        .from("fnb_sales_reconciliations")
        .upsert(validPayloads, { onConflict: "reconciliation_date" })
        .select("id");

      if (error) throw error;

      return {
        successCount: data.length,
        totalRows: rows.length,
        errors
      };
    },

    // 7. IMPORT VÀO SỔ CHI LƯƠNG & CHUYỂN KHOẢN
    async importSalaryBankExpenses(rows, businessUnits) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const unitMap = {};
      businessUnits.forEach(u => {
        unitMap[u.code.toUpperCase()] = u.id;
        unitMap[u.name.toLowerCase()] = u.id;
      });

      const validPayloads = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const line = i + 2;

        const rawDate = r["Ngay_Chi"] || r["Ngày chi"] || r["Ngay"];
        const expDate = this.formatDateValue(rawDate);
        if (!expDate) {
          errors.push(`Dòng ${line}: Thiếu ngày chi tiền.`);
          continue;
        }

        const rawUnit = (r["Ma_Mang_Hoat_Dong"] || r["Mã mảng"] || r["Mảng"] || "").toString().trim();
        const unitId = unitMap[rawUnit.toUpperCase()] || unitMap[rawUnit.toLowerCase()];
        if (!unitId) {
          errors.push(`Dòng ${line}: Mã mảng '${rawUnit}' không hợp lệ (hợp lệ: SON_MAI, FNB, VAN_PHONG).`);
          continue;
        }

        const rawType = (r["Phan_Loai_Chi"] || r["Phân loại"] || "Chuyen_Khoan").toString().toLowerCase();
        const expType = (rawType.includes("luong") || rawType.includes("lương") || rawType === "salary") ? "salary" : "bank_transfer";

        const recipient = (r["Nguoi_Nhan"] || r["Người nhận"] || "").toString().trim();
        if (!recipient) {
          errors.push(`Dòng ${line}: Thiếu tên người nhận / nhân viên.`);
          continue;
        }

        const rawAmount = r["So_Tien"] || r["Số tiền"];
        const amount = Number(String(rawAmount).replace(/[^0-9.-]+/g, "")) || 0;
        if (amount <= 0) {
          errors.push(`Dòng ${line}: Số tiền phải lớn hơn 0.`);
          continue;
        }

        const cat = (r["Khoan_Muc_Chi"] || r["Khoản mục"] || "other_expense").toString().trim();
        const bankName = (r["Ngan_Hang_Nhan"] || r["Ngân hàng nhận"] || "").toString().trim() || null;
        const bankAcc = (r["So_Tai_Khoan_Nhan"] || r["Số tài khoản"] || "").toString().trim() || null;
        const refNo = (r["Ma_UNC_Giao_Dich"] || r["Mã UNC"] || "").toString().trim() || null;
        const sourceBank = (r["Tai_Khoan_Trich_Chi"] || r["Nguồn trích"] || "MB Bank").toString().trim() || "MB Bank";
        const desc = (r["Dien_Giai"] || r["Diễn giải"] || "").toString().trim() || null;
        const notes = (r["Ghi_Chu"] || r["Ghi chú"] || "").toString().trim() || null;

        validPayloads.push({
          expense_date: expDate,
          business_unit_id: unitId,
          expense_type: expType,
          expense_category: cat,
          recipient_name: recipient,
          recipient_bank: bankName,
          recipient_account: bankAcc,
          amount: amount,
          source_bank: sourceBank,
          reference_no: refNo,
          description: desc,
          notes: notes
        });
      }

      if (validPayloads.length === 0) {
        throw new Error("Không có dòng chi phí hợp lệ nào để import.\n" + errors.slice(0, 5).join("\n"));
      }

      const { data, error } = await client
        .from("salary_and_bank_expenses")
        .insert(validPayloads)
        .select("id");

      if (error) throw error;

      return {
        successCount: data.length,
        totalRows: rows.length,
        errors
      };
    }
  };

  window.ExcelImportService = ExcelImportService;
})();
