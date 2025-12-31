namespace MyFuture.Api.DTOs;

public record CreateCustomerRequest(
    string Name,
    string? OrganizationNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Country,
    string? Phone,
    string? Email,
    int PaymentTermsDays = 30
);

public record UpdateCustomerRequest(
    string Name,
    string? OrganizationNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Country,
    string? Phone,
    string? Email,
    int PaymentTermsDays
);

public record CustomerDto(
    int Id,
    string CustomerNumber,
    string Name,
    string? OrganizationNumber,
    string? Address,
    string? PostalCode,
    string? City,
    string? Country,
    string? Phone,
    string? Email,
    int PaymentTermsDays,
    DateTime CreatedAt
);

