using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IGigService
{
    // Gigs
    Task<GigSearchResult> SearchGigsAsync(GigSearchRequest request);
    Task<GigDto?> GetGigAsync(int id, int? userId);
    Task<GigDto> CreateGigAsync(int userId, CreateGigRequest request);
    Task<GigDto?> UpdateGigAsync(int userId, int id, UpdateGigRequest request);
    Task<bool> DeleteGigAsync(int userId, int id);
    Task<bool> PublishGigAsync(int userId, int id);
    Task<bool> CloseGigAsync(int userId, int id);
    Task<IEnumerable<GigDto>> GetMyGigsAsync(int userId);
    
    // Applications
    Task<GigApplicationDto?> ApplyToGigAsync(int userId, int gigId, ApplyToGigRequest request);
    Task<IEnumerable<GigApplicationDto>> GetApplicationsForGigAsync(int userId, int gigId);
    Task<IEnumerable<GigApplicationDto>> GetMyApplicationsAsync(int userId);
    Task<bool> UpdateApplicationStatusAsync(int userId, int applicationId, UpdateApplicationStatusRequest request);
    Task<bool> WithdrawApplicationAsync(int userId, int applicationId);
    
    // Profiles
    Task<ConsultantProfileDto?> GetProfileAsync(int userId);
    Task<ConsultantProfileDto?> GetProfileByIdAsync(int profileId);
    Task<ConsultantProfileDto> CreateOrUpdateProfileAsync(int userId, CreateProfileRequest request);
    Task<ConsultantSearchResult> SearchConsultantsAsync(ConsultantSearchRequest request);
}

public class GigService : IGigService
{
    private readonly AppDbContext _context;

    public GigService(AppDbContext context)
    {
        _context = context;
    }

    #region Gigs

    public async Task<GigSearchResult> SearchGigsAsync(GigSearchRequest request)
    {
        var query = _context.Gigs
            .Where(g => g.Status == GigStatus.Published)
            .AsQueryable();

        // Text search
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var searchTerm = request.Query.ToLower();
            query = query.Where(g => 
                g.Title.ToLower().Contains(searchTerm) ||
                g.Description.ToLower().Contains(searchTerm) ||
                g.Company.ToLower().Contains(searchTerm) ||
                g.Skills.ToLower().Contains(searchTerm));
        }

        // Filters
        if (request.Category.HasValue)
            query = query.Where(g => g.Category == request.Category.Value);

        if (request.LocationType.HasValue)
            query = query.Where(g => g.LocationType == request.LocationType.Value);

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(g => g.City != null && g.City.ToLower().Contains(request.City.ToLower()));

        if (request.MinRate.HasValue)
            query = query.Where(g => g.HourlyRate >= request.MinRate.Value || g.MonthlyRate >= request.MinRate.Value * 160);

        if (request.MaxRate.HasValue)
            query = query.Where(g => g.HourlyRate <= request.MaxRate.Value || g.MonthlyRate <= request.MaxRate.Value * 160);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var gigs = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(g => new GigListDto(
                g.Id,
                g.Title,
                g.Company,
                g.Category,
                GetCategoryName(g.Category),
                g.LocationType,
                GetLocationTypeName(g.LocationType),
                g.City,
                g.StartDate,
                g.DurationMonths,
                g.HoursPerWeek,
                g.HourlyRate,
                g.MonthlyRate,
                g.CreatedAt,
                g.ApplicationCount,
                g.Skills.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ))
            .ToListAsync();

