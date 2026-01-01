using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IPersonalFinanceService
{
    // Budget
    Task<List<PersonalBudgetDto>> GetBudgetItemsAsync(int userId);
    Task<BudgetSummary> GetBudgetSummaryAsync(int userId);
    Task<PersonalBudgetDto?> CreateBudgetItemAsync(CreateBudgetItemRequest request, int userId);
    Task<PersonalBudgetDto?> UpdateBudgetItemAsync(int id, UpdateBudgetItemRequest request, int userId);
    Task<bool> DeleteBudgetItemAsync(int id, int userId);
    
    // Financial Accounts
    Task<List<FinancialAccountDto>> GetAccountsAsync(int userId);
    Task<FinancialAccountDto?> GetAccountAsync(int id, int userId);
    Task<FinancialAccountDto?> CreateAccountAsync(CreateFinancialAccountRequest request, int userId);
    Task<FinancialAccountDto?> UpdateAccountAsync(int id, UpdateFinancialAccountRequest request, int userId);
    Task<bool> DeleteAccountAsync(int id, int userId);
    
    // Debts
    Task<List<DebtDto>> GetDebtsAsync(int userId);
    Task<DebtDto?> GetDebtAsync(int id, int userId);
    Task<DebtDto?> CreateDebtAsync(CreateDebtRequest request, int userId);
    Task<DebtDto?> UpdateDebtAsync(int id, UpdateDebtRequest request, int userId);
    Task<bool> DeleteDebtAsync(int id, int userId);
    
    // Goals
    Task<List<FinancialGoalDto>> GetGoalsAsync(int userId);
    Task<FinancialGoalDto?> GetGoalAsync(int id, int userId);
    Task<FinancialGoalDto?> CreateGoalAsync(CreateGoalRequest request, int userId);
    Task<FinancialGoalDto?> UpdateGoalAsync(int id, UpdateGoalRequest request, int userId);
    Task<bool> DeleteGoalAsync(int id, int userId);
    
    // Dashboard
    Task<PersonalFinanceSummary> GetFinanceSummaryAsync(int userId);
    
    // Tax & Pension
    Task<TaxAndPensionSummary> GetTaxAndPensionSummaryAsync(int userId, int? currentAge = null, decimal? taxRate = null);
}

public class PersonalFinanceService : IPersonalFinanceService
{
    private readonly AppDbContext _context;

    public PersonalFinanceService(AppDbContext context)
    {
        _context = context;
    }

    // === Budget Methods ===
    
    public async Task<List<PersonalBudgetDto>> GetBudgetItemsAsync(int userId)
    {
        var items = await _context.PersonalBudgets
            .Where(b => b.UserId == userId)
            .OrderBy(b => b.SortOrder)
            .ThenBy(b => b.Name)
            .ToListAsync();

        return items.Select(MapToDto).ToList();
    }

    public async Task<BudgetSummary> GetBudgetSummaryAsync(int userId)
    {
        var items = await GetBudgetItemsAsync(userId);
        
        var incomeItems = items.Where(i => i.Type == BudgetItemType.Income).ToList();
        var expenseItems = items.Where(i => i.Type == BudgetItemType.Expense).ToList();
        
        return new BudgetSummary(
            incomeItems,
            expenseItems,
            incomeItems.Sum(i => i.Amount),
            expenseItems.Sum(i => i.Amount),
            incomeItems.Sum(i => i.Amount) - expenseItems.Sum(i => i.Amount)
        );
    }

