using MyFuture.Api.Models;

namespace MyFuture.Api.DTOs;

public record CreateInvoiceRequest(
    int CustomerId,
    DateTime InvoiceDate,
    DateTime DueDate,
    string? Reference,
    string? Notes,
    List<CreateInvoiceLineRequest> Lines
);

public record CreateInvoiceLineRequest(
    string Description,
    decimal Quantity,
    string Unit,
    decimal UnitPrice,
    decimal VatRate
);

public record UpdateInvoiceRequest(
    int CustomerId,
    DateTime InvoiceDate,
    DateTime DueDate,
    string? Reference,
    string? Notes,
    List<CreateInvoiceLineRequest> Lines
);

public record InvoiceDto(
    int Id,
    string InvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    InvoiceStatus Status,
    decimal TotalExcludingVat,
    decimal VatAmount,
    decimal TotalIncludingVat,
    string? Reference,
    string? Notes,
    DateTime CreatedAt,
    DateTime? PaidAt,
    CustomerDto Customer,
    List<InvoiceLineDto> Lines
);

public record InvoiceListDto(
    int Id,
    string InvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    InvoiceStatus Status,
    decimal TotalIncludingVat,
    string CustomerName
);

public record InvoiceLineDto(
    int Id,
    string Description,
    decimal Quantity,
    string Unit,
    decimal UnitPrice,
    decimal VatRate,
    decimal TotalExcludingVat,
    decimal VatAmount,
    decimal TotalIncludingVat
);

