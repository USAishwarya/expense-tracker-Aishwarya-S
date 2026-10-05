# 💰 Expense Tracker

A clean, responsive **Expense Tracker** web app for recording income and expenses, built with plain **HTML, CSS and JavaScript**. There are no frameworks, libraries or build steps, and it runs by simply opening `index.html` in a browser.

**Live demo:** https://usaishwarya.github.io/expense-tracker-Aishwarya-S/
---

## Features

### Core features
- **Add transactions:** record an income or an expense with an amount, category, date and description.
- **Edit and delete:** update any transaction through the form, or remove it (with a confirmation prompt).
- **Financial overview:** summary cards show total income, total expenses and the current balance. The balance turns red when it goes negative.
- **Filtering:** filter the list by type (income or expense) and by category, with a one-click reset.
- **Persistent storage:** all data is saved in the browser's **Local Storage**, so it is still there after a refresh or after closing the browser.
- **Responsive design:** the layout adapts to desktop, tablet and mobile screens.

### Bonus features
- **Monthly summary:** pick any month (or "All time") to see income, expenses and net savings for that period.
- **Category-wise expense chart:** a donut chart with a legend that shows how much was spent in each category and its percentage. It is drawn with the HTML Canvas API, with no chart library.
- **Validation and helpful error messages:** the form checks for:
  - a missing or non-positive amount
  - an unrealistically large amount
  - no category selected
  - a missing or invalid date
  - an empty or too-short description

  Error messages appear next to the field and clear as soon as the input is fixed.

### Extra touches
- Categories change depending on the type (for example *Salary* for income, *Food* for expenses).
- Amounts are formatted in Indian Rupees (₹) using `Intl.NumberFormat`.
- Transactions are sorted with the newest date first.
- User input is escaped before it is displayed, which prevents HTML injection.
- Corrupted or unavailable Local Storage is handled without crashing the app.

---

## How to Run

No installation is needed.

1. **Get the code**
   ```bash
   git clone https://github.com/USAishwarya/expense-tracker-Aishwarya-S.git
   cd expense-tracker-Aishwarya-S
   ```
   You can also download the repository as a ZIP from GitHub and extract it.

2. **Open the app**: double-click `index.html`, or right-click it and choose *Open with* → Chrome, Edge or Firefox.

**Optional: run on a local server**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

> Keep `index.html`, `style.css` and `script.js` in the same folder with these exact file names, because the page loads them by name.

---

## How to Use

1. Choose **Expense** or **Income**, then fill in the amount, category, date and description.
2. Click **Add Transaction**. The totals, the list, the monthly summary and the chart update immediately.
3. Use **Edit** or **Delete** on any transaction in the list.
4. Use the **Type** and **Category** filters above the list to narrow it down. Click **Reset** to clear them.
5. Use the **Month** dropdown in the Monthly Summary section to see a specific month's figures and its expense chart.

---

## Project Structure

```
expense-tracker-YOUR-NAME/
├── index.html   # Page structure and markup
├── style.css    # Styling and responsive layout
├── script.js    # App logic: transactions, validation, filters, Local Storage, chart
└── README.md    # Project documentation
```

## Technologies Used

- **HTML5**: semantic markup and form controls
- **CSS3**: Flexbox, Grid, CSS variables and media queries for responsiveness
- **JavaScript (ES6)**: DOM manipulation, Local Storage API and Canvas API

---

## Data and Privacy

All data stays **only in your own browser** (Local Storage) and is never sent to a server. This means:
- Data persists across refreshes and browser restarts.
- Data is separate in each browser and each device.
- Clearing site data, or using a private/incognito window, removes it.

## Possible Improvements

- Export and import transactions as CSV or JSON
- Search by description
- Budget limits and alerts
- Dark mode

---

## Author

**YOUR NAME**
GitHub: [USAishwarya](https://github.com/USAishwarya)
