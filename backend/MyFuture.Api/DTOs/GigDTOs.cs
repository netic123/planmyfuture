using MyFuture.Api.Models;

namespace MyFuture.Api.DTOs;

// Gig DTOs
public record CreateGigRequest(
    string Title,
    string Description,
    string Company,
    GigCategory Category,
    string Skills,
    GigLocationType LocationType,
    string? City,
    DateTime? StartDate,
    int? DurationMonths,
    int? HoursPerWeek,
    decimal? HourlyRate,
    decimal? MonthlyRate,
    string? ContactEmail,
    string? ContactPhone,
    bool Publish = false
);

public record UpdateGigRequest(
    string Title,
    string Description,
    string Company,
    GigCategory Category,
    string Skills,
    GigLocationType LocationType,
    string? City,
    DateTime? StartDate,
    int? DurationMonths,
    int? HoursPerWeek,
    decimal? HourlyRate,
    decimal? MonthlyRate,
    string? ContactEmail,
    string? ContactPhone
);

public record GigDto(
    int Id,
    int UserId,
    string Title,
    string Description,
    string Company,
    GigCategory Category,
    string CategoryName,
    string Skills,
    GigLocationType LocationType,
    string LocationTypeName,
    string? City,
    DateTime? StartDate,
    int? DurationMonths,
    int? HoursPerWeek,
    decimal? HourlyRate,
    decimal? MonthlyRate,
    GigStatus Status,
    string StatusName,
    DateTime CreatedAt,
    DateTime? ExpiresAt,
    int ViewCount,
    int ApplicationCount,
    string? ContactEmail,
    string? ContactPhone,
    string PosterName,
    bool IsOwner
);

public record GigListDto(
    int Id,
    string Title,
    string Company,
    GigCategory Category,
    string CategoryName,
    GigLocationType LocationType,
    string LocationTypeName,
    string? City,
    DateTime? StartDate,
    int? DurationMonths,
    int? HoursPerWeek,
    decimal? HourlyRate,
    decimal? MonthlyRate,
    DateTime CreatedAt,
    int ApplicationCount,
    string[] Skills
);

public record GigSearchRequest(
    string? Query,
    GigCategory? Category,
    GigLocationType? LocationType,
    string? City,
    decimal? MinRate,
    decimal? MaxRate,
    int Page = 1,
    int PageSize = 20
);

public record GigSearchResult(
    IEnumerable<GigListDto> Gigs,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

// Consultant Profile DTOs
public record CreateProfileRequest(
    string Headline,
    string Summary,
    string Skills,
    int YearsOfExperience,
    string? CurrentTitle,
    string? CurrentCompany,
    string? City,
    bool IsAvailable,
    DateTime? AvailableFrom,
    GigLocationType PreferredLocationType,
    decimal? HourlyRate,
    string? LinkedInUrl,
    string? Email,
    string? Phone,
    string? Website
);

public record UpdateProfileRequest(
    string Headline,
    string Summary,
    string Skills,
    int YearsOfExperience,
    string? CurrentTitle,
    string? CurrentCompany,
    string? City,
    bool IsAvailable,
    DateTime? AvailableFrom,
    GigLocationType PreferredLocationType,
    decimal? HourlyRate,
    string? LinkedInUrl,
    string? Email,
    string? Phone,
    string? Website
);

public record ConsultantProfileDto(
    int Id,
    int UserId,
    string Name,
    string Headline,
    string Summary,
    string? ProfileImageUrl,
    string[] Skills,
    int YearsOfExperience,
    string? CurrentTitle,
    string? CurrentCompany,
    string? City,
    bool IsAvailable,
    DateTime? AvailableFrom,
    GigLocationType PreferredLocationType,
    string PreferredLocationTypeName,
    decimal? HourlyRate,
    string? LinkedInUrl,
    string? Email,
    string? Phone,
    string? Website,
    DateTime CreatedAt
);

public record ConsultantSearchRequest(
    string? Query,
    string? Skills,
    GigLocationType? LocationType,
    string? City,
    bool? IsAvailable,
    int Page = 1,
    int PageSize = 20
);

public record ConsultantSearchResult(
    IEnumerable<ConsultantProfileDto> Consultants,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

// Application DTOs
public record ApplyToGigRequest(
    string CoverLetter,
    decimal? ProposedRate,
    DateTime? AvailableFrom
);

public record GigApplicationDto(
    int Id,
    int GigId,
    string GigTitle,
    string GigCompany,
    int UserId,
    string ApplicantName,
    string? ApplicantHeadline,
    string CoverLetter,
    decimal? ProposedRate,
    DateTime? AvailableFrom,
    ApplicationStatus Status,
    string StatusName,
    DateTime AppliedAt,
    DateTime? ReviewedAt
);

public record UpdateApplicationStatusRequest(
    ApplicationStatus Status,
    string? StatusNote
);

// LinkedIn Import DTO
public record LinkedInImportRequest(
    string AccessToken
);

public record LinkedInProfileData(
    string? FirstName,
    string? LastName,
    string? Headline,
    string? Summary,
    string? ProfilePictureUrl,
    string? Email,
    string? Location,
    IEnumerable<string>? Skills
);

