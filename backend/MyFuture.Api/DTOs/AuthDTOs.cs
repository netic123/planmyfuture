namespace MyFuture.Api.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    int? BirthYear = null
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
    string PreferredLanguage,
    int? BirthYear = null
);

public record UserDto(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    DateTime CreatedAt,
    string PreferredLanguage,
    int? BirthYear = null
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