        return new GigSearchResult(gigs, totalCount, request.Page, request.PageSize, totalPages);
    }

    public async Task<GigDto?> GetGigAsync(int id, int? userId)
    {
        var gig = await _context.Gigs
            .Include(g => g.User)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (gig == null) return null;

        // Increment view count
        gig.ViewCount++;
        await _context.SaveChangesAsync();

        return MapToDto(gig, userId);
    }

    public async Task<GigDto> CreateGigAsync(int userId, CreateGigRequest request)
    {
        var gig = new Gig
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            Company = request.Company,
            Category = request.Category,
            Skills = request.Skills,
            LocationType = request.LocationType,
            City = request.City,
            StartDate = request.StartDate,
            DurationMonths = request.DurationMonths,
            HoursPerWeek = request.HoursPerWeek,
            HourlyRate = request.HourlyRate,
            MonthlyRate = request.MonthlyRate,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Status = request.Publish ? GigStatus.Published : GigStatus.Draft,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        _context.Gigs.Add(gig);
        await _context.SaveChangesAsync();

        gig = await _context.Gigs.Include(g => g.User).FirstAsync(g => g.Id == gig.Id);
        return MapToDto(gig, userId);
    }

    public async Task<GigDto?> UpdateGigAsync(int userId, int id, UpdateGigRequest request)
    {
        var gig = await _context.Gigs.Include(g => g.User).FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        if (gig == null) return null;

        gig.Title = request.Title;
        gig.Description = request.Description;
        gig.Company = request.Company;
        gig.Category = request.Category;
        gig.Skills = request.Skills;
        gig.LocationType = request.LocationType;
        gig.City = request.City;
        gig.StartDate = request.StartDate;
        gig.DurationMonths = request.DurationMonths;
        gig.HoursPerWeek = request.HoursPerWeek;
        gig.HourlyRate = request.HourlyRate;
        gig.MonthlyRate = request.MonthlyRate;
        gig.ContactEmail = request.ContactEmail;
        gig.ContactPhone = request.ContactPhone;
        gig.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(gig, userId);
    }

    public async Task<bool> DeleteGigAsync(int userId, int id)
    {
        var gig = await _context.Gigs.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        if (gig == null) return false;

        _context.Gigs.Remove(gig);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> PublishGigAsync(int userId, int id)
    {
        var gig = await _context.Gigs.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        if (gig == null) return false;

        gig.Status = GigStatus.Published;
        gig.ExpiresAt = DateTime.UtcNow.AddDays(30);
        gig.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CloseGigAsync(int userId, int id)
    {
        var gig = await _context.Gigs.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
        if (gig == null) return false;

        gig.Status = GigStatus.Closed;
        gig.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<GigDto>> GetMyGigsAsync(int userId)
    {
        var gigs = await _context.Gigs
            .Include(g => g.User)
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();

        return gigs.Select(g => MapToDto(g, userId));
    }

    #endregion

    #region Applications

    public async Task<GigApplicationDto?> ApplyToGigAsync(int userId, int gigId, ApplyToGigRequest request)
    {
        // Check if gig exists and is published
        var gig = await _context.Gigs.FirstOrDefaultAsync(g => g.Id == gigId && g.Status == GigStatus.Published);
        if (gig == null) return null;

        // Check if user already applied
        var existingApplication = await _context.GigApplications
            .FirstOrDefaultAsync(a => a.GigId == gigId && a.UserId == userId);
        if (existingApplication != null) return null;

        // Can't apply to own gig
        if (gig.UserId == userId) return null;

        var application = new GigApplication
        {
            GigId = gigId,
            UserId = userId,
            CoverLetter = request.CoverLetter,
            ProposedRate = request.ProposedRate,
            AvailableFrom = request.AvailableFrom,
            Status = ApplicationStatus.Pending
        };

        _context.GigApplications.Add(application);
        gig.ApplicationCount++;
        await _context.SaveChangesAsync();

        return await GetApplicationDtoAsync(application.Id);
    }

    public async Task<IEnumerable<GigApplicationDto>> GetApplicationsForGigAsync(int userId, int gigId)
    {
        // Verify user owns the gig
        var gig = await _context.Gigs.FirstOrDefaultAsync(g => g.Id == gigId && g.UserId == userId);
        if (gig == null) return Enumerable.Empty<GigApplicationDto>();

        var applications = await _context.GigApplications
            .Include(a => a.Gig)
            .Include(a => a.User)
            .Where(a => a.GigId == gigId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        var result = new List<GigApplicationDto>();
        foreach (var app in applications)
        {
            var profile = await _context.ConsultantProfiles.FirstOrDefaultAsync(p => p.UserId == app.UserId);
            result.Add(MapApplicationToDto(app, profile));
        }
        return result;
    }

    public async Task<IEnumerable<GigApplicationDto>> GetMyApplicationsAsync(int userId)
    {
        var applications = await _context.GigApplications
            .Include(a => a.Gig)
            .Include(a => a.User)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        var profile = await _context.ConsultantProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        return applications.Select(a => MapApplicationToDto(a, profile));
    }

    public async Task<bool> UpdateApplicationStatusAsync(int userId, int applicationId, UpdateApplicationStatusRequest request)
    {
        var application = await _context.GigApplications
            .Include(a => a.Gig)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null) return false;

        // Only gig owner can update status
        if (application.Gig.UserId != userId) return false;

        application.Status = request.Status;
        application.StatusNote = request.StatusNote;
        application.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> WithdrawApplicationAsync(int userId, int applicationId)
    {
        var application = await _context.GigApplications
            .Include(a => a.Gig)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId);

        if (application == null) return false;

        application.Status = ApplicationStatus.Withdrawn;
        application.Gig.ApplicationCount = Math.Max(0, application.Gig.ApplicationCount - 1);

        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Profiles

    public async Task<ConsultantProfileDto?> GetProfileAsync(int userId)
    {
        var profile = await _context.ConsultantProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        return profile == null ? null : MapProfileToDto(profile);
    }

    public async Task<ConsultantProfileDto?> GetProfileByIdAsync(int profileId)
    {
        var profile = await _context.ConsultantProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == profileId);

        return profile == null ? null : MapProfileToDto(profile);
    }

    public async Task<ConsultantProfileDto> CreateOrUpdateProfileAsync(int userId, CreateProfileRequest request)
    {
        var profile = await _context.ConsultantProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new ConsultantProfile { UserId = userId };
            _context.ConsultantProfiles.Add(profile);
        }

        profile.Headline = request.Headline;
        profile.Summary = request.Summary;
        profile.Skills = request.Skills;
        profile.YearsOfExperience = request.YearsOfExperience;
        profile.CurrentTitle = request.CurrentTitle;
        profile.CurrentCompany = request.CurrentCompany;
        profile.City = request.City;
        profile.IsAvailable = request.IsAvailable;
        profile.AvailableFrom = request.AvailableFrom;
        profile.PreferredLocationType = request.PreferredLocationType;
        profile.HourlyRate = request.HourlyRate;
        profile.LinkedInUrl = request.LinkedInUrl;
        profile.Email = request.Email;
        profile.Phone = request.Phone;
        profile.Website = request.Website;
        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        profile = await _context.ConsultantProfiles.Include(p => p.User).FirstAsync(p => p.Id == profile.Id);
        return MapProfileToDto(profile);
    }

    public async Task<ConsultantSearchResult> SearchConsultantsAsync(ConsultantSearchRequest request)
    {
        var query = _context.ConsultantProfiles
            .Include(p => p.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var searchTerm = request.Query.ToLower();
            query = query.Where(p =>
                p.Headline.ToLower().Contains(searchTerm) ||
                p.Summary.ToLower().Contains(searchTerm) ||
                p.Skills.ToLower().Contains(searchTerm) ||
                p.User.FirstName.ToLower().Contains(searchTerm) ||
                p.User.LastName.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(request.Skills))
        {
            var skillTerms = request.Skills.ToLower().Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            query = query.Where(p => skillTerms.Any(s => p.Skills.ToLower().Contains(s)));
        }

        if (request.LocationType.HasValue)
            query = query.Where(p => p.PreferredLocationType == request.LocationType.Value);

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(p => p.City != null && p.City.ToLower().Contains(request.City.ToLower()));

        if (request.IsAvailable.HasValue)
            query = query.Where(p => p.IsAvailable == request.IsAvailable.Value);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var profiles = await query
            .OrderByDescending(p => p.IsAvailable)
            .ThenByDescending(p => p.UpdatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new ConsultantSearchResult(
            profiles.Select(MapProfileToDto),
            totalCount,
            request.Page,
            request.PageSize,
            totalPages
        );
    }

    #endregion

    #region Helper Methods

    private GigDto MapToDto(Gig gig, int? userId) => new(
        gig.Id,
        gig.UserId,
        gig.Title,
        gig.Description,
        gig.Company,
        gig.Category,
        GetCategoryName(gig.Category),
        gig.Skills,
        gig.LocationType,
        GetLocationTypeName(gig.LocationType),
        gig.City,
        gig.StartDate,
        gig.DurationMonths,
        gig.HoursPerWeek,
        gig.HourlyRate,
        gig.MonthlyRate,
        gig.Status,
        GetStatusName(gig.Status),
        gig.CreatedAt,
        gig.ExpiresAt,
        gig.ViewCount,
        gig.ApplicationCount,
        gig.ContactEmail,
        gig.ContactPhone,
        $"{gig.User.FirstName} {gig.User.LastName}",
        userId.HasValue && gig.UserId == userId.Value
    );

    private async Task<GigApplicationDto?> GetApplicationDtoAsync(int applicationId)
    {
        var app = await _context.GigApplications
            .Include(a => a.Gig)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null) return null;

        var profile = await _context.ConsultantProfiles.FirstOrDefaultAsync(p => p.UserId == app.UserId);
        return MapApplicationToDto(app, profile);
    }

    private static GigApplicationDto MapApplicationToDto(GigApplication app, ConsultantProfile? profile) => new(
        app.Id,
        app.GigId,
        app.Gig.Title,
        app.Gig.Company,
        app.UserId,
        $"{app.User.FirstName} {app.User.LastName}",
        profile?.Headline,
        app.CoverLetter,
        app.ProposedRate,
        app.AvailableFrom,
        app.Status,
        GetApplicationStatusName(app.Status),
        app.AppliedAt,
        app.ReviewedAt
    );

    private static ConsultantProfileDto MapProfileToDto(ConsultantProfile profile) => new(
        profile.Id,
        profile.UserId,
        $"{profile.User.FirstName} {profile.User.LastName}",
        profile.Headline,
        profile.Summary,
        profile.ProfileImageUrl,
        profile.Skills.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
        profile.YearsOfExperience,
        profile.CurrentTitle,
        profile.CurrentCompany,
        profile.City,
        profile.IsAvailable,
        profile.AvailableFrom,
        profile.PreferredLocationType,
        GetLocationTypeName(profile.PreferredLocationType),
        profile.HourlyRate,
        profile.LinkedInUrl,
        profile.Email,
        profile.Phone,
        profile.Website,
        profile.CreatedAt
    );

    private static string GetCategoryName(GigCategory category) => category switch
    {
        GigCategory.ITTelekom => "IT & Telekom",
        GigCategory.Management => "Management & Strategi",
        GigCategory.TeknikKonstruktion => "Teknik & Konstruktion",
        GigCategory.EkonomiFinans => "Ekonomi & Finans",
        GigCategory.MarknadsforingPR => "Marknadsföring & PR",
        GigCategory.DesignMedia => "Design & Media",
        GigCategory.JuridikInkop => "Juridik & Inköp",
        GigCategory.ByggAnlaggning => "Bygg & Anläggning",
        GigCategory.Ovrigt => "Övrigt",
        _ => "Okänd"
    };

    private static string GetLocationTypeName(GigLocationType type) => type switch
    {
        GigLocationType.Remote => "Remote",
        GigLocationType.OnSite => "On-site",
        GigLocationType.Hybrid => "Hybrid",
        _ => "Okänd"
    };

    private static string GetStatusName(GigStatus status) => status switch
    {
        GigStatus.Draft => "Utkast",
        GigStatus.Published => "Publicerad",
        GigStatus.Closed => "Stängd",
        GigStatus.Filled => "Tillsatt",
        _ => "Okänd"
    };

    private static string GetApplicationStatusName(ApplicationStatus status) => status switch
    {
        ApplicationStatus.Pending => "Väntar",
        ApplicationStatus.Reviewed => "Granskad",
        ApplicationStatus.Shortlisted => "Kortlista",
        ApplicationStatus.Rejected => "Avvisad",
        ApplicationStatus.Accepted => "Accepterad",
        ApplicationStatus.Withdrawn => "Återkallad",
        _ => "Okänd"
    };

    #endregion
}

