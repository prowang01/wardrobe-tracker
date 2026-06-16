# Wardrobe Tracker

I built this to stop losing track of online orders — returns, refunds, resales. It turns into real money fast when you're not paying attention.

## Demo

https://github.com/user-attachments/assets/b80e4e3b-5927-483e-b30c-a60b8e97c98b

## What it does

Track every clothing item from wishlist to refund. The dashboard shows you exactly how much you've actually spent after returning things, and breaks it down by brand.

- **9 lifecycle statuses** — Wishlist, Ordered, Shipped, Kept, To Return, Returning, Refund Pending, Refunded, Resold
- **Live financial summary** — spent / pending refund / recovered, with a net balance donut chart that updates in real time
- **Inline editing** — click any field in the item drawer to edit it directly, no separate form
- **Brand insights** — keep rate per brand, spending breakdown, mini pie chart
- **Filters** — by category, status, brand, payment method

## Stack

React + TypeScript + Vite — no CSS framework, no backend, no auth. Data lives in `localStorage`. The whole app is a single `App.tsx` file, intentionally.

## Run locally

```bash
git clone https://github.com/prowang01/wardrobe-tracker.git
cd wardrobe-tracker
npm install
npm run dev
```
