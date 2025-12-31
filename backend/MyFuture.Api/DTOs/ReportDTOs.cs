namespace MyFuture.Api.DTOs;

public record DashboardDto(
    decimal TotalRevenue,
    decimal TotalExpenses,
    decimal Profit,
    int InvoiceCount,
    int UnpaidInvoices,
    decimal UnpaidAmount,
    int CustomerCount,
    int EmployeeCount,
    List<MonthlyRevenueDto> MonthlyRevenue
);

public record MonthlyRevenueDto(
    int Year,
    int Month,
    string MonthName,
    decimal Revenue,
    decimal Expenses
);

public record IncomeStatementDto(
    DateTime FromDate,
    DateTime ToDate,
    List<IncomeStatementRowDto> RevenueAccounts,
    decimal TotalRevenue,
    List<IncomeStatementRowDto> ExpenseAccounts,
    decimal TotalExpenses,
    decimal NetIncome
);

public record IncomeStatementRowDto(
    string AccountNumber,
    string AccountName,
    decimal Amount
);

public record BalanceSheetDto(
    DateTime AsOfDate,
    List<BalanceSheetRowDto> Assets,
    decimal TotalAssets,
    List<BalanceSheetRowDto> Liabilities,
    decimal TotalLiabilities,
    decimal Equity,
    decimal TotalLiabilitiesAndEquity
);

public record BalanceSheetRowDto(
    string AccountNumber,
    string AccountName,
    decimal Balance
);

public record VatReportDto(
    DateTime FromDate,
    DateTime ToDate,
    decimal OutputVat,      // Utgående moms (försäljning)
    decimal InputVat,       // Ingående moms (inköp)
    decimal VatToPay        // Moms att betala
);

