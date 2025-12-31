# MittBolag - Bokföringssystem

Ett svenskt bokföringssystem byggt med .NET 8 och React.

## Funktioner

- **Autentisering** - Enkel inloggning med email och lösenord (JWT-baserad)
- **Företagsprofil** - Hantera företagsuppgifter
- **Kontoplan** - Fördefinierad BAS-kontoplan med möjlighet att lägga till egna konton
- **Fakturering** - Skapa och hantera kundfakturor
- **Bokföring** - Manuella verifikationer med dubbel bokföring
- **Lönehantering** - Registrera anställda och kör lön
- **Rapporter** - Resultaträkning, balansräkning och momsrapport

## Teknisk Stack

| Komponent | Teknologi |
|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS |
| Backend | .NET 8 Web API |
| Databas | SQLite |
| ORM | Entity Framework Core |
| Auth | JWT Bearer tokens |

## Kom igång

### Förutsättningar

- .NET 8 SDK
- Node.js 18+
- npm

### Starta backend

```bash
cd backend/MittBolag.Api
dotnet run
```

Backend startar på http://localhost:5157

### Starta frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend startar på http://localhost:5173

## Användning

1. Öppna http://localhost:5173 i webbläsaren
2. Registrera ett nytt konto
3. Skapa ditt företag
4. Börja använda systemet!

## API-dokumentation

Swagger UI finns tillgänglig på http://localhost:5157/swagger när backend körs.

## Framtida utveckling

- BankID-inloggning
- Bankintegration (SIE-filer)
- Skatteverket-koppling
- Automatisk momsdeklaration
- PDF-generering av fakturor

## Licens

Privat projekt - alla rättigheter förbehållna.

