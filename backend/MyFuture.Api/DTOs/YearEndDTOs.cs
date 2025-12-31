namespace MyFuture.Api.DTOs;

// Bokslut / Year-End Closing
public record YearEndSummary(
    int FiscalYear,
    DateTime FromDate,
    DateTime ToDate,
    bool IsClosed,
    
    // Resultaträkning
    decimal TotalRevenue,
    decimal TotalExpenses,
    decimal OperatingResult,
    decimal FinancialIncome,
    decimal FinancialExpenses,
    decimal ResultBeforeTax,
    decimal CorporateTax,
    decimal NetResult,
    
    // Balansräkning
    decimal TotalAssets,
    decimal TotalLiabilities,
    decimal Equity,
    
    // Detaljer
    List<AccountSummaryRow> RevenueAccounts,
    List<AccountSummaryRow> ExpenseAccounts,
    List<AccountSummaryRow> AssetAccounts,
    List<AccountSummaryRow> LiabilityAccounts
);

public record AccountSummaryRow(
    string AccountNumber,
    string AccountName,
    decimal Amount
);

// Skatteberäkning
public record TaxCalculation(
    int FiscalYear,
    
    // Resultat
    decimal ResultBeforeTax,
    decimal TaxableIncome,
    
    // Bolagsskatt (20.6%)
    decimal CorporateTaxRate,
    decimal CorporateTax,
    
    // Moms
    decimal OutputVat,
    decimal InputVat,
    decimal VatToPay,
    
    // Arbetsgivaravgifter
    decimal TotalGrossSalaries,
    decimal TotalEmployerContributions,
    decimal EmployerContributionRate,
    
    // Preliminärskatt anställda
    decimal TotalEmployeeTax,
    
    // Sammanfattning
    decimal TotalTaxLiabilities
);

public record CloseYearRequest(
    int FiscalYear
);

public record CloseYearResult(
    bool Success,
    string Message,
    int? NewFiscalYear
);



