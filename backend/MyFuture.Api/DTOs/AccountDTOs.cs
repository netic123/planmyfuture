using MyFuture.Api.Models;

namespace MyFuture.Api.DTOs;

public record CreateAccountRequest(
    string AccountNumber,
    string Name,
    AccountType Type
);

public record AccountDto(
    int Id,
    string AccountNumber,
    string Name,
    AccountType Type,
    bool IsActive
);

public record AccountBalanceDto(
    int Id,
    string AccountNumber,
    string Name,
    AccountType Type,
    decimal Debit,
    decimal Credit,
    decimal Balance
);

