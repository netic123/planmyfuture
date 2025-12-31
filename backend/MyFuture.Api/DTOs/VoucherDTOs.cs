using MyFuture.Api.Models;

namespace MyFuture.Api.DTOs;

public record CreateVoucherRequest(
    DateTime VoucherDate,
    string Description,
    VoucherType Type,
    List<CreateVoucherRowRequest> Rows
);

public record CreateVoucherRowRequest(
    int AccountId,
    decimal Debit,
    decimal Credit,
    string? Description
);

public record VoucherDto(
    int Id,
    string VoucherNumber,
    DateTime VoucherDate,
    string Description,
    VoucherType Type,
    DateTime CreatedAt,
    List<VoucherRowDto> Rows
);

public record VoucherListDto(
    int Id,
    string VoucherNumber,
    DateTime VoucherDate,
    string Description,
    VoucherType Type,
    decimal TotalAmount
);

public record VoucherRowDto(
    int Id,
    string AccountNumber,
    string AccountName,
    decimal Debit,
    decimal Credit,
    string? Description
);

