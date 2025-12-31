using MyFuture.Api.Models;

namespace MyFuture.Api.DTOs;

public record VatPeriodDto(
    int Year,
    int Period,
    VatPeriodType PeriodType,
    string PeriodName,
    DateTime FromDate,
    DateTime ToDate,
    decimal OutputVat,
    decimal InputVat,
    decimal VatToPay,
    bool IsPaid,
    DateTime? PaidAt,
    decimal? PaidAmount,
    string? PaymentReference,
    string? Notes
);

public record VatSummaryDto(
    int Year,
    VatPeriodType PeriodType,
    List<VatPeriodDto> Periods,
    decimal TotalOutputVat,
    decimal TotalInputVat,
    decimal TotalVatToPay,
    decimal TotalPaid,
    decimal Remaining
);

public record MarkVatPaidRequest(
    int Year,
    int Period,
    VatPeriodType PeriodType,
    decimal? PaidAmount,
    string? PaymentReference,
    string? Notes
);

public record UpdateVatSettingsRequest(
    VatPeriodType PeriodType
);



