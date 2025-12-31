using MyFuture.Api.Models;

namespace MyFuture.Api.DTOs;

// === PersonalBudget DTOs ===
public record PersonalBudgetDto(
    int Id,
    string Name,
    decimal Amount,
    BudgetItemType Type,
    BudgetCategory Category,
    bool IsRecurring,
    string? Notes,
    int SortOrder
);

public record CreateBudgetItemRequest(
    string Name,
    decimal Amount,
    BudgetItemType Type,
    BudgetCategory Category,
    bool IsRecurring = true,
    string? Notes = null,
    int SortOrder = 0
);

public record UpdateBudgetItemRequest(
    string Name,
    decimal Amount,
    BudgetItemType Type,
    BudgetCategory Category,
    bool IsRecurring,
    string? Notes,
    int SortOrder
);

// === FinancialAccount DTOs ===
public record FinancialAccountDto(
    int Id,
    string Name,
    string? Institution,
    decimal Balance,
    AccountCategory Category,
    string? AccountNumber,
    string? Color,
    string? Icon,
    int SortOrder,
    bool IsActive,
    string? Notes,
    DateTime? LastBalanceUpdate
);

public record CreateFinancialAccountRequest(
    string Name,
    string? Institution,
    decimal Balance,
    AccountCategory Category,
    string? AccountNumber = null,
    string? Color = null,
    string? Icon = null,
    int SortOrder = 0,
    string? Notes = null
);

public record UpdateFinancialAccountRequest(
    string Name,
    string? Institution,
    decimal Balance,
    AccountCategory Category,
    string? AccountNumber,
    string? Color,
    string? Icon,
    int SortOrder,
    bool IsActive,
    string? Notes
);

// === Debt DTOs ===
public record DebtDto(
    int Id,
    string Name,
    string? Lender,
    DebtType Type,
    decimal OriginalAmount,
    decimal CurrentBalance,
    decimal? AssetValue,
    decimal InterestRate,
    decimal? MonthlyPayment,
    decimal? MonthlyAmortization,
    DateTime? StartDate,
    DateTime? EndDate,
    DateTime? NextPaymentDate,
    string? Color,
    int SortOrder,
    bool IsActive,
    string? Notes,
    decimal RemainingPercentage,
    decimal EquityInAsset
);

public record CreateDebtRequest(
    string Name,
    string? Lender,
    DebtType Type,
    decimal OriginalAmount,
    decimal CurrentBalance,
    decimal? AssetValue = null,
    decimal InterestRate = 0,
    decimal? MonthlyPayment = null,
    decimal? MonthlyAmortization = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    DateTime? NextPaymentDate = null,
    string? Color = null,
    int SortOrder = 0,
    string? Notes = null
);

public record UpdateDebtRequest(
    string Name,
    string? Lender,
    DebtType Type,
    decimal OriginalAmount,
    decimal CurrentBalance,
    decimal? AssetValue,
    decimal InterestRate,
    decimal? MonthlyPayment,
    decimal? MonthlyAmortization,
    DateTime? StartDate,
    DateTime? EndDate,
    DateTime? NextPaymentDate,
    string? Color,
    int SortOrder,
    bool IsActive,
    string? Notes
);

// === FinancialGoal DTOs ===
public record FinancialGoalDto(
    int Id,
    string Name,
    string? Description,
    GoalType Type,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal? MonthlyContribution,
    DateTime? TargetDate,
    DateTime? StartDate,
    string? Color,
    string? Icon,
    int SortOrder,
    bool IsCompleted,
    DateTime? CompletedAt,
    decimal ProgressPercentage,
    decimal RemainingAmount,
    int? MonthsToGoal
);

public record CreateGoalRequest(
    string Name,
    string? Description,
    GoalType Type,
    decimal TargetAmount,
    decimal CurrentAmount = 0,
    decimal? MonthlyContribution = null,
    DateTime? TargetDate = null,
    DateTime? StartDate = null,
    string? Color = null,
    string? Icon = null,
    int SortOrder = 0
);

public record UpdateGoalRequest(
    string Name,
    string? Description,
    GoalType Type,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal? MonthlyContribution,
    DateTime? TargetDate,
    DateTime? StartDate,
    string? Color,
    string? Icon,
    int SortOrder,
    bool IsCompleted
);

// === Dashboard Summary DTOs ===
public record PersonalFinanceSummary(
    // Nettovärde
    decimal TotalAssets,
    decimal TotalDebts,
    decimal NetWorth,
    
    // Månadsbudget
    decimal TotalMonthlyIncome,
    decimal TotalMonthlyExpenses,
    decimal MonthlyBalance,
    
    // Skulder
    decimal TotalDebtRemaining,
    decimal AverageDebtPercentage,
    
    // Skulder per kategori (procent kvar)
    decimal HousingDebtPercentage,  // Bolån
    decimal PersonalDebtPercentage, // Privatlån, kreditkort, etc.
    decimal TotalDebtPercentage,    // Total
    
    // Tillgångar per kategori
    List<AssetCategorySummary> AssetsByCategory,
    
    // Skulder per typ
    List<DebtTypeSummary> DebtsByType,
    
    // Prognoser
    List<FinancialProjection> Projections
);

public record AssetCategorySummary(
    AccountCategory Category,
    string CategoryName,
    decimal TotalBalance,
    int AccountCount
);

public record DebtTypeSummary(
    DebtType Type,
    string TypeName,
    decimal TotalBalance,
    decimal TotalOriginalAmount,
    decimal TotalEquity,
    int DebtCount,
    decimal RemainingPercentage
);

public record FinancialProjection(
    int Years,
    decimal TotalCosts,
    decimal TotalSaved,
    decimal ProjectedNetWorth,
    decimal TotalInterestPaid,
    decimal TotalAmortization,
    decimal RemainingDebt,
    decimal ProjectedSavingsWithInterest
);

public record BudgetSummary(
    List<PersonalBudgetDto> IncomeItems,
    List<PersonalBudgetDto> ExpenseItems,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal Balance
);

// === Tax & Pension DTOs ===
public record TaxAndPensionSummary(
    // Bruttolön
    decimal GrossMonthlyIncome,
    decimal GrossYearlyIncome,
    
    // Skatt
    decimal MonthlyTax,
    decimal YearlyTax,
    decimal EffectiveTaxRate,
    
    // Nettolön
    decimal NetMonthlyIncome,
    decimal NetYearlyIncome,
    
    // Arbetsgivaravgifter (visas för info)
    decimal MonthlyEmployerContributions,
    decimal YearlyEmployerContributions,
    
    // Pension
    decimal MonthlyPensionContribution,
    decimal YearlyPensionContribution,
    decimal CurrentPensionSavings,
    List<PensionProjection> PensionProjections,
    
    // Skatteåterbetalning (om tillämpligt)
    decimal EstimatedYearlyDeductions,
    decimal EstimatedTaxRefund,
    
    // Totalkostnad för arbetsgivare
    decimal TotalEmployerCost
);

public record PensionProjection(
    int Age,
    int YearsFromNow,
    decimal ProjectedPensionCapital,
    decimal EstimatedMonthlyPension,
    decimal EstimatedYearlyPension
);


