# Plan My Future

A personal finance app that helps you take control of your economy.

## 🌐 Live

**https://planmyfuture.org**

## ✨ Features

### Step-by-step Onboarding
- 📊 Enter your salary after tax
- 🏠 Add mortgage, interest rate, and amortization
- 💳 Register other debts (student loans, car loans, credit cards, etc.)
- 💰 Add assets (savings accounts, investments, pension)
- ✅ Create account and see your overview immediately

### Dashboard
- **Net Worth** - View your total assets minus debts
- **Monthly Overview** - Income, expenses, and what's left over
- **Debts** - All loans with interest rates and amortization
- **Assets** - Savings accounts, investments, and pension
- **Future Forecast** - See how your finances develop over time

### Multi-language Support
- 🇬🇧 English (default)
- 🇸🇪 Swedish
- Language preference is saved to your profile

### GDPR Compliance
- 🔒 Full data deletion support
- Delete your account and all associated data at any time
- Confirmation email sent upon deletion

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS 4 |
| Backend | .NET 8 Web API |
| Database | PostgreSQL (Neon) |
| ORM | Entity Framework Core |
| Auth | JWT Bearer tokens |
| Email | Resend |
| Hosting | Render |

## 🚀 Local Development

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

## 📦 Deployment

The app is deployed on Render with Docker. Push to the `main` branch triggers automatic deployment.

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 📧 Email Notifications

- **Welcome email** - Sent upon registration
- **Password reset** - Secure link to change password
- **Admin notifications** - On new accounts and logins
- **GDPR deletion confirmation** - Sent when account is deleted

## 🔐 Security

- Protected routes require authentication
- JWT tokens for secure API access
- Passwords hashed with BCrypt
- HTTPS enforced in production

## 📄 License

Private project - all rights reserved.
