using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IYearEndService
{
    Task<YearEndSummary> GetYearEndSummaryAsync(int companyId, int fiscalYear);
    Task<TaxCalculation> GetTaxCalculationAsync(int companyId, int fiscalYear);
    Task<CloseYearResult> CloseYearAsync(int companyId, int fiscalYear);
}

public class YearEndService : IYearEndService
{
    private readonly AppDbContext _context;
    private const decimal CorporateTaxRate = 0.206m; // 20.6% bolagsskatt
    private const decimal EmployerContributionRate = 0.3142m; // 31.42% arbetsgivaravgift

    public YearEndService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<YearEndSummary> GetYearEndSummaryAsync(int companyId, int fiscalYear)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null) throw new ArgumentException("Company not found");

        var fromDate = new DateTime(fiscalYear, 1, 1);
        var toDate = new DateTime(fiscalYear, 12, 31);

        // Hämta alla konton med deras transaktioner
        var accounts = await _context.Accounts
            .Where(a => a.CompanyId == companyId)
            .ToListAsync();

        var voucherRows = await _context.VoucherRows
            .Include(r => r.Voucher)
            .Include(r => r.Account)
            .Where(r => r.Voucher.CompanyId == companyId 
                && r.Voucher.VoucherDate >= fromDate 
                && r.Voucher.VoucherDate <= toDate)
            .ToListAsync();

        // Beräkna saldon per konto
        var accountBalances = accounts.Select(a => new
        {
            Account = a,
            Debit = voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Debit),
            Credit = voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Credit),
            Balance = a.Type switch
            {
                AccountType.Asset => voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Debit - r.Credit),
                AccountType.Liability => voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Credit - r.Debit),
                AccountType.Revenue => voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Credit - r.Debit),
                AccountType.Expense => voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Debit - r.Credit),
                AccountType.FinancialIncome => voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Credit - r.Debit),
                AccountType.FinancialExpense => voucherRows.Where(r => r.AccountId == a.Id).Sum(r => r.Debit - r.Credit),
                _ => 0
            }
        }).ToList();

        // Resultaträkning
        var revenueAccounts = accountBalances
            .Where(a => a.Account.Type == AccountType.Revenue && a.Balance != 0)
            .Select(a => new AccountSummaryRow(a.Account.AccountNumber, a.Account.Name, a.Balance))
            .ToList();

        var expenseAccounts = accountBalances
            .Where(a => a.Account.Type == AccountType.Expense && a.Balance != 0)
            .Select(a => new AccountSummaryRow(a.Account.AccountNumber, a.Account.Name, a.Balance))
            .ToList();

        var totalRevenue = revenueAccounts.Sum(a => a.Amount);
        var totalExpenses = expenseAccounts.Sum(a => a.Amount);
        var operatingResult = totalRevenue - totalExpenses;

        var financialIncome = accountBalances
            .Where(a => a.Account.Type == AccountType.FinancialIncome)
            .Sum(a => a.Balance);

        var financialExpenses = accountBalances
            .Where(a => a.Account.Type == AccountType.FinancialExpense)
            .Sum(a => a.Balance);

        var resultBeforeTax = operatingResult + financialIncome - financialExpenses;
        var corporateTax = resultBeforeTax > 0 ? resultBeforeTax * CorporateTaxRate : 0;
        var netResult = resultBeforeTax - corporateTax;

        // Balansräkning
        var assetAccounts = accountBalances
            .Where(a => a.Account.Type == AccountType.Asset && a.Balance != 0)
            .Select(a => new AccountSummaryRow(a.Account.AccountNumber, a.Account.Name, a.Balance))
            .ToList();

        var liabilityAccounts = accountBalances
            .Where(a => a.Account.Type == AccountType.Liability && a.Balance != 0)
            .Select(a => new AccountSummaryRow(a.Account.AccountNumber, a.Account.Name, a.Balance))
            .ToList();

        var totalAssets = assetAccounts.Sum(a => a.Amount);
        var totalLiabilities = liabilityAccounts.Sum(a => a.Amount);
        var equity = totalAssets - totalLiabilities;

        // Hämta intäkter från fakturor om inga bokförda intäkter finns
        if (totalRevenue == 0)
        {
            // Hämta till minnet först för att undvika SQLite decimal Sum-begränsning
            var paidInvoices = await _context.Invoices
                .Where(i => i.CompanyId == companyId 
                    && i.Status == InvoiceStatus.Paid 
                    && i.InvoiceDate >= fromDate 
                    && i.InvoiceDate <= toDate)
                .ToListAsync();
            
            var invoiceRevenue = paidInvoices.Sum(i => i.TotalExcludingVat);
            
            totalRevenue = invoiceRevenue;
            operatingResult = totalRevenue - totalExpenses;
            resultBeforeTax = operatingResult + financialIncome - financialExpenses;
            corporateTax = resultBeforeTax > 0 ? resultBeforeTax * CorporateTaxRate : 0;
            netResult = resultBeforeTax - corporateTax;
        }

        var currentFiscalYear = company.CurrentFiscalYear ?? DateTime.Now.Year;
        
        return new YearEndSummary(
            fiscalYear,
            fromDate,
            toDate,
            currentFiscalYear > fiscalYear,
            totalRevenue,
            totalExpenses,
            operatingResult,
            financialIncome,
            financialExpenses,
            resultBeforeTax,
            corporateTax,
            netResult,
            totalAssets,
            totalLiabilities,
            equity,
            revenueAccounts,
            expenseAccounts,
            assetAccounts,
            liabilityAccounts
        );
    }

    public async Task<TaxCalculation> GetTaxCalculationAsync(int companyId, int fiscalYear)
    {
        var yearEnd = await GetYearEndSummaryAsync(companyId, fiscalYear);
        
        var fromDate = new DateTime(fiscalYear, 1, 1);
        var toDate = new DateTime(fiscalYear, 12, 31);

        // Moms från fakturor
        var invoices = await _context.Invoices
            .Where(i => i.CompanyId == companyId 
                && i.InvoiceDate >= fromDate 
                && i.InvoiceDate <= toDate)
            .ToListAsync();

        var outputVat = invoices.Sum(i => i.VatAmount);

        // Ingående moms från utlägg
        var expenses = await _context.Expenses
            .Where(e => e.CompanyId == companyId 
                && e.ExpenseDate >= fromDate 
                && e.ExpenseDate <= toDate
                && e.Status == ExpenseStatus.Paid)
            .ToListAsync();

        var inputVat = expenses.Sum(e => e.VatAmount);
        var vatToPay = outputVat - inputVat;

        // Löner och arbetsgivaravgifter
        var salaries = await _context.Salaries
            .Include(s => s.Employee)
            .Where(s => s.Employee.CompanyId == companyId && s.Year == fiscalYear)
            .ToListAsync();

        var totalGrossSalaries = salaries.Sum(s => s.GrossSalary);
        var totalEmployerContributions = salaries.Sum(s => s.EmployerContribution);
        var totalEmployeeTax = salaries.Sum(s => s.TaxAmount);

        // Bolagsskatt
        var taxableIncome = yearEnd.ResultBeforeTax;
        var corporateTax = taxableIncome > 0 ? taxableIncome * CorporateTaxRate : 0;

        var totalTaxLiabilities = corporateTax + vatToPay + totalEmployerContributions + totalEmployeeTax;

        return new TaxCalculation(
            fiscalYear,
            yearEnd.ResultBeforeTax,
            taxableIncome,
            CorporateTaxRate,
            corporateTax,
            outputVat,
            inputVat,
            vatToPay,
            totalGrossSalaries,
            totalEmployerContributions,
            EmployerContributionRate,
            totalEmployeeTax,
            totalTaxLiabilities
        );
    }

    public async Task<CloseYearResult> CloseYearAsync(int companyId, int fiscalYear)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null)
        {
            return new CloseYearResult(false, "Företaget hittades inte", null);
        }

        var currentFiscalYear = company.CurrentFiscalYear ?? DateTime.Now.Year;
        
        if (currentFiscalYear > fiscalYear)
        {
            return new CloseYearResult(false, $"Räkenskapsåret {fiscalYear} är redan stängt", null);
        }

        if (currentFiscalYear < fiscalYear)
        {
            return new CloseYearResult(false, $"Du måste först stänga tidigare räkenskapsår", null);
        }

        // Hämta bokslutsdata
        var yearEnd = await GetYearEndSummaryAsync(companyId, fiscalYear);

        // Skapa bokslutverifikation för att överföra resultat till eget kapital
        if (yearEnd.NetResult != 0)
        {
            var resultAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.CompanyId == companyId && a.AccountNumber == "8999");
            
            var equityAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.CompanyId == companyId && a.AccountNumber == "2099");

            if (resultAccount == null || equityAccount == null)
            {
                // Skapa konton om de inte finns
                if (resultAccount == null)
                {
                    resultAccount = new Account
                    {
                        AccountNumber = "8999",
                        Name = "Årets resultat",
                        Type = AccountType.Liability,
                        CompanyId = companyId
                    };
                    _context.Accounts.Add(resultAccount);
                }
                if (equityAccount == null)
                {
                    equityAccount = new Account
                    {
                        AccountNumber = "2099",
                        Name = "Balanserat resultat",
                        Type = AccountType.Liability,
                        CompanyId = companyId
                    };
                    _context.Accounts.Add(equityAccount);
                }
                await _context.SaveChangesAsync();
            }

            // Skapa bokslutverifikation
            var voucherNumbers = await _context.Vouchers
                .Where(v => v.CompanyId == companyId)
                .Select(v => v.VoucherNumber)
                .ToListAsync();

            var nextNumber = voucherNumbers
                .Select(n => int.TryParse(n, out var num) ? num : 0)
                .DefaultIfEmpty(0)
                .Max() + 1;

            var closingVoucher = new Voucher
            {
                VoucherNumber = nextNumber.ToString(),
                VoucherDate = new DateTime(fiscalYear, 12, 31),
                Description = $"Bokslut {fiscalYear} - Överföring av årets resultat",
                Type = VoucherType.Other,
                CompanyId = companyId,
                CreatedAt = DateTime.UtcNow
            };

            if (yearEnd.NetResult > 0)
            {
                // Vinst: Debet 8999, Kredit 2099
                closingVoucher.Rows.Add(new VoucherRow
                {
                    AccountId = resultAccount.Id,
                    Debit = yearEnd.NetResult,
                    Credit = 0,
                    Description = "Årets vinst"
                });
                closingVoucher.Rows.Add(new VoucherRow
                {
                    AccountId = equityAccount.Id,
                    Debit = 0,
                    Credit = yearEnd.NetResult,
                    Description = "Överföring till balanserat resultat"
                });
            }
            else
            {
                // Förlust: Debet 2099, Kredit 8999
                closingVoucher.Rows.Add(new VoucherRow
                {
                    AccountId = equityAccount.Id,
                    Debit = Math.Abs(yearEnd.NetResult),
                    Credit = 0,
                    Description = "Överföring av årets förlust"
                });
                closingVoucher.Rows.Add(new VoucherRow
                {
                    AccountId = resultAccount.Id,
                    Debit = 0,
                    Credit = Math.Abs(yearEnd.NetResult),
                    Description = "Årets förlust"
                });
            }

            _context.Vouchers.Add(closingVoucher);
        }

        // Uppdatera företagets räkenskapsår
        company.CurrentFiscalYear = fiscalYear + 1;
        await _context.SaveChangesAsync();

        return new CloseYearResult(true, $"Räkenskapsåret {fiscalYear} är nu stängt", fiscalYear + 1);
    }
}

