# 👕 Wardrobe Tracker

A personal tool to track clothing purchases, returns, refunds and resales, with a live treasury dashboard.

## Why I built this

I found myself juggling tons of fashion purchases across multiple platforms (Uniqlo, COS, Adidas, Zara...) and resales on Vinted, with refunds in progress and orders on the way. 

No existing app tracked the financial side of it, they all focus on outfit planning, not cashflow.

So I built my own.

## What it does

- **Add clothing items** with name, brand, price, size, color and product reference
- **Track status** across the full lifecycle: Wishlist → Ordered → In delivery → Kept / To return / Return in progress / Refund pending → Refunded / Resold
- **Live treasury dashboard** with an interactive donut chart showing:
  - Net balance (what you've actually spent)
  - Pending refunds (money coming back)
  - Recovered (refunded + resold)
- **Filter by status** to see only what's in delivery, only returns, etc.
- **Edit or delete** any item at any time
- **Persistent data** via localStorage : everything stays between sessions

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- localStorage (no backend)

## Getting started

```bash
git clone https://github.com/prowang01/wardrobe-tracker.git
cd wardrobe-tracker
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Roadmap

- [ ] Multi-account support (Revolut, PCS, cash)
- [ ] Product photo upload
- [ ] Stats by brand
- [ ] Deploy online (Vercel)