// ============================================================
// EXCEL IMPORT SERVICE & TEMPLATES
// Hỗ trợ tải file Excel mẫu (chuẩn droplist) và nhập dữ liệu hàng loạt từ file Excel
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

    // 2. TẠO VÀ TẢI FILE EXCEL MẪU ĐỘNG CHUẨN DROPLIST (DATA VALIDATION)
    downloadTemplate(type) {
      if (!window.XLSX) {
        // Fallback tải file tĩnh nếu SheetJS chưa sẵn sàng
        const tmpl = this.TEMPLATES[type];
        if (tmpl) {
          const link = document.createElement("a");
          link.href = tmpl.path;
          link.download = tmpl.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return;
      }

      if (type === "salary_bank") {
        this.generateSalaryBankTemplate();
      } else if (type === "transactions") {
        this.generateTransactionsTemplate();
      } else if (type === "fnb_reconciliation") {
        this.generateFnbTemplate();
      } else {
        const tmpl = this.TEMPLATES[type];
        if (tmpl) {
          const link = document.createElement("a");
          link.href = tmpl.path;
          link.download = tmpl.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },

    // Mẫu 1: Chi Lương & Chuyển Khoản (kèm droplist và sheet tra cứu)
    generateSalaryBankTemplate() {
      const wb = XLSX.utils.book_new();

      // Dữ liệu mẫu trang tính chính
      const dataRows = [
        [
          "Ngay_Chi",
          "Ma_Mang_Hoat_Dong",
          "Phan_Loai_Chi",
          "Khoan_Muc_Chi",
          "Nguoi_Nhan",
          "So_Tien",
          "Ngan_Hang_Nhan",
          "So_Tai_Khoan_Nhan",
          "Ma_UNC_Giao_Dich",
          "Tai_Khoan_Trich_Chi",
          "Dien_Giai",
          "Ghi_Chu"
        ],
        [
          "2026-10-12",
          "FNB",
          "Luong",
          "Lương cứng / Lương tháng",
          "Nguyễn Văn Tuấn (Bếp trưởng)",
          18000000,
          "MB Bank",
          "0988776655",
          "FT26101201",
          "MB Bank",
          "Chi lương bếp trưởng tháng 10",
          "Đã duyệt chi"
        ],
        [
          "2026-10-12",
          "FNB",
          "Chuyen_Khoan",
          "Thanh toán NCC / Tiền hàng",
          "Công ty CP Thực Phẩm Xanh",
          12500000,
          "Vietcombank",
          "0011004455667",
          "FT26101202",
          "MB Bank",
          "Thanh toán tiền thịt bò cá hồi",
          "Hóa đơn VAT số 0029"
        ],
        [
          "2026-10-12",
          "SON_MAI",
          "Luong",
          "Lương ca / Công nhật / Part-time",
          "Trần Thị Mai (Nghệ nhân phụ)",
          6500000,
          "Techcombank",
          "19033445566",
          "FT26101203",
          "MB Bank",
          "Chi lương công nhật tạo phôi sơn mài",
          "22 công"
        ],
        [
          "2026-10-12",
          "SON_MAI",
          "Chuyen_Khoan",
          "Chi phí vận hành & Dụng cụ",
          "Xưởng Mộc Bình An",
          4800000,
          "MB Bank",
          "0345987123",
          "FT26101204",
          "MB Bank",
          "Mua vóc mộc hộp trang sức và khay trà",
          "Ủy nhiệm chi số 12"
        ],
        [
          "2026-10-12",
          "VAN_PHONG",
          "Chuyen_Khoan",
          "Thuê mặt bằng / Điện nước / Net",
          "BQL Tòa Nhà Vạn Phúc",
          15000000,
          "BIDV",
          "2151000123456",
          "FT26101205",
          "MB Bank",
          "Tiền thuê mặt bằng văn phòng tháng 10",
          "Có hợp đồng thuê"
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(dataRows);

      // Cài đặt độ rộng cột
      ws["!cols"] = [
        { wch: 14 }, // Ngay_Chi
        { wch: 20 }, // Ma_Mang_Hoat_Dong
        { wch: 16 }, // Phan_Loai_Chi
        { wch: 32 }, // Khoan_Muc_Chi
        { wch: 28 }, // Nguoi_Nhan
        { wch: 16 }, // So_Tien
        { wch: 18 }, // Ngan_Hang_Nhan
        { wch: 20 }, // So_Tai_Khoan_Nhan
        { wch: 18 }, // Ma_UNC_Giao_Dich
        { wch: 20 }, // Tai_Khoan_Trich_Chi
        { wch: 40 }, // Dien_Giai
        { wch: 24 }  // Ghi_Chu
      ];

      // Gắn Data Validation (Droplist) trực tiếp vào các cột Excel
      const catList = [
        "Lương cứng / Lương tháng",
        "Lương ca / Công nhật / Part-time",
        "Tạm ứng lương",
        "Thưởng & Phụ cấp",
        "Thanh toán NCC / Tiền hàng",
        "Thuê mặt bằng / Điện nước / Net",
        "Chi phí vận hành & Dụng cụ",
        "Thuế, phí & Dịch vụ ngoài",
        "Chi chuyển khoản khác"
      ].join(",");

      ws["!dataValidation"] = [
        // Cột B (Mã mảng): SON_MAI, FNB, VAN_PHONG
        {
          sqref: "B2:B500",
          type: "list",
          operator: "equal",
          formulae: ['"SON_MAI,FNB,VAN_PHONG"'],
          showDropDown: true,
          showErrorMessage: true,
          errorTitle: "Mã mảng không đúng",
          error: "Vui lòng chọn 1 trong 3 mảng: SON_MAI, FNB, VAN_PHONG"
        },
        // Cột C (Phân loại): Luong, Chuyen_Khoan
        {
          sqref: "C2:C500",
          type: "list",
          operator: "equal",
          formulae: ['"Luong,Chuyen_Khoan"'],
          showDropDown: true,
          showErrorMessage: true,
          errorTitle: "Phân loại không đúng",
          error: "Vui lòng chọn: Luong hoặc Chuyen_Khoan"
        },
        // Cột D (Khoản mục chi): Droplist các khoản mục tiếng Việt chuẩn
        {
          sqref: "D2:D500",
          type: "list",
          operator: "equal",
          formulae: [`"${catList}"`],
          showDropDown: true,
          showErrorMessage: true,
          errorTitle: "Khoản mục chi không đúng",
          error: "Vui lòng chọn khoản mục có sẵn trong danh sách"
        }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Chi_Luong_Va_CK");

      // Sheet 2: Danh Mục Tra Cứu (Reference Guide)
      const guideRows = [
        ["HƯỚNG DẪN ĐIỀN DỮ LIỆU CHI LƯƠNG & CHUYỂN KHOẢN"],
        [""],
        ["1. DANH SÁCH MÃ MẢNG HOẠT ĐỘNG (Cột B):"],
        ["Mã Mảng", "Tên Mảng Kinh Doanh", "Ghi Chú"],
        ["SON_MAI", "Sơn Mài", "Áp dụng cho mọi chi phí thuộc mảng Sơn Mài"],
        ["FNB", "F&B (Nhà hàng / Bar / Cafe)", "Áp dụng cho mảng F&B"],
        ["VAN_PHONG", "Văn phòng / Hành chính", "Chi phí chung khối văn phòng"],
        [""],
        ["2. DANH SÁCH KHOẢN MỤC CHI PHÍ (Cột D - Chọn từ Droplist):"],
        ["Tên Khoản Mục Hiển Thị", "Mã Hệ Thống (Tự động nhận diện)", "Nhóm Phân Loại"],
        ["Lương cứng / Lương tháng", "salary_fixed", "Lương nhân sự"],
        ["Lương ca / Công nhật / Part-time", "salary_shift", "Lương nhân sự"],
        ["Tạm ứng lương", "salary_advance", "Lương nhân sự"],
        ["Thưởng & Phụ cấp", "salary_bonus", "Lương nhân sự"],
        ["Thanh toán NCC / Tiền hàng", "supplier_payment", "Chuyển khoản"],
        ["Thuê mặt bằng / Điện nước / Net", "rent_utility", "Chuyển khoản"],
        ["Chi phí vận hành & Dụng cụ", "operation_cost", "Chuyển khoản"],
        ["Thuế, phí & Dịch vụ ngoài", "tax_fee", "Chuyển khoản"],
        ["Chi chuyển khoản khác", "other_expense", "Chuyển khoản"]
      ];
      const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
      wsGuide["!cols"] = [{ wch: 35 }, { wch: 35 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, wsGuide, "Huong_Dan_Khoan_Muc");

      XLSX.writeFile(wb, "mau_chi_luong_chuyen_khoan.xlsx");
    },

    // Mẫu 2: Sổ Thu Chi Chung
    generateTransactionsTemplate() {
      const wb = XLSX.utils.book_new();

      const dataRows = [
        [
          "Ngay_Giao_Dich",
          "Ma_Mang_Hoat_Dong",
          "Loai_Giao_Dich",
          "Danh_Muc",
          "So_Tien",
          "Hinh_Thuc_Thanh_Toan",
          "Dien_Giai",
          "Ma_Chung_Tu"
        ],
        [
          "2026-10-12",
          "SON_MAI",
          "Thu",
          "Doanh thu bán tranh sơn mài",
          15000000,
          "Chuyen_Khoan",
          "Khách chuyển khoản thanh toán tranh hoa sen",
          "HD-SM-001"
        ],
        [
          "2026-10-12",
          "FNB",
          "Chi",
          "Mua nguyên vật liệu pha chế",
          2500000,
          "Tien_Mat",
          "Tiền mua hoa quả tươi và sữa",
          "PC-FNB-082"
        ],
        [
          "2026-10-12",
          "VAN_PHONG",
          "Chi",
          "Văn phòng phẩm & In ấn",
          650000,
          "Chuyen_Khoan",
          "Mua giấy in A4 và mực máy in",
          "UNC-VP-014"
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      ws["!cols"] = [
        { wch: 14 },
        { wch: 20 },
        { wch: 16 },
        { wch: 30 },
        { wch: 16 },
        { wch: 22 },
        { wch: 45 },
        { wch: 18 }
      ];

      // Droplist mảng, loại giao dịch, hình thức thanh toán
      ws["!dataValidation"] = [
        {
          sqref: "B2:B500",
          type: "list",
          operator: "equal",
          formulae: ['"SON_MAI,FNB,VAN_PHONG"'],
          showDropDown: true
        },
        {
          sqref: "C2:C500",
          type: "list",
          operator: "equal",
          formulae: ['"Thu,Chi"'],
          showDropDown: true
        },
        {
          sqref: "F2:F500",
          type: "list",
          operator: "equal",
          formulae: ['"Chuyen_Khoan,Tien_Mat,Card,Other"'],
          showDropDown: true
        }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "So_Thu_Chi");
      XLSX.writeFile(wb, "mau_so_thu_chi_chung.xlsx");
    },

    // Mẫu 3: Đối Soát Bán Hàng F&B
    generateFnbTemplate() {
      const wb = XLSX.utils.book_new();

      const dataRows = [
        [
          "Ngay_Doi_Soat",
          "Doanh_Thu_KiotViet",
          "Tien_Mat_Thuc_Thu",
          "Chuyen_Khoan_MB",
          "Ly_Do_Chenh_Lech",
          "Ghi_Chu"
        ],
        [
          "2026-10-10",
          14500000,
          4500000,
          10000000,
          "",
          "Số liệu khớp 100%"
        ],
        [
          "2026-10-11",
          18200000,
          5000000,
          13150000,
          "Khách bàn 4 chuyển khoản sau 24h",
          "Lệch thiếu 50.000đ"
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      ws["!cols"] = [
        { wch: 14 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 35 },
        { wch: 25 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Doi_Soat_FNB");
      XLSX.writeFile(wb, "mau_doi_soat_fnb.xlsx");
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
            const rawData = window.XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            // Chuẩn hóa tên cột: bỏ khoảng trắng thừa đầu/cuối (vd: " So_Tien " -> "So_Tien")
            const jsonData = rawData.map(row => {
              const clean = {};
              Object.keys(row).forEach(k => { clean[String(k).replace(/\s+/g, " ").trim()] = row[k]; });
              return clean;
            });
            resolve(jsonData);
          } catch (err) {
            reject(new Error("Lỗi khi đọc nội dung file Excel: " + err.message));
          }
        };
        reader.onerror = () => reject(new Error("Không thể đọc tệp tin đã chọn."));
        reader.readAsArrayBuffer(file);
      });
    },

    // 3b. Chuyển số tiền VND về số: nhận cả số Excel và chuỗi "20.826.989" / "20,826,989" / "20 826 989 đ"
    parseMoney(val) {
      if (typeof val === "number") return val;
      const digits = String(val ?? "").replace(/[^0-9-]+/g, "");
      return Number(digits) || 0;
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

    // 5. Chuẩn hóa chuỗi tiếng Việt để so sánh mờ (bỏ dấu, khoảng trắng)
    normalizeString(str) {
      if (!str) return "";
      return String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
    },

    // 6. Ánh xạ Khoản mục chi phí sang mã hợp lệ của CSDL Supabase
    mapSalaryExpenseCategory(rawCategory) {
      if (!rawCategory) return "other_expense";
      const clean = String(rawCategory).trim();
      const norm = this.normalizeString(clean);

      // Nếu đã đúng định dạng mã CSDL
      const validDbKeys = [
        "salary_fixed",
        "salary_shift",
        "salary_advance",
        "salary_bonus",
        "supplier_payment",
        "rent_utility",
        "operation_cost",
        "tax_fee",
        "other_expense"
      ];
      if (validDbKeys.includes(clean)) return clean;

      // 1. Lương cứng
      if (norm.includes("luongcung") || norm.includes("luongthang") || norm.includes("cung") || norm.includes("fixed")) {
        return "salary_fixed";
      }
      // 2. Lương ca / công nhật / part-time
      if (norm.includes("luongca") || norm.includes("congnhat") || norm.includes("parttime") || norm.includes("shift") || norm.includes("theoca")) {
        return "salary_shift";
      }
      // 3. Tạm ứng
      if (norm.includes("tamung") || norm.includes("ungluong") || norm.includes("advance")) {
        return "salary_advance";
      }
      // 4. Thưởng & phụ cấp
      if (norm.includes("thuong") || norm.includes("phucap") || norm.includes("bonus")) {
        return "salary_bonus";
      }
      // 5. Thanh toán nhà cung cấp / Tiền hàng
      if (norm.includes("ncc") || norm.includes("tienhang") || norm.includes("nhacungcap") || norm.includes("supplier") || norm.includes("vatlieu") || norm.includes("nguyenvatlieu")) {
        return "supplier_payment";
      }
      // 6. Thuê mặt bằng / điện nước / mạng
      if (norm.includes("matbang") || norm.includes("thue") || norm.includes("diennuoc") || norm.includes("rent") || norm.includes("internet") || norm.includes("wifi")) {
        return "rent_utility";
      }
      // 7. Chi phí vận hành & dụng cụ
      if (norm.includes("vanhanh") || norm.includes("dungcu") || norm.includes("operation") || norm.includes("thietbi") || norm.includes("suachua")) {
        return "operation_cost";
      }
      // 8. Thuế & phí dịch vụ
      if (norm.includes("thue") || norm.includes("phi") || norm.includes("tax") || norm.includes("dichvu")) {
        return "tax_fee";
      }

      // Mặc định an toàn
      return "other_expense";
    },

    // 7. IMPORT VÀO SỔ THU CHI CHUNG
    async importTransactions(rows, businessUnits, categories) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const unitMap = {};
      businessUnits.forEach(u => {
        unitMap[u.code.toUpperCase()] = u.id;
        unitMap[u.name.toLowerCase()] = u.id;
        unitMap[this.normalizeString(u.name)] = u.id;
      });

      const catMap = {};
      categories.forEach(c => {
        catMap[c.name.toLowerCase().trim()] = c.id;
        catMap[this.normalizeString(c.name)] = c.id;
      });

      const validPayloads = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const line = i + 2;

        const rawDate = r["Ngay_Giao_Dich"] || r["Ngày giao dịch"] || r["Ngay"] || r["Ngày"];
        const txDate = this.formatDateValue(rawDate);
        if (!txDate) {
          errors.push(`Dòng ${line}: Thiếu ngày giao dịch.`);
          continue;
        }

        const rawUnit = (r["Ma_Mang_Hoat_Dong"] || r["Mã mảng"] || r["Mảng"] || r["Mang"] || "").toString().trim();
        const unitId = unitMap[rawUnit.toUpperCase()] || unitMap[rawUnit.toLowerCase()] || unitMap[this.normalizeString(rawUnit)];
        if (!unitId) {
          errors.push(`Dòng ${line}: Mã mảng '${rawUnit}' không hợp lệ (hợp lệ: SON_MAI, FNB, VAN_PHONG).`);
          continue;
        }

        const rawType = (r["Loai_Giao_Dich"] || r["Loại"] || r["Type"] || "").toString().trim().toLowerCase();
        let txType = "expense";
        if (rawType.includes("thu") || rawType === "income") {
          txType = "income";
        } else if (rawType.includes("chi") || rawType === "expense") {
          txType = "expense";
        }

        const rawAmount = r["So_Tien"] || r["Số tiền"] || r["Amount"];
        const amount = this.parseMoney(rawAmount);
        if (amount <= 0) {
          errors.push(`Dòng ${line}: Số tiền phải lớn hơn 0.`);
          continue;
        }

        const rawCat = (r["Danh_Muc"] || r["Danh mục"] || "").toString().trim().toLowerCase();
        const catId = catMap[rawCat] || catMap[this.normalizeString(rawCat)] || null;

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

    // 8. IMPORT VÀO ĐỐI SOÁT FNB
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

        const kv = this.parseMoney(r["Doanh_Thu_KiotViet"] || r["KiotViet"] || 0);
        const cash = this.parseMoney(r["Tien_Mat_Thuc_Thu"] || r["Tiền mặt"] || 0);
        const mb = this.parseMoney(r["Chuyen_Khoan_MB"] || r["CK MB"] || 0);
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

      const { data, error } = await client
        .from("fnb_sales_reconciliations")
        .upsert(validPayloads, { onConflict: "reconciliation_date,created_by" })
        .select("id");

      if (error) throw error;

      return {
        successCount: data.length,
        totalRows: rows.length,
        errors
      };
    },

    // 9. IMPORT VÀO SỔ CHI LƯƠNG & CHUYỂN KHOẢN (ĐÃ FIX ÁNH XẠ DROPLIST)
    async importSalaryBankExpenses(rows, businessUnits) {
      const client = window.SupabaseConfig.getClient();
      if (!client) throw new Error("Chưa kết nối Supabase.");

      const unitMap = {};
      businessUnits.forEach(u => {
        unitMap[u.code.toUpperCase()] = u.id;
        unitMap[u.name.toLowerCase()] = u.id;
        unitMap[this.normalizeString(u.name)] = u.id;
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
        const unitId = unitMap[rawUnit.toUpperCase()] || unitMap[rawUnit.toLowerCase()] || unitMap[this.normalizeString(rawUnit)];
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
        const amount = this.parseMoney(rawAmount);
        if (amount <= 0) {
          errors.push(`Dòng ${line}: Số tiền phải lớn hơn 0.`);
          continue;
        }

        // Tự động map từ nhãn tiếng Việt / droplist về mã hợp lệ check constraint của CSDL
        const rawCat = (r["Khoan_Muc_Chi"] || r["Khoản mục"] || "other_expense").toString().trim();
        const catKey = this.mapSalaryExpenseCategory(rawCat);

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
          expense_category: catKey,
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
