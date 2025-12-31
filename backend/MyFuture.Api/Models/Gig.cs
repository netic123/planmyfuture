namespace MyFuture.Api.Models;

public enum GigCategory
{
    ITTelekom,
    Management,
    TeknikKonstruktion,
    EkonomiFinans,
    MarknadsforingPR,
    DesignMedia,
    JuridikInkop,
    ByggAnlaggning,
    Ovrigt
}

public enum GigLocationType
{
    Remote,
    OnSite,
    Hybrid
}

public enum GigStatus
{
    Draft,
    Published,
    Closed,
    Filled
}

public class Gig
{
    public int Id { get; set; }
    public int UserId { get; set; }
    
    // Basic Info
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    
    // Category & Skills
    public GigCategory Category { get; set; }
    public string Skills { get; set; } = string.Empty; // Comma-separated
    
    // Location
    public GigLocationType LocationType { get; set; }
    public string? City { get; set; }
    
    // Duration & Rate
    public DateTime? StartDate { get; set; }
    public int? DurationMonths { get; set; }
    public int? HoursPerWeek { get; set; }
    public decimal? HourlyRate { get; set; }
    public decimal? MonthlyRate { get; set; }
    
    // Status
    public GigStatus Status { get; set; } = GigStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    
    // Stats
    public int ViewCount { get; set; } = 0;
    public int ApplicationCount { get; set; } = 0;
    
    // Contact
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    
    // Navigation
    public User User { get; set; } = null!;
    public ICollection<GigApplication> Applications { get; set; } = new List<GigApplication>();
}

public class ConsultantProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    
    // Basic Info
    public string Headline { get; set; } = string.Empty; // "Senior .NET Developer"
    public string Summary { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    
    // Skills & Experience
    public string Skills { get; set; } = string.Empty; // Comma-separated
    public int YearsOfExperience { get; set; }
    public string? CurrentTitle { get; set; }
    public string? CurrentCompany { get; set; }
    
    // Location & Availability
    public string? City { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime? AvailableFrom { get; set; }
    public GigLocationType PreferredLocationType { get; set; } = GigLocationType.Remote;
    
    // Rate
    public decimal? HourlyRate { get; set; }
    
    // LinkedIn
    public string? LinkedInUrl { get; set; }
    public string? LinkedInData { get; set; } // JSON data from LinkedIn import
    
    // Contact
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public User User { get; set; } = null!;
}

public enum ApplicationStatus
{
    Pending,
    Reviewed,
    Shortlisted,
    Rejected,
    Accepted,
    Withdrawn
}

public class GigApplication
{
    public int Id { get; set; }
    public int GigId { get; set; }
    public int UserId { get; set; }
    
    // Application
    public string CoverLetter { get; set; } = string.Empty;
    public decimal? ProposedRate { get; set; }
    public DateTime? AvailableFrom { get; set; }
    
    // Status
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public string? StatusNote { get; set; }
    
    // Timestamps
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    
    // Navigation
    public Gig Gig { get; set; } = null!;
    public User User { get; set; } = null!;
}

