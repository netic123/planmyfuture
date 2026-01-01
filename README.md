# Min Ekonomi

En personlig ekonomiapp som hjälper dig att få koll på din ekonomi.

## 🌐 Live

**https://planmyfuture.org**

## ✨ Funktioner

### Steg-för-steg onboarding
- 📊 Ange din lön efter skatt
- 🏠 Lägg till bostadslån, ränta och amortering
- 💳 Registrera övriga skulder (studielån, billån, kreditkort, etc.)
- 💰 Lägg till tillgångar (sparkonton, investeringar, pension)
- ✅ Skapa konto och se din översikt direkt

### Dashboard
- **Nettoförmögenhet** - Se dina totala tillgångar minus skulder
- **Månadsöversikt** - Inkomster, utgifter och vad som blir kvar
- **Skulder** - Alla lån med räntor och amortering
- **Tillgångar** - Sparkonton, investeringar och pension
- **Framtidsprognos** - Se hur din ekonomi utvecklas över tid

### Flerspråksstöd
- 🇬🇧 Engelska (standard)
- 🇸🇪 Svenska
- Språkvalet sparas i din profil

## 🛠 Teknikstack

| Komponent | Teknologi |
|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS |
| Backend | .NET 8 Web API |
| Databas | PostgreSQL (Neon) |
| ORM | Entity Framework Core |
| Auth | JWT Bearer tokens |
| Email | Resend |
| Hosting | Render |

## 🚀 Lokal utveckling

### Förutsättningar

- .NET 8 SDK
- Node.js 18+
- npm

### Starta Backend

```bash
cd backend/MyFuture.Api
dotnet run
```

Backend körs på http://localhost:5157

### Starta Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend körs på http://localhost:5173

## 📦 Deployment

Appen är deployad på Render med Docker. Push till `main`-branchen triggar automatisk deployment.

```bash
git add .
git commit -m "Dina ändringar"
git push origin main
```

## 📧 Email-notifieringar

- **Välkomstmail** - Skickas vid registrering
- **Lösenordsåterställning** - Säker länk för att byta lösenord
- **Admin-notis** - Vid nya konton och inloggningar

## 📄 Licens

Privat projekt - alla rättigheter förbehållna.
