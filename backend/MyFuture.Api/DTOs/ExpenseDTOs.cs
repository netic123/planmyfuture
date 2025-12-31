using MyFuture.Api.Models;

namespace MyFuture.Api.DTOs;

public record ExpenseDto(
    int Id,
    string Description,
    decimal Amount,
    decimal VatAmount,
    decimal TotalAmount,
    decimal VatRate,
    DateTime ExpenseDate,
    ExpenseCategory Category,
    ExpenseStatus Status,
    string? ReceiptNumber,
    string? Notes,
    string? Supplier,
    DateTime CreatedAt,
    DateTime? ApprovedAt,
    DateTime? PaidAt,
    int? EmployeeId,
    string? EmployeeName,
    int? AccountId,
    string? AccountName
);

public record ExpenseListDto(
    int Id,
    string Description,
    decimal TotalAmount,
    DateTime ExpenseDate,
    ExpenseCategory Category,
    ExpenseStatus Status,
    string? Supplier,
    string? EmployeeName
);

public record CreateExpenseRequest(
    string Description,
    decimal Amount,
    decimal VatRate,
    DateTime ExpenseDate,
    ExpenseCategory Category,
    string? ReceiptNumber,
    string? Notes,
    string? Supplier,
    int? EmployeeId,
    int? AccountId
);

public record UpdateExpenseRequest(
    string Description,
    decimal Amount,
    decimal VatRate,
    DateTime ExpenseDate,
    ExpenseCategory Category,
    string? ReceiptNumber,
    string? Notes,
    string? Supplier,
    int? EmployeeId,
    int? AccountId
);



