# GST Billing System

A full-stack GST billing application for small/medium retail shops: manage parties (customers), maintain a
reusable item catalog, create GST-compliant invoices with automatic CGST/SGST/IGST calculation, generate
downloadable PDF invoices, and track bill history with a sales dashboard.

**Stack:** Express.js + PostgreSQL (backend) · React + Vite + Bootstrap (frontend)

## Project Structure

```
gst-billing-system/
├── backend/
│   ├── db/
│   │   ├── schema.sql        # PostgreSQL table definitions
│   │   └── init.js           # Script to apply schema.sql
│   ├── src/
│   │   ├── config/db.js      # PostgreSQL connection pool
│   │   ├── controllers/      # parties, items, bills, dashboard
│   │   ├── routes/           # Express route definitions
│   │   └── utils/
│   │       ├── gstCalculator.js  # CGST/SGST/IGST logic
│   │       └── pdfGenerator.js   # PDF invoice generation (pdfkit)
│   ├── server.js             # App entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/Navbar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Parties.jsx
    │   │   ├── Items.jsx
    │   │   ├── CreateBill.jsx
    │   │   ├── BillHistory.jsx
    │   │   └── BillView.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── .env.example
```

## 1. Prerequisites

- Node.js 18+
- PostgreSQL 13+ running locally (or a remote instance)

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials and shop details:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gst_billing
DB_USER=postgres
DB_PASSWORD=your_password_here

SHOP_NAME=Your Shop Name
SHOP_ADDRESS=123, Main Market, Rajkot, Gujarat
SHOP_STATE=Gujarat
SHOP_GSTIN=24AAAAA0000A1Z5
```

Create the database, then apply the schema:

```bash
# create the database (one time)
createdb gst_billing
# or: psql -U postgres -c "CREATE DATABASE gst_billing;"

# apply schema
npm run db:init
```

Start the backend:

```bash
npm run dev      # with nodemon (auto-reload)
# or
npm start
```

The API runs at `http://localhost:5000/api`. Health check: `GET /api/health`.

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

> `VITE_API_URL` in `frontend/.env` must point at your backend (default `http://localhost:5000/api`).

## 4. GST Calculation Logic

For each bill line:
1. `Taxable Amount = Rate × Quantity`
2. If the party's state **matches** the shop's state (`SHOP_STATE` in `.env`):
   - `CGST = SGST = (GST% ÷ 2) of Taxable Amount`
3. If the party's state is **different**:
   - `IGST = GST% of Taxable Amount`
4. `Line Total = Taxable Amount + Tax Applied`
5. `Grand Total = Sum of all Line Totals`

This is computed server-side (source of truth) in `backend/src/utils/gstCalculator.js`, with a live preview
calculated in the frontend as you build a bill.

**Note:** Once a bill is saved, it is immutable by design (no edit endpoint) — this matches real invoicing
practice. To correct an error, create a new bill (a full credit-note workflow can be added as a future
enhancement).

## 5. API Endpoints

| Method | Endpoint                    | Description                          |
|--------|------------------------------|---------------------------------------|
| GET    | /api/parties                 | List parties (supports `?search=`)   |
| GET    | /api/parties/:id              | Get one party                        |
| GET    | /api/parties/:id/bills         | Party's bill history                 |
| POST   | /api/parties                 | Create party                         |
| PUT    | /api/parties/:id              | Update party                         |
| DELETE | /api/parties/:id              | Delete party                         |
| GET    | /api/items                   | List items (supports `?search=`)     |
| POST   | /api/items                   | Create item                          |
| PUT    | /api/items/:id                | Update item                          |
| DELETE | /api/items/:id                | Delete item                          |
| GET    | /api/bills                   | List bills (`?party=&from=&to=`)     |
| GET    | /api/bills/:id                 | Get bill with line items             |
| POST   | /api/bills                   | Create bill (auto-calculates tax)    |
| GET    | /api/bills/:id/pdf              | Download invoice PDF                 |
| PATCH  | /api/bills/:id/status           | Update payment status (bonus)        |
| GET    | /api/dashboard                | Sales/tax summary + recent bills     |

## 6. Notes on Deliverables

- To produce the **3 sample PDF invoices** required for submission: create 3 parties (mix same-state and
  different-state from your `SHOP_STATE` to exercise both CGST/SGST and IGST paths), add a few items, create
  3 bills via **New Bill**, then click **Download PDF** on each from the bill detail page.
- Bonus features implemented: payment status tracking (Paid/Unpaid/Partial) and a GST-slab picker
  (0/5/12/18/28%). Discount fields, Excel/CSV export, and multi-user login are left as extension points.

## 7. Tech Stack Summary (for your report)

- **Backend:** Node.js, Express.js, PostgreSQL (`pg` driver), `pdfkit` for PDF generation, `dotenv` for config
- **Frontend:** React 18, Vite, React Router, Bootstrap 5, Axios
