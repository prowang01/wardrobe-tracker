# 👗 Wardrobe Tracker

A personal wardrobe management app to track clothing purchases across their full lifecycle — from wishlist to return, resale or refund — with real-time financial tracking.

> Built as a portfolio project with React + TypeScript + Vite + Tailwind-inspired inline styles.

![Wardrobe Tracker Preview](https://raw.githubusercontent.com/prowang01/wardrobe-tracker/main/preview.png)

---

## ✨ Features

### 📊 Financial Dashboard
- **Net balance** displayed in a live SVG donut chart (spent / pending refund / recovered)
- Clickable stat tiles to filter articles by financial status
- Per-brand insights: keep rate, spend, recovery and breakdown mini pie chart

### 👕 Article Management
- Add, edit and delete clothing items with a clean modal form
- 9 lifecycle statuses: Wishlist → Ordered → Shipped → Kept / Returned / Refunded / Resold
- Category, size, color, reference, payment method, product URL and photo URL fields
- Photo lightbox on click

### ⚡ Inline Editing
- Click any field directly in the detail drawer to edit it instantly
- Status and category as clickable badge dropdowns
- Payment method editable with bank name field
- All changes persist to `localStorage` with no page reload

### 🔍 Smart Filtering
- Filter by category, status, brand and payment method
- Each filter has its own search input and scrollable list
- Active filter count with one-click reset

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Icons | lucide-react |
| Styling | Inline styles (no CSS framework) |
| Persistence | localStorage |
| Deployment | Vercel *(coming soon)* |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/prowang01/wardrobe-tracker.git
cd wardrobe-tracker

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
src/
└── App.tsx       # All application code (components, state, logic)
```

The entire app lives in a single `App.tsx` file (~1000 lines), intentionally keeping the architecture simple and readable for a portfolio project.

---

## 💡 Financial Logic

| Metric | Definition |
|--------|-----------|
| `totalDepense` | Sum of all items that were ordered (excludes Wishlist) |
| `recupere` | Sum of Refunded + Resold items |
| `enAttente` | Sum of items with status "En cours de remboursement" |
| `bilanNet` | `totalDepense − recupere` |
| `perdu` | `max(bilanNet − enAttente, 0)` |

---

## 📸 Screenshots

> *Add your own screenshots here*

| Dashboard | Article detail | Add item |
|-----------|---------------|----------|
| ![](./screenshots/dashboard.png) | ![](./screenshots/drawer.png) | ![](./screenshots/form.png) |

---

## 🗺 Roadmap

- [ ] Deploy on Vercel with live demo link
- [ ] Export data as CSV
- [ ] Auto-fill item details from product URL
- [ ] Authentication + cloud sync
- [ ] Mobile-responsive layout

---

## 👤 Author

**Prosper Wang**
- GitHub: [@prowang01](https://github.com/prowang01)

---

## 📄 License

MIT
