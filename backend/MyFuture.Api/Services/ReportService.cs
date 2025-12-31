using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;
using System.Globalization;

namespace MyFuture.Api.Services;

public interface IReportService
{
    Task<DashboardDto> GetDashboardAsync(int companyId);
    Task<IncomeStatementDto> GetIncomeStatementAsync(int companyId, DateTime fromDate, DateTime toDate);
    Task<BalanceSheetDto> GetBalanceSheetAsync(int companyId, DateTime asOfDate);
    Task<VatReportDto> GetVatReportAsync(int companyId, DateTime fromDate, DateTime toDate);
}

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardDto> GetDashboardAsync(int companyId)
    {
        var currentYear = DateTime.UtcNow.Year;
        var startOfYear = new DateTime(currentYear, 1, 1);

        // Get invoices stats
        var invoices = await _context.Invoices
            .Where(i => i.CompanyId == companyId)
            .ToListAsync();

        var totalInvoices = invoices.Count;
        var unpaidInvoices = invoices.Where(i => i.Status == InvoiceStatus.Sent || i.Status == InvoiceStatus.Overdue).ToList();
        var unpaidAmount = unpaidInvoices.Sum(i => i.TotalIncludingVat);

        // Get revenue from paid invoices this year (baserat på fakturadatum, inte betalningsdatum)
        var paidInvoicesThisYear = invoices
            .Where(i => i.Status == InvoiceStatus.Paid && i.InvoiceDate >= startOfYear)
            .ToList();
        var totalRevenue = paidInvoicesThisYear.Sum(i => i.TotalExcludingVat);

        // Get expenses from vouchers (simplified - just looking at expense accounts)
        // Hämta till minnet först för att undvika SQLite decimal Sum-begränsning
        var expenseRows = await _context.VoucherRows
            .Include(r => r.Account)
            .Include(r => r.Voucher)
            .Where(r => r.Voucher.CompanyId == companyId 
                && r.Voucher.VoucherDate >= startOfYear
                && (r.Account.Type == AccountType.Expense || r.Account.Type == AccountType.FinancialExpense))
            .ToListAsync();
        var expenses = expenseRows.Sum(r => r.Debit - r.Credit);

        // Monthly revenue for chart
        var monthlyRevenue = new List<MonthlyRevenueDto>();
        var culture = new CultureInfo("sv-SE");
        
        for (int month = 1; month <= 12; month++)
        {
            var monthStart = new DateTime(currentYear, month, 1);
            var monthEnd = monthStart.AddMonths(1);

            var monthRev = paidInvoicesThisYear
                .Where(i => i.InvoiceDate >= monthStart && i.InvoiceDate < monthEnd)
                .Sum(i => i.TotalExcludingVat);

            var monthExpRows = await _context.VoucherRows
                .Include(r => r.Account)
                .Include(r => r.Voucher)
                .Where(r => r.Voucher.CompanyId == companyId
                    && r.Voucher.VoucherDate >= monthStart
                    && r.Voucher.VoucherDate < monthEnd
                    && (r.Account.Type == AccountType.Expense || r.Account.Type == AccountType.FinancialExpense))
                .ToListAsync();
            var monthExp = monthExpRows.Sum(r => r.Debit - r.Credit);

            monthlyRevenue.Add(new MonthlyRevenueDto(
                currentYear,
                month,
                culture.DateTimeFormat.GetMonthName(month),
                monthRev,
                monthExp
            ));
        }

        var customerCount = await _context.Customers.CountAsync(c => c.CompanyId == companyId);
        var employeeCount = await _context.Employees.CountAsync(e => e.CompanyId == companyId && e.IsActive);

        return new DashboardDto(
            totalRevenue,
            expenses,
            totalRevenue - expenses,
            totalInvoices,
            unpaidInvoices.Count,
            unpaidAmount,
            customerCount,
            employeeCount,
            monthlyRevenue
        );
    }

    public async Task<IncomeStatementDto> GetIncomeStatementAsync(int companyId, DateTime fromDate, DateTime toDate)
    {
        var accountBalances = await _context.Accounts
            .Where(a => a.CompanyId == companyId && a.IsActive)
            .Select(a => new
            {
                a.AccountNumber,
                a.Name,
                a.Type,
                Amount = a.VoucherRows
                    .Where(r => r.Voucher.VoucherDate >= fromDate && r.Voucher.VoucherDate <= toDate)
                    .Sum(r => r.Credit - r.Debit) // Revenue is credit, expenses are debit
            })
            .Where(a => a.Amount != 0)
            .OrderBy(a => a.AccountNumber)
            .ToListAsync();

        var revenueAccounts = accountBalances
            .Where(a => a.Type == AccountType.Revenue || a.Type == AccountType.FinancialIncome)
            .Select(a => new IncomeStatementRowDto(a.AccountNumber, a.Name, a.Amount))
            .ToList();

        var expenseAccounts = accountBalances
            .Where(a => a.Type == AccountType.Expense || a.Type == AccountType.FinancialExpense)
            .Select(a => new IncomeStatementRowDto(a.AccountNumber, a.Name, -a.Amount)) // Invert for display
            .ToList();

        var totalRevenue = revenueAccounts.Sum(a => a.Amount);
        var totalExpenses = expenseAccounts.Sum(a => a.Amount);

        return new IncomeStatementDto(
            fromDate,
            toDate,
            revenueAccounts,
            totalRevenue,
            expenseAccounts,
            totalExpenses,
            totalRevenue - totalExpenses
        );
    }

    public async Task<BalanceSheetDto> GetBalanceSheetAsync(int companyId, DateTime asOfDate)
    {
        var accountBalances = await _context.Accounts
            .Where(a => a.CompanyId == companyId && a.IsActive)
            .Select(a => new
            {
                a.AccountNumber,
                a.Name,
                a.Type,
                Balance = a.VoucherRows
                    .Where(r => r.Voucher.VoucherDate <= asOfDate)
                    .Sum(r => r.Debit - r.Credit)
            })
            .Where(a => a.Balance != 0)
            .OrderBy(a => a.AccountNumber)
            .ToListAsync();

        var assets = accountBalances
            .Where(a => a.Type == AccountType.Asset)
            .Select(a => new BalanceSheetRowDto(a.AccountNumber, a.Name, a.Balance))
            .ToList();

        var liabilities = accountBalances
            .Where(a => a.Type == AccountType.Liability)
            .Select(a => new BalanceSheetRowDto(a.AccountNumber, a.Name, -a.Balance)) // Liabilities are credit
            .ToList();

        var totalAssets = assets.Sum(a => a.Balance);
        var totalLiabilities = liabilities.Sum(a => a.Balance);
        var equity = totalAssets - totalLiabilities;

        return new BalanceSheetDto(
            asOfDate,
            assets,
            totalAssets,
            liabilities,
            totalLiabilities,
            equity,
            totalLiabilities + equity
        );
    }

    public async Task<VatReportDto> GetVatReportAsync(int companyId, DateTime fromDate, DateTime toDate)
    {
        // Output VAT (utgående moms) - accounts 2610, 2620, 2630
        var outputVatRows = await _context.VoucherRows
            .Include(r => r.Account)
            .Include(r => r.Voucher)
            .Where(r => r.Voucher.CompanyId == companyId
                && r.Voucher.VoucherDate >= fromDate
                && r.Voucher.VoucherDate <= toDate
                && (r.Account.AccountNumber == "2610" || r.Account.AccountNumber == "2620" || r.Account.AccountNumber == "2630"))
            .ToListAsync();
        var outputVat = outputVatRows.Sum(r => r.Credit - r.Debit);

        // Input VAT (ingående moms) - account 2640
        var inputVatRows = await _context.VoucherRows
            .Include(r => r.Account)
            .Include(r => r.Voucher)
            .Where(r => r.Voucher.CompanyId == companyId
                && r.Voucher.VoucherDate >= fromDate
                && r.Voucher.VoucherDate <= toDate
                && r.Account.AccountNumber == "2640")
            .ToListAsync();
        var inputVat = inputVatRows.Sum(r => r.Debit - r.Credit);

        return new VatReportDto(
            fromDate,
            toDate,
            outputVat,
            inputVat,
            outputVat - inputVat
        );
    }
}