    public async Task<PersonalBudgetDto?> CreateBudgetItemAsync(CreateBudgetItemRequest request, int userId)
    {
        var item = new PersonalBudget
        {
            Name = request.Name,
            Amount = request.Amount,
            Type = request.Type,
            Category = request.Category,
            IsRecurring = request.IsRecurring,
            Notes = request.Notes,
            SortOrder = request.SortOrder,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.PersonalBudgets.Add(item);
        await _context.SaveChangesAsync();

        return MapToDto(item);
    }

    public async Task<PersonalBudgetDto?> UpdateBudgetItemAsync(int id, UpdateBudgetItemRequest request, int userId)
    {
        var item = await _context.PersonalBudgets.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (item == null) return null;

        item.Name = request.Name;
        item.Amount = request.Amount;
        item.Type = request.Type;
        item.Category = request.Category;
        item.IsRecurring = request.IsRecurring;
        item.Notes = request.Notes;
        item.SortOrder = request.SortOrder;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(item);
    }

    public async Task<bool> DeleteBudgetItemAsync(int id, int userId)
    {
        var item = await _context.PersonalBudgets.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (item == null) return false;

        _context.PersonalBudgets.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    // === Financial Account Methods ===
    
    public async Task<List<FinancialAccountDto>> GetAccountsAsync(int userId)
    {
        var accounts = await _context.FinancialAccounts
            .Where(a => a.UserId == userId && a.IsActive)
            .OrderBy(a => a.SortOrder)
            .ThenBy(a => a.Name)
            .ToListAsync();

        return accounts.Select(MapToDto).ToList();
    }

    public async Task<FinancialAccountDto?> GetAccountAsync(int id, int userId)
    {
        var account = await _context.FinancialAccounts
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        return account == null ? null : MapToDto(account);
    }

    public async Task<FinancialAccountDto?> CreateAccountAsync(CreateFinancialAccountRequest request, int userId)
    {
        var account = new FinancialAccount
        {
            Name = request.Name,
            Institution = request.Institution,
            Balance = request.Balance,
            Category = request.Category,
            AccountNumber = request.AccountNumber,
            Color = request.Color,
            Icon = request.Icon,
            SortOrder = request.SortOrder,
            Notes = request.Notes,
            UserId = userId,
            IsActive = true,
            LastBalanceUpdate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.FinancialAccounts.Add(account);
        await _context.SaveChangesAsync();

        return MapToDto(account);
    }

    public async Task<FinancialAccountDto?> UpdateAccountAsync(int id, UpdateFinancialAccountRequest request, int userId)
    {
        var account = await _context.FinancialAccounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (account == null) return null;

        account.Name = request.Name;
        account.Institution = request.Institution;
        account.Balance = request.Balance;
        account.Category = request.Category;
        account.AccountNumber = request.AccountNumber;
        account.Color = request.Color;
        account.Icon = request.Icon;
        account.SortOrder = request.SortOrder;
        account.IsActive = request.IsActive;
        account.Notes = request.Notes;
        account.LastBalanceUpdate = DateTime.UtcNow;
        account.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(account);
    }

    public async Task<bool> DeleteAccountAsync(int id, int userId)
    {
        var account = await _context.FinancialAccounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (account == null) return false;

        _context.FinancialAccounts.Remove(account);
        await _context.SaveChangesAsync();
        return true;
    }

    // === Debt Methods ===
    
    public async Task<List<DebtDto>> GetDebtsAsync(int userId)
    {
        var debts = await _context.Debts
            .Where(d => d.UserId == userId && d.IsActive)
            .OrderBy(d => d.SortOrder)
            .ThenBy(d => d.Name)
            .ToListAsync();

        return debts.Select(MapToDto).ToList();
    }

    public async Task<DebtDto?> GetDebtAsync(int id, int userId)
    {
        var debt = await _context.Debts.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
        return debt == null ? null : MapToDto(debt);
    }

    public async Task<DebtDto?> CreateDebtAsync(CreateDebtRequest request, int userId)
    {
        // Auto-generate name from type if not provided
        var name = string.IsNullOrEmpty(request.Name) 
            ? GetDefaultDebtName(request.Type) 
            : request.Name;
            
        var debt = new Debt
        {
            Name = name,
            Lender = request.Lender,
            Type = request.Type,
            OriginalAmount = request.OriginalAmount,
            CurrentBalance = request.CurrentBalance,
            AssetValue = request.AssetValue,
            InterestRate = request.InterestRate,
            AmortizationRate = request.AmortizationRate,
            MonthlyPayment = request.MonthlyPayment,
            MonthlyAmortization = request.MonthlyAmortization,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            NextPaymentDate = request.NextPaymentDate,
            Color = request.Color,
            SortOrder = request.SortOrder,
            Notes = request.Notes,
            UserId = userId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Debts.Add(debt);
        await _context.SaveChangesAsync();

        return MapToDto(debt);
    }
    
    private static string GetDefaultDebtName(DebtType type) => type switch
    {
        DebtType.Mortgage => "Bolån",
        DebtType.StudentLoan => "Studielån",
        DebtType.CarLoan => "Billån",
        DebtType.PersonalLoan => "Privatlån",
        DebtType.CreditCard => "Kreditkort",
        DebtType.TaxDebt => "Skatteskuld",
        DebtType.BusinessLoan => "Företagslån",
        _ => "Lån"
    };

    public async Task<DebtDto?> UpdateDebtAsync(int id, UpdateDebtRequest request, int userId)
    {
        var debt = await _context.Debts.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
        if (debt == null) return null;

        // Auto-generate name from type if not provided
        debt.Name = string.IsNullOrEmpty(request.Name) 
            ? GetDefaultDebtName(request.Type) 
            : request.Name;
        debt.Lender = request.Lender;
        debt.Type = request.Type;
        debt.OriginalAmount = request.OriginalAmount;
        debt.CurrentBalance = request.CurrentBalance;
        debt.AssetValue = request.AssetValue;
        debt.InterestRate = request.InterestRate;
        debt.AmortizationRate = request.AmortizationRate;
        debt.MonthlyPayment = request.MonthlyPayment;
        debt.MonthlyAmortization = request.MonthlyAmortization;
        debt.StartDate = request.StartDate;
        debt.EndDate = request.EndDate;
        debt.NextPaymentDate = request.NextPaymentDate;
        debt.Color = request.Color;
        debt.SortOrder = request.SortOrder;
        debt.IsActive = request.IsActive;
        debt.Notes = request.Notes;
        debt.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(debt);
    }

    public async Task<bool> DeleteDebtAsync(int id, int userId)
    {
        var debt = await _context.Debts.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);
        if (debt == null) return false;

        _context.Debts.Remove(debt);
        await _context.SaveChangesAsync();
        return true;
    }

    // === Goal Methods ===
    
    public async Task<List<FinancialGoalDto>> GetGoalsAsync(int userId)
    {
        var goals = await _context.FinancialGoals
            .Where(g => g.UserId == userId)
            .OrderBy(g => g.IsCompleted)
            .ThenBy(g => g.SortOrder)
            .ThenBy(g => g.Name)
            .ToListAsync();

        return goals.Select(MapToDto).ToList();
    }

    public async Task<FinancialGoalDto?> GetGoalAsync(int id, int userId)
    {
        var goal = await _context.FinancialGoals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        return goal == null ? null : MapToDto(goal);
    }

    public async Task<FinancialGoalDto?> CreateGoalAsync(CreateGoalRequest request, int userId)
    {
        var goal = new FinancialGoal
        {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            TargetAmount = request.TargetAmount,
            CurrentAmount = request.CurrentAmount,
            MonthlyContribution = request.MonthlyContribution,
            TargetDate = request.TargetDate,
            StartDate = request.StartDate ?? DateTime.UtcNow,
            Color = request.Color,
            Icon = request.Icon,
            SortOrder = request.SortOrder,
            UserId = userId,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.FinancialGoals.Add(goal);
        await _context.SaveChangesAsync();

        return MapToDto(goal);
    }

    public async Task<FinancialGoalDto?> UpdateGoalAsync(int id, UpdateGoalRequest request, int userId)
    {
        var goal = await _context.FinancialGoals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        if (goal == null) return null;

        goal.Name = request.Name;
        goal.Description = request.Description;
        goal.Type = request.Type;
        goal.TargetAmount = request.TargetAmount;
        goal.CurrentAmount = request.CurrentAmount;
        goal.MonthlyContribution = request.MonthlyContribution;
        goal.TargetDate = request.TargetDate;
        goal.StartDate = request.StartDate;
        goal.Color = request.Color;
        goal.Icon = request.Icon;
        goal.SortOrder = request.SortOrder;
        goal.IsCompleted = request.IsCompleted;
        if (request.IsCompleted && !goal.CompletedAt.HasValue)
            goal.CompletedAt = DateTime.UtcNow;
        goal.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(goal);
    }

    public async Task<bool> DeleteGoalAsync(int id, int userId)
    {
        var goal = await _context.FinancialGoals.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        if (goal == null) return false;

        _context.FinancialGoals.Remove(goal);
        await _context.SaveChangesAsync();
        return true;
    }

    // === Dashboard Summary ===
    
    public async Task<PersonalFinanceSummary> GetFinanceSummaryAsync(int userId)
    {
        // Hämta all data
        var accounts = await _context.FinancialAccounts
            .Where(a => a.UserId == userId && a.IsActive)
            .ToListAsync();
        
        var debts = await _context.Debts
            .Where(d => d.UserId == userId && d.IsActive)
            .ToListAsync();
        
        var budgetItems = await _context.PersonalBudgets
            .Where(b => b.UserId == userId && b.IsRecurring)
            .ToListAsync();

        // Beräkna summor
        var financialAssets = accounts.Sum(a => a.Balance);
        var allDebts = debts.Sum(d => d.CurrentBalance);
        
        // Equity-modell (som i kalkylarket):
        // Equity = AssetValue - CurrentBalance för varje skuld med tillgång (t.ex. bostad)
        var totalEquityFromDebts = debts.Where(d => d.AssetValue.HasValue).Sum(d => d.EquityInAsset);
        
        // Skulder med kopplad tillgång (bolån) exkluderas från visade skulder
        var debtsWithAssets = debts.Where(d => d.AssetValue.HasValue).Sum(d => d.CurrentBalance);
        var debtsWithoutAssets = allDebts - debtsWithAssets;
        
        // Tillgångar = finansiella tillgångar + equity i fastigheter
        // Skulder = bara skulder utan kopplad tillgång
        // Netto = Tillgångar - Skulder (samma som finansiella tillgångar + equity - andra skulder)
        var totalAssets = financialAssets + totalEquityFromDebts;
        var totalDebts = debtsWithoutAssets;
        
        // NetWorth = totalAssets - totalDebts
        var netWorth = totalAssets - totalDebts;

        var totalIncome = budgetItems.Where(b => b.Type == BudgetItemType.Income).Sum(b => b.Amount);
        var totalExpenses = budgetItems.Where(b => b.Type == BudgetItemType.Expense).Sum(b => b.Amount);
        var monthlyBalance = totalIncome - totalExpenses;

        // Tillgångar per kategori
        var assetsByCategory = accounts
            .GroupBy(a => a.Category)
            .Select(g => new AssetCategorySummary(
                g.Key,
                GetCategoryName(g.Key),
                g.Sum(a => a.Balance),
                g.Count()
            ))
            .OrderByDescending(c => c.TotalBalance)
            .ToList();

        // Skulder per typ
        var debtsByType = debts
            .GroupBy(d => d.Type)
            .Select(g => {
                var totalOriginal = g.Sum(d => d.OriginalAmount);
                var totalCurrent = g.Sum(d => d.CurrentBalance);
                var remainingPct = totalOriginal > 0 ? (totalCurrent / totalOriginal) * 100 : 0;
                return new DebtTypeSummary(
                    g.Key,
                    GetDebtTypeName(g.Key),
                    totalCurrent,
                    totalOriginal,
                    g.Sum(d => d.EquityInAsset),
                    g.Count(),
                    remainingPct
                );
            })
            .OrderByDescending(d => d.TotalBalance)
            .ToList();
        
        // Beräkna skuldprocent per kategori
        // Bostadsskuld = Bolån
        var housingDebts = debts.Where(d => d.Type == DebtType.Mortgage).ToList();
        var housingOriginal = housingDebts.Sum(d => d.OriginalAmount);
        var housingCurrent = housingDebts.Sum(d => d.CurrentBalance);
        var housingDebtPercentage = housingOriginal > 0 ? (housingCurrent / housingOriginal) * 100 : 0;
        
        // Privat skuld = Alla andra skulder
        var personalDebts = debts.Where(d => d.Type != DebtType.Mortgage).ToList();
        var personalOriginal = personalDebts.Sum(d => d.OriginalAmount);
        var personalCurrent = personalDebts.Sum(d => d.CurrentBalance);
        var personalDebtPercentage = personalOriginal > 0 ? (personalCurrent / personalOriginal) * 100 : 0;
        
        // Total skuld procent
        var totalOriginalDebt = debts.Sum(d => d.OriginalAmount);
        var totalDebtPercentage = totalOriginalDebt > 0 ? (allDebts / totalOriginalDebt) * 100 : 0;

        // Beräkna månatliga betalningar
        var monthlyInterest = debts.Sum(d => (d.CurrentBalance * d.InterestRate / 100) / 12);
        var monthlyAmortization = debts.Sum(d => d.MonthlyAmortization ?? 0);

        // Prognoser (1, 5, 10, 20, 30, 40, 50, 60 år)
        var projections = new List<FinancialProjection>();
        var projectionYears = new[] { 1, 5, 10, 20, 30, 40, 50, 60 };
        
        foreach (var years in projectionYears)
        {
            var months = years * 12;
            
            // Totala kostnader (utgifter × månader)
            var totalCosts = totalExpenses * months;
            
            // Beräkna skuld efter amortering (förenklad modell) - använd alla skulder
            var totalAmortizationPaid = monthlyAmortization * months;
            var remainingAllDebt = Math.Max(0, allDebts - totalAmortizationPaid);
            
            // Beräkna total ränta betald (förenklad modell med minskande skuld)
            decimal totalInterestPaid = 0;
            var debtBalance = allDebts;
            for (int year = 0; year < years; year++)
            {
                var yearlyInterest = debts.Sum(d => {
                    var ratio = allDebts > 0 ? d.CurrentBalance / allDebts : 0;
                    return (debtBalance * ratio * d.InterestRate / 100);
                });
                totalInterestPaid += yearlyInterest;
                debtBalance = Math.Max(0, debtBalance - (monthlyAmortization * 12));
            }
            
            // Enkelt sparande utan ränta
            var totalSavedSimple = monthlyBalance * months;
            
            // Projicerad nettoförmögenhet
            // Finansiella tillgångar + sparande + eget kapital i fastighet (som ökar när bolånet minskar)
            var mortgageRemaining = Math.Max(0, debtsWithAssets - totalAmortizationPaid);
            var projectedEquity = debts.Where(d => d.AssetValue.HasValue).Sum(d => d.AssetValue!.Value) - mortgageRemaining;
            var otherDebtsRemaining = Math.Max(0, debtsWithoutAssets - (totalAmortizationPaid - (debtsWithAssets - mortgageRemaining)));
            var projectedNetWorth = financialAssets + totalSavedSimple + projectedEquity - Math.Max(0, otherDebtsRemaining);
            
            projections.Add(new FinancialProjection(
                years, 
                totalCosts, 
                totalSavedSimple, 
                projectedNetWorth,
                totalInterestPaid,
                totalAmortizationPaid,
                remainingAllDebt,
                totalSavedSimple
            ));
        }

        return new PersonalFinanceSummary(
            totalAssets,
            totalDebts,
            netWorth,
            totalIncome,
            totalExpenses,
            monthlyBalance,
            allDebts, // TotalDebtRemaining - alla skulder för detaljer
            (decimal)(debts.Any() ? debts.Average(d => (double)d.RemainingPercentage) : 0),
            housingDebtPercentage,
            personalDebtPercentage,
            totalDebtPercentage,
            assetsByCategory,
            debtsByType,
            projections
        );
    }

    // === Mapping Helpers ===
    
    private static PersonalBudgetDto MapToDto(PersonalBudget item) => new(
        item.Id,
        item.Name,
        item.Amount,
        item.Type,
        item.Category,
        item.IsRecurring,
        item.Notes,
        item.SortOrder
    );

    private static FinancialAccountDto MapToDto(FinancialAccount account) => new(
        account.Id,
        account.Name,
        account.Institution,
        account.Balance,
        account.Category,
        account.AccountNumber,
        account.Color,
        account.Icon,
        account.SortOrder,
        account.IsActive,
        account.Notes,
        account.LastBalanceUpdate
    );

    private static DebtDto MapToDto(Debt debt) => new(
        debt.Id,
        debt.Name,
        debt.Lender,
        debt.Type,
        debt.OriginalAmount,
        debt.CurrentBalance,
        debt.AssetValue,
        debt.InterestRate,
        debt.AmortizationRate,
        debt.MonthlyPayment,
        debt.MonthlyAmortization,
        debt.MonthlyInterest,
        debt.CalculatedMonthlyAmortization,
        debt.StartDate,
        debt.EndDate,
        debt.NextPaymentDate,
        debt.Color,
        debt.SortOrder,
        debt.IsActive,
        debt.Notes,
        debt.RemainingPercentage,
        debt.EquityInAsset
    );

    private static FinancialGoalDto MapToDto(FinancialGoal goal) => new(
        goal.Id,
        goal.Name,
        goal.Description,
        goal.Type,
        goal.TargetAmount,
        goal.CurrentAmount,
        goal.MonthlyContribution,
        goal.TargetDate,
        goal.StartDate,
        goal.Color,
        goal.Icon,
        goal.SortOrder,
        goal.IsCompleted,
        goal.CompletedAt,
        goal.ProgressPercentage,
        goal.RemainingAmount,
        goal.MonthsToGoal
    );

    private static string GetCategoryName(AccountCategory category) => category switch
    {
        AccountCategory.Cash => "Kontanter",
        AccountCategory.BankAccount => "Bankkonto",
        AccountCategory.Savings => "Sparkonto",
        AccountCategory.Investment => "Investeringar",
        AccountCategory.Pension => "Pension",
        AccountCategory.RealEstate => "Fastighet",
        AccountCategory.Business => "Företag",
        AccountCategory.Crypto => "Krypto",
        AccountCategory.Other => "Övrigt",
        _ => "Okänd"
    };

    private static string GetDebtTypeName(DebtType type) => type switch
    {
        DebtType.Mortgage => "Bolån",
        DebtType.StudentLoan => "Studielån",
        DebtType.CarLoan => "Billån",
        DebtType.PersonalLoan => "Privatlån",
        DebtType.CreditCard => "Kreditkort",
        DebtType.TaxDebt => "Skatteskuld",
        DebtType.BusinessLoan => "Företagslån",
        DebtType.Other => "Övrigt",
        _ => "Okänd"
    };

    // === Tax & Pension Calculations ===
    
    public async Task<TaxAndPensionSummary> GetTaxAndPensionSummaryAsync(int userId, int? currentAge = null, decimal? taxRate = null)
    {
        // Hämta budgetdata
        var budgetItems = await _context.PersonalBudgets
            .Where(b => b.UserId == userId && b.IsRecurring)
            .ToListAsync();
        
        // Hämta pensionskonton
        var pensionAccounts = await _context.FinancialAccounts
            .Where(a => a.UserId == userId && a.IsActive && a.Category == AccountCategory.Pension)
            .ToListAsync();

        // Bruttolön (total inkomst)
        var grossMonthlyIncome = budgetItems
            .Where(b => b.Type == BudgetItemType.Income)
            .Sum(b => b.Amount);
        var grossYearlyIncome = grossMonthlyIncome * 12;

        // Skatteberäkning (svensk modell)
        // Standard kommunalskatt är ca 32%, men kan anpassas
        var effectiveTaxRate = taxRate ?? 0.32m;
        
        // Grundavdrag för 2024 (förenklad)
        // För inkomster mellan 20 000 - 45 000 kr/mån är grundavdraget ca 2 900 kr/mån
        var monthlyBasicDeduction = CalculateMonthlyBasicDeduction(grossMonthlyIncome);
        var taxableMonthlyIncome = Math.Max(0, grossMonthlyIncome - monthlyBasicDeduction);
        
        // Kommunalskatt
        var monthlyMunicipalTax = taxableMonthlyIncome * effectiveTaxRate;
        
        // Statlig inkomstskatt (20% över brytpunkt ~46 200 kr/mån för 2024)
        var stateTaxThreshold = 46200m;
        var monthlyStateTax = grossMonthlyIncome > stateTaxThreshold 
            ? (grossMonthlyIncome - stateTaxThreshold) * 0.20m 
            : 0;
        
        var monthlyTax = monthlyMunicipalTax + monthlyStateTax;
        var yearlyTax = monthlyTax * 12;
        
        // Nettolön
        var netMonthlyIncome = grossMonthlyIncome - monthlyTax;
        var netYearlyIncome = netMonthlyIncome * 12;
        
        // Arbetsgivaravgifter (31.42% för 2024)
        var employerContributionRate = 0.3142m;
        var monthlyEmployerContributions = grossMonthlyIncome * employerContributionRate;
        var yearlyEmployerContributions = monthlyEmployerContributions * 12;
        
        // Pensionsavsättning
        // Allmän pension: 18.5% av lönen (7% betalar arbetstagare, 11.5% arbetsgivare)
        // Tjänstepension: typiskt 4.5% - 6% av lönen
        var generalPensionRate = 0.07m; // Arbetstagarens del
        var occupationalPensionRate = 0.045m; // Tjänstepension (genomsnitt)
        
        var monthlyGeneralPension = grossMonthlyIncome * generalPensionRate;
        var monthlyOccupationalPension = grossMonthlyIncome * occupationalPensionRate;
        var monthlyPensionContribution = monthlyGeneralPension + monthlyOccupationalPension;
        var yearlyPensionContribution = monthlyPensionContribution * 12;
        
        // Nuvarande pensionssparande
        var currentPensionSavings = pensionAccounts.Sum(a => a.Balance);
        
        // Pensionsprognoser
        var age = currentAge ?? 30; // Antagen ålder om ej angiven
        var retirementAge = 65;
        var pensionProjections = new List<PensionProjection>();
        
        // Antagen årlig avkastning på pension: 5%
        var pensionReturnRate = 0.05m;
        
        foreach (var targetAge in new[] { 55, 60, 65, 67, 70 })
        {
            if (targetAge <= age) continue;
            
            var yearsToTarget = targetAge - age;
            
            // Beräkna framtida pensionskapital med ränta-på-ränta
            // FV = PV(1+r)^n + PMT × (((1+r)^n - 1) / r)
            var futureValue = currentPensionSavings * (decimal)Math.Pow(1 + (double)pensionReturnRate, yearsToTarget);
            var monthlyContributions = yearlyPensionContribution;
            var contributionFV = monthlyContributions * (decimal)((Math.Pow(1 + (double)pensionReturnRate, yearsToTarget) - 1) / (double)pensionReturnRate);
            
            var projectedCapital = futureValue + contributionFV;
            
            // Uppskattad månatlig pension (baserat på 4% uttagsregel)
            var yearlyWithdrawalRate = 0.04m;
            var estimatedYearlyPension = projectedCapital * yearlyWithdrawalRate;
            var estimatedMonthlyPension = estimatedYearlyPension / 12;
            
            pensionProjections.Add(new PensionProjection(
                targetAge,
                yearsToTarget,
                projectedCapital,
                estimatedMonthlyPension,
                estimatedYearlyPension
            ));
        }
        
        // Uppskattade avdrag (bolån ränteavdrag, etc.)
        var debts = await _context.Debts
            .Where(d => d.UserId == userId && d.IsActive)
            .ToListAsync();
        
        var yearlyInterestPayments = debts.Sum(d => (d.CurrentBalance * d.InterestRate / 100));
        var estimatedYearlyDeductions = yearlyInterestPayments * 0.30m; // 30% ränteavdrag
        var estimatedTaxRefund = estimatedYearlyDeductions;
        
        // Totalkostnad för arbetsgivare
        var totalEmployerCost = grossMonthlyIncome + monthlyEmployerContributions;
        
        // Beräkna effektiv skattesats
        var actualEffectiveTaxRate = grossMonthlyIncome > 0 ? monthlyTax / grossMonthlyIncome * 100 : 0;

        return new TaxAndPensionSummary(
            grossMonthlyIncome,
            grossYearlyIncome,
            monthlyTax,
            yearlyTax,
            actualEffectiveTaxRate,
            netMonthlyIncome,
            netYearlyIncome,
            monthlyEmployerContributions,
            yearlyEmployerContributions,
            monthlyPensionContribution,
            yearlyPensionContribution,
            currentPensionSavings,
            pensionProjections,
            estimatedYearlyDeductions,
            estimatedTaxRefund,
            totalEmployerCost
        );
    }

    private static decimal CalculateMonthlyBasicDeduction(decimal monthlyIncome)
    {
        // Förenklad modell för grundavdrag baserat på årsinkomst
        // Fullständig modell är mer komplex med trappstegsavdrag
        if (monthlyIncome <= 0) return 0;
        if (monthlyIncome <= 15000) return 1400m;
        if (monthlyIncome <= 25000) return 2400m;
        if (monthlyIncome <= 40000) return 2900m;
        if (monthlyIncome <= 55000) return 2600m;
        return 1500m; // Minskar vid höga inkomster
    }
}

