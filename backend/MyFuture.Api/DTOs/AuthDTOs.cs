namespace MyFuture.Api.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    int UserId,
    string Email,
    string FirstName,
    string LastName,
    string Token,
    string PreferredLanguage
);

public record UserDto(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    DateTime CreatedAt,
    string PreferredLanguage
);

public record UpdateLanguageRequest(
    string Language
);

public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Token,
    string NewPassword
);

