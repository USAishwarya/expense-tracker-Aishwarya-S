(function () {
  "use strict";

  const STORAGE_KEY = "expense-tracker-transactions";

  const CATEGORIES = {
    expense: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"],
    income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  };
  const ALL_CATEGORIES = Array.from(new Set([...CATEGORIES.expense, ...CATEGORIES.income]));
  const CHART_COLORS = ["#4f46e5", "#16a34a", "#f59e0b", "#dc2626", "#0ea5e9", "#a855f7", "#14b8a6", "#ec4899", "#84cc16", "#64748b"];

  // ---------- State ----------
  let transactions = loadTransactions();

  // ---------- DOM ----------
  const $ = (id) => document.getElementById(id);
  const form = $("transactionForm");
  const els = {
    editId: $("editId"),
    amount: $("amount"),
    category: $("category"),
    date: $("date"),
    description: $("description"),
    submitBtn: $("submitBtn"),
    cancelBtn: $("cancelBtn"),
    formTitle: $("formTitle"),
    list: $("transactionList"),
    empty: $("emptyState"),
    count: $("resultCount"),
    filterType: $("filterType"),
    filterCategory: $("filterCategory"),
    clearFilters: $("clearFilters"),
    totalIncome: $("totalIncome"),
    totalExpense: $("totalExpense"),
    balance: $("balance"),
    summaryMonth: $("summaryMonth"),
    mIncome: $("mIncome"),
    mExpense: $("mExpense"),
    mNet: $("mNet"),
    canvas: $("categoryChart"),
    legend: $("chartLegend"),
    chartEmpty: $("chartEmpty"),
  };

  // ---------- Storage ----------
  function loadTransactions() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      alert("Could not save data. Local Storage may be full or disabled.");
    }
  }

  // ---------- Helpers ----------
  const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
  const formatMoney = (n) => currency.format(n);

  function formatDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  function monthLabel(key) {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }

  function todayISO() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function getType() {
    return form.querySelector('input[name="type"]:checked').value;
  }

  function setType(type) {
    form.querySelector(`input[name="type"][value="${type}"]`).checked = true;
  }

  // ---------- Category dropdowns ----------
  function populateFormCategories(selected) {
    const list = CATEGORIES[getType()];
    els.category.innerHTML =
      '<option value="">Select category</option>' +
      list.map((c) => `<option value="${c}">${c}</option>`).join("");
    if (selected && list.includes(selected)) els.category.value = selected;
  }

  function populateFilterCategories() {
    els.filterCategory.innerHTML =
      '<option value="all">All</option>' +
      ALL_CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("");
  }

  // ---------- Validation ----------
  function setError(field, message) {
    const input = els[field];
    const wrapper = input.closest(".field");
    $(field + "Error").textContent = message || "";
    wrapper.classList.toggle("invalid", Boolean(message));
  }

  function validate() {
    let ok = true;

    const amount = parseFloat(els.amount.value);
    if (els.amount.value.trim() === "") {
      setError("amount", "Please enter an amount."); ok = false;
    } else if (isNaN(amount) || amount <= 0) {
      setError("amount", "Amount must be greater than 0."); ok = false;
    } else if (amount > 1000000000) {
      setError("amount", "Amount is too large."); ok = false;
    } else {
      setError("amount", "");
    }

    if (!els.category.value) {
      setError("category", "Please select a category."); ok = false;
    } else {
      setError("category", "");
    }

    if (!els.date.value) {
      setError("date", "Please choose a date."); ok = false;
    } else if (isNaN(new Date(els.date.value).getTime())) {
      setError("date", "Please enter a valid date."); ok = false;
    } else {
      setError("date", "");
    }

    const desc = els.description.value.trim();
    if (!desc) {
      setError("description", "Please add a short description."); ok = false;
    } else if (desc.length < 2) {
      setError("description", "Description must be at least 2 characters."); ok = false;
    } else {
      setError("description", "");
    }

    return ok;
  }

  function clearErrors() {
    ["amount", "category", "date", "description"].forEach((f) => setError(f, ""));
  }

  // ---------- Form actions ----------
  function resetForm() {
    form.reset();
    els.editId.value = "";
    setType("expense");
    populateFormCategories();
    els.date.value = todayISO();
    els.submitBtn.textContent = "Add Transaction";
    els.formTitle.textContent = "Add Transaction";
    els.cancelBtn.classList.add("hidden");
    clearErrors();
  }

  function startEdit(id) {
    const t = transactions.find((x) => x.id === id);
    if (!t) return;
    els.editId.value = t.id;
    setType(t.type);
    populateFormCategories(t.category);
    els.amount.value = t.amount;
    els.date.value = t.date;
    els.description.value = t.description;
    els.submitBtn.textContent = "Update Transaction";
    els.formTitle.textContent = "Edit Transaction";
    els.cancelBtn.classList.remove("hidden");
    clearErrors();
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    els.amount.focus();
  }

  function deleteTransaction(id) {
    if (!confirm("Delete this transaction?")) return;
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions();
    if (els.editId.value === id) resetForm();
    render();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      type: getType(),
      amount: Math.round(parseFloat(els.amount.value) * 100) / 100,
      category: els.category.value,
      date: els.date.value,
      description: els.description.value.trim(),
    };

    const editId = els.editId.value;
    if (editId) {
      transactions = transactions.map((t) => (t.id === editId ? { ...t, ...data } : t));
    } else {
      transactions.push({ id: uid(), ...data });
    }

    saveTransactions();
    resetForm();
    render();
  });

  els.cancelBtn.addEventListener("click", resetForm);

  form.querySelectorAll('input[name="type"]').forEach((r) =>
    r.addEventListener("change", () => populateFormCategories())
  );

  // Clear a field's error as soon as the user fixes it
  ["amount", "category", "date", "description"].forEach((f) =>
    els[f].addEventListener("input", () => {
      if ($(f + "Error").textContent) validate();
    })
  );

  // ---------- Filters ----------
  els.filterType.addEventListener("change", renderList);
  els.filterCategory.addEventListener("change", renderList);
  els.clearFilters.addEventListener("click", () => {
    els.filterType.value = "all";
    els.filterCategory.value = "all";
    renderList();
  });

  function getFiltered() {
    const type = els.filterType.value;
    const cat = els.filterCategory.value;
    return transactions
      .filter((t) => (type === "all" || t.type === type) && (cat === "all" || t.category === cat))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  // ---------- Rendering ----------
  function renderTotals() {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const bal = income - expense;
    els.totalIncome.textContent = formatMoney(income);
    els.totalExpense.textContent = formatMoney(expense);
    els.balance.textContent = formatMoney(bal);
    els.balance.style.color = bal < 0 ? "var(--expense)" : "var(--text)";
  }

  function renderList() {
    const items = getFiltered();
    els.list.innerHTML = items
      .map((t) => {
        const sign = t.type === "income" ? "+" : "−";
        return `
        <li class="transaction t-${t.type}" data-id="${t.id}">
          <span class="t-badge"></span>
          <div class="t-info">
            <div class="t-desc">${escapeHTML(t.description)}</div>
            <div class="t-meta">${escapeHTML(t.category)} • ${formatDate(t.date)}</div>
          </div>
          <div class="t-amount">${sign}${formatMoney(t.amount)}</div>
          <div class="t-actions">
            <button class="icon-btn" data-action="edit" aria-label="Edit transaction">✏️ Edit</button>
            <button class="icon-btn danger" data-action="delete" aria-label="Delete transaction">🗑️ Delete</button>
          </div>
        </li>`;
      })
      .join("");

    els.empty.classList.toggle("hidden", items.length > 0);
    els.count.textContent = items.length
      ? `Showing ${items.length} of ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`
      : "";
  }

  els.list.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.closest(".transaction").dataset.id;
    if (btn.dataset.action === "edit") startEdit(id);
    else deleteTransaction(id);
  });

  // ---------- Monthly summary & chart ----------
  function populateMonths() {
    const previous = els.summaryMonth.value;
    const months = Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)))).sort().reverse();
    const current = todayISO().slice(0, 7);
    if (!months.includes(current)) months.unshift(current);

    els.summaryMonth.innerHTML =
      '<option value="all">All time</option>' +
      months.map((m) => `<option value="${m}">${monthLabel(m)}</option>`).join("");

    if (previous && (previous === "all" || months.includes(previous))) els.summaryMonth.value = previous;
    else els.summaryMonth.value = current;
  }

  function renderSummary() {
    const month = els.summaryMonth.value;
    const scope = month === "all" ? transactions : transactions.filter((t) => t.date.startsWith(month));

    const income = scope.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = scope.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const net = income - expense;

    els.mIncome.textContent = formatMoney(income);
    els.mExpense.textContent = formatMoney(expense);
    els.mNet.textContent = formatMoney(net);
    els.mNet.className = net >= 0 ? "positive" : "negative";

    const byCat = {};
    scope.filter((t) => t.type === "expense").forEach((t) => {
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    });
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    drawChart(entries, expense);
  }

  function drawChart(entries, total) {
    const canvas = els.canvas;
    const size = 200;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const hasData = entries.length > 0 && total > 0;
    canvas.classList.toggle("hidden", !hasData);
    els.legend.classList.toggle("hidden", !hasData);
    els.chartEmpty.classList.toggle("hidden", hasData);
    if (!hasData) { els.legend.innerHTML = ""; return; }

    const cx = size / 2, cy = size / 2, outer = 95, inner = 58;
    let start = -Math.PI / 2;

    entries.forEach(([, value], i) => {
      const slice = (value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outer, start, start + slice);
      ctx.arc(cx, cy, inner, start + slice, start, true);
      ctx.closePath();
      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.fill();
      start += slice;
    });

    ctx.fillStyle = getComputedStyle(document.body).color;
    ctx.textAlign = "center";
    ctx.font = "600 13px Segoe UI, Arial, sans-serif";
    ctx.fillText("Total", cx, cy - 4);
    ctx.font = "700 13px Segoe UI, Arial, sans-serif";
    ctx.fillText(formatMoney(total), cx, cy + 14);

    els.legend.innerHTML = entries
      .map(([name, value], i) => {
        const pct = ((value / total) * 100).toFixed(1);
        return `<li><span class="dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
          <span class="l-name">${escapeHTML(name)}</span>
          <span class="l-val">${formatMoney(value)} (${pct}%)</span></li>`;
      })
      .join("");
  }

  els.summaryMonth.addEventListener("change", renderSummary);

  // ---------- Master render ----------
  function render() {
    renderTotals();
    renderList();
    populateMonths();
    renderSummary();
  }

  // ---------- Init ----------
  populateFilterCategories();
  resetForm();
  render();
})();
