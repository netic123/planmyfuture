using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface ICompanyService
{
    Task<List<CompanyDto>> GetCompaniesAsync(int userId);
    Task<CompanyDto?> GetCompanyAsync(int companyId, int userId);
    Task<CompanyDto?> CreateCompanyAsync(CreateCompanyRequest request, int userId);
    Task<CompanyDto?> UpdateCompanyAsync(int companyId, UpdateCompanyRequest request, int userId);
    Task<bool> DeleteCompanyAsync(int companyId, int userId);
    Task InitializeDefaultAccountsAsync(int companyId);
}

public class CompanyService : ICompanyService
{
    private readonly AppDbContext _context;

    public CompanyService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CompanyDto>> GetCompaniesAsync(int userId)
    {
        return await _context.Companies
            .Where(c => c.UserId == userId)
            .Select(c => ToDto(c))
            .ToListAsync();
    }

    public async Task<CompanyDto?> GetCompanyAsync(int companyId, int userId)
    {
        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.Id == companyId && c.UserId == userId);

        return company != null ? ToDto(company) : null;
    }

    public async Task<CompanyDto?> CreateCompanyAsync(CreateCompanyRequest request, int userId)
    {
        var company = new Company
        {
            Name = request.Name,
            OrganizationNumber = request.OrganizationNumber,
            Address = request.Address,
            PostalCode = request.PostalCode,
            City = request.City,
            Phone = request.Phone,
            Email = request.Email,
            Website = request.Website,
            BankAccount = request.BankAccount,
            Bankgiro = request.Bankgiro,
            Plusgiro = request.Plusgiro,
            CurrentFiscalYear = DateTime.Now.Year,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        // Initialize default BAS accounts
        await InitializeDefaultAccountsAsync(company.Id);

        return ToDto(company);
    }

    public async Task<CompanyDto?> UpdateCompanyAsync(int companyId, UpdateCompanyRequest request, int userId)
    {
        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.Id == companyId && c.UserId == userId);

        if (company == null) return null;

        company.Name = request.Name;
        company.OrganizationNumber = request.OrganizationNumber;
        company.Address = request.Address;
        company.PostalCode = request.PostalCode;
        company.City = request.City;
        company.Phone = request.Phone;
        company.Email = request.Email;
        company.Website = request.Website;
        company.BankAccount = request.BankAccount;
        company.Bankgiro = request.Bankgiro;
        company.Plusgiro = request.Plusgiro;

        await _context.SaveChangesAsync();
        return ToDto(company);
    }

    public async Task<bool> DeleteCompanyAsync(int companyId, int userId)
    {
        var company = await _context.Companies
            .FirstOrDefaultAsync(c => c.Id == companyId && c.UserId == userId);

        if (company == null) return false;

        _context.Companies.Remove(company);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task InitializeDefaultAccountsAsync(int companyId)
    {
        var defaultAccounts = new List<Account>
        {
            // Tillgångar (1xxx)
            new() { AccountNumber = "1510", Name = "Kundfordringar", Type = AccountType.Asset, CompanyId = companyId },
            new() { AccountNumber = "1910", Name = "Kassa", Type = AccountType.Asset, CompanyId = companyId },
            new() { AccountNumber = "1920", Name = "Plusgiro", Type = AccountType.Asset, CompanyId = companyId },
            new() { AccountNumber = "1930", Name = "Företagskonto", Type = AccountType.Asset, CompanyId = companyId },
            new() { AccountNumber = "1940", Name = "Bankgiro", Type = AccountType.Asset, CompanyId = companyId },
            
            // Skulder (2xxx)
            new() { AccountNumber = "2440", Name = "Leverantörsskulder", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2610", Name = "Utgående moms 25%", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2620", Name = "Utgående moms 12%", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2630", Name = "Utgående moms 6%", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2640", Name = "Ingående moms", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2650", Name = "Redovisningskonto moms", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2710", Name = "Personalskatter", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2731", Name = "Avräkning lagstadgade sociala avgifter", Type = AccountType.Liability, CompanyId = companyId },
            new() { AccountNumber = "2920", Name = "Upplupna semesterlöner", Type = AccountType.Liability, CompanyId = companyId },
            
            // Intäkter (3xxx)
            new() { AccountNumber = "3001", Name = "Försäljning tjänster 25%", Type = AccountType.Revenue, CompanyId = companyId },
            new() { AccountNumber = "3002", Name = "Försäljning varor 25%", Type = AccountType.Revenue, CompanyId = companyId },
            new() { AccountNumber = "3003", Name = "Försäljning tjänster 12%", Type = AccountType.Revenue, CompanyId = companyId },
            new() { AccountNumber = "3004", Name = "Försäljning varor 12%", Type = AccountType.Revenue, CompanyId = companyId },
            new() { AccountNumber = "3005", Name = "Försäljning tjänster 6%", Type = AccountType.Revenue, CompanyId = companyId },
            new() { AccountNumber = "3006", Name = "Försäljning varor 6%", Type = AccountType.Revenue, CompanyId = companyId },
            new() { AccountNumber = "3041", Name = "Försäljning utomlands", Type = AccountType.Revenue, CompanyId = companyId },
            
            // Kostnader (4xxx-8xxx)
            new() { AccountNumber = "4010", Name = "Inköp material och varor", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "5010", Name = "Lokalhyra", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "5410", Name = "Förbrukningsinventarier", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "5800", Name = "Resekostnader", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "6110", Name = "Kontorsmaterial", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "6200", Name = "Telefon och internet", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "6570", Name = "Bankkostnader", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "7010", Name = "Löner", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "7510", Name = "Arbetsgivaravgifter", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "7610", Name = "Utbildning", Type = AccountType.Expense, CompanyId = companyId },
            new() { AccountNumber = "8310", Name = "Ränteintäkter", Type = AccountType.FinancialIncome, CompanyId = companyId },
            new() { AccountNumber = "8410", Name = "Räntekostnader", Type = AccountType.FinancialExpense, CompanyId = companyId }
        };

        _context.Accounts.AddRange(defaultAccounts);
        await _context.SaveChangesAsync();
    }

    private static CompanyDto ToDto(Company company) => new(
        company.Id,
        company.Name,
        company.OrganizationNumber,
        company.Address,
        company.PostalCode,
        company.City,
        company.Phone,
        company.Email,
        company.Website,
        company.BankAccount,
        company.Bankgiro,
        company.Plusgiro,
        company.CurrentFiscalYear,
        company.CreatedAt
    );
}

