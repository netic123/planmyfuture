# Plan My Future

A comprehensive personal finance and business management application.

## 🌐 Live Demo

**https://planmyfuture.onrender.com**

## Features

### Personal Finance (My Finances)
- **Dashboard** - Track your net worth over time
- **Assets** - Manage bank accounts and investments
- **Debts** - Track loans and mortgages with equity calculations
- **Budget** - Plan and monitor your monthly spending
- **Tax & Pension** - Swedish tax calculations and pension projections

### Business Management (My Business)
- **Company Profile** - Manage company details
- **Invoicing** - Create and manage customer invoices
- **Expenses** - Track business expenses
- **Employees** - Manage employees and payroll
- **VAT Reports** - Generate VAT reports
- **Year-End** - Annual accounting reports

### Gig Economy (My Gig)
- **Browse Gigs** - Find freelance opportunities
- **Post Gigs** - Create gig listings
- **Profile** - Manage your consultant profile

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS |
| Backend | .NET 8 Web API |
| Database | SQLite |
| ORM | Entity Framework Core |
| Auth | JWT Bearer tokens |
| Hosting | Render (Free tier) |

## Local Development

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- npm

### Start Backend

```bash
cd backend/MyFuture.Api
dotnet run
```

Backend runs on http://localhost:5157

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Deployment

The app is deployed on Render using Docker. Push to `main` branch triggers automatic deployment.

### Manual Deployment

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## API Documentation

Swagger UI available at http://localhost:5157/swagger (development mode only).

## License

Private project - all rights reserved.
