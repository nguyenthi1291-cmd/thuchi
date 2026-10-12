// ============================================================
// DASHBOARD & THỐNG KÊ (DASHBOARD CALCULATOR)
// Tính toán số liệu thực tế từ dữ liệu giao dịch Supabase
// ============================================================

const DashboardManager = {
  // Định dạng tiền tệ VND
  formatVND(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Tính toán các chỉ số thống kê từ danh sách giao dịch hiện tại
  calculateStats(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;
    const count = transactions.length;

    // Phân loại theo từng mảng kinh doanh
    const unitsSummary = {
      SON_MAI: { name: "Sơn Mài", income: 0, expense: 0, count: 0 },
      FNB: { name: "F&B", income: 0, expense: 0, count: 0 },
      VAN_PHONG: { name: "Văn phòng", income: 0, expense: 0, count: 0 },
      OTHER: { name: "Khác", income: 0, expense: 0, count: 0 }
    };

    transactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      const type = tx.transaction_type;
      const unitCode = tx.business_units?.code || "OTHER";

      if (type === "income") {
        totalIncome += amt;
        if (unitsSummary[unitCode]) {
          unitsSummary[unitCode].income += amt;
        } else {
          unitsSummary.OTHER.income += amt;
        }
      } else if (type === "expense") {
        totalExpense += amt;
        if (unitsSummary[unitCode]) {
          unitsSummary[unitCode].expense += amt;
        } else {
          unitsSummary.OTHER.expense += amt;
        }
      }

      if (unitsSummary[unitCode]) {
        unitsSummary[unitCode].count += 1;
      }
    });

    // Chênh lệch thu - chi (theo quy chuẩn tài liệu: không dùng chữ "Lợi nhuận")
    const netBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      count,
      unitsSummary
    };
  },

  // Cập nhật giao diện Dashboard
  renderDashboard(transactions) {
    const stats = this.calculateStats(transactions);

    // Cập nhật 4 thẻ KPI chính
    const elTotalIncome = document.getElementById("kpi-total-income");
    const elTotalExpense = document.getElementById("kpi-total-expense");
    const elNetBalance = document.getElementById("kpi-net-balance");
    const elNetBadge = document.getElementById("kpi-net-badge");
    const elTxCount = document.getElementById("kpi-tx-count");

    if (elTotalIncome) elTotalIncome.textContent = this.formatVND(stats.totalIncome);
    if (elTotalExpense) elTotalExpense.textContent = this.formatVND(stats.totalExpense);
    
    if (elNetBalance) {
      elNetBalance.textContent = this.formatVND(stats.netBalance);
      elNetBalance.className = "kpi-value " + (stats.netBalance >= 0 ? "text-positive" : "text-negative");
    }

    if (elNetBadge) {
      if (stats.netBalance > 0) {
        elNetBadge.textContent = "Thặng dư (+)";
        elNetBadge.className = "badge badge-success";
      } else if (stats.netBalance < 0) {
        elNetBadge.textContent = "Thâm hụt (-)";
        elNetBadge.className = "badge badge-danger";
      } else {
        elNetBadge.textContent = "Cân bằng";
        elNetBadge.className = "badge badge-neutral";
      }
    }

    if (elTxCount) elTxCount.textContent = `${stats.count} giao dịch`;

    // Cập nhật thống kê 3 mảng kinh doanh
    this.renderUnitCard("son-mai", stats.unitsSummary.SON_MAI);
    this.renderUnitCard("fnb", stats.unitsSummary.FNB);
    this.renderUnitCard("van-phong", stats.unitsSummary.VAN_PHONG);
  },

  renderUnitCard(prefix, unitData) {
    if (!unitData) return;
    const net = unitData.income - unitData.expense;

    const elIncome = document.getElementById(`unit-${prefix}-income`);
    const elExpense = document.getElementById(`unit-${prefix}-expense`);
    const elNet = document.getElementById(`unit-${prefix}-net`);
    const elCount = document.getElementById(`unit-${prefix}-count`);

    if (elIncome) elIncome.textContent = this.formatVND(unitData.income);
    if (elExpense) elExpense.textContent = this.formatVND(unitData.expense);
    if (elNet) {
      elNet.textContent = this.formatVND(net);
      elNet.className = "unit-net-value " + (net >= 0 ? "text-positive" : "text-negative");
    }
    if (elCount) elCount.textContent = `${unitData.count} GD`;
  }
};

window.DashboardManager = DashboardManager;
