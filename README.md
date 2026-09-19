# GSTKhata - GST Billing & Retail Management System

GSTKhata is a full-stack GST Billing and Inventory Management application designed for Indian retail and electronics businesses. It features complete GST tax calculations (CGST, SGST, IGST), party ledger management, interactive analytics charts, PDF invoice generation, direct email dispatching, and role-based staff management.

## System Architecture

The application is structured as a single-repository full-stack system:

- Frontend: React 18, Vite, Bootstrap 5, Bootstrap Icons, ChartJS
- Backend: Node.js, Express.js, PostgreSQL (Neon Cloud / Local), PDFKit, Nodemailer
- Deployment: Configured for single-project monorepo deployment on Vercel

## Core Features

- Business Dashboard: Real-time revenue metrics, monthly GST trends, payment status distribution, and top-selling product analytics charts.
- GST Invoice Creation: Multi-item billing supporting intra-state (CGST + SGST) and inter-state (IGST) tax rules, automated HSN item lookup, and payment status tracking (Paid, Partial, Unpaid).
- Party & Customer Directory: Manage customer and vendor profiles, GSTIN validation, and default billing addresses.
- Electronics Catalog & Inventory: Manage items with unit prices, HSN codes, default GST slabs (18%, 28%), and stock tracking.
- Automated Email Invoicing: Dispatch official HTML tax invoices with attached PDFKit generated invoices via Nodemailer.
- Invoice History & CSV Export: Filter invoices by date range, search by customer or invoice number, export accounting data to CSV, and preview A4 formatted invoices.
- Staff & Role Management: Role-based access control (Owner, Admin, Billing Operator) with granular security permissions.
- Shop Profile Settings: Customizable business name, GSTIN, address, state, signature, and print preferences.

## Repository Structure

```
GST_Billing_System_Task/
├── api/
│   └── index.js              # Vercel serverless function handler
├── backend/
│   ├── db/                   # Database SQL schemas and migrations
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route logic handlers
│   │   ├── middleware/       # JWT auth & permission guards
│   │   ├── routes/           # REST API route specifications
│   │   ├── utils/            # PDF generation & email services
│   │   └── app.js            # Express application export
│   ├── server.js             # Local Node server entry point
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── src/                  # React components, pages, and routes
│   └── .env.example          # Frontend environment variables template
├── vercel.json               # Vercel single-project build configuration
├── package.json              # Monorepo dependencies and scripts
├── .gitignore                # Git exclusion rules
└── LICENSE                   # MIT Open Source License
```

## Setup & Local Development

### Prerequisites

- Node.js (v18.x or higher)
- npm (v9.x or higher)
- PostgreSQL database (Neon Cloud PostgreSQL or local PostgreSQL instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/GSTKhata.git
   cd GSTKhata
   ```

2. Install dependencies for all packages:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env` or create `backend/.env` with your credentials:
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   ```

4. Start Local Development Server:
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:5173 and backend on http://localhost:5000.

## Vercel Deployment (Single Project)

This repository is configured to deploy both the Express API and Vite React frontend under a single Vercel project using Vercel Serverless Functions.

### Deployment Steps

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into Vercel as a New Project.
3. Keep the Root Directory as `/` (default).
4. Vercel automatically detects the build settings via `vercel.json`:
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
5. Configure Environment Variables in Vercel Project Settings:
   - `DATABASE_URL`: Your PostgreSQL database connection string
   - `JWT_SECRET`: Secret key for JWT verification
   - `SMTP_USER`: Email address for dispatching invoices
   - `SMTP_PASS`: Gmail App Password or SMTP password
   - `SHOP_NAME`: Business display name
   - `SHOP_GSTIN`: Business GSTIN number
6. Deploy the project. Vercel will build the React static assets and route all `/api/*` endpoints to the serverless function.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
