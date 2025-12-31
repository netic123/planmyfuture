namespace MyFuture.Api.DTOs;

public record CreateCompanyRequest(
    string Name,
    string OrganizationNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Phone,
    string? Email,
    string? Website,
    string? BankAccount,
    string? Bankgiro,
    string? Plusgiro
);

public record UpdateCompanyRequest(
    string Name,
    string OrganizationNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Phone,
    string? Email,
    string? Website,
    string? BankAccount,
    string? Bankgiro,
    string? Plusgiro
);

public record CompanyDto(
    int Id,
    string Name,
    string OrganizationNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Phone,
    string? Email,
    string? Website,
    string? BankAccount,
    string? Bankgiro,
    string? Plusgiro,
    int? CurrentFiscalYear,
    DateTime CreatedAt
);

