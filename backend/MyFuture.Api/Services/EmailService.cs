using Resend;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IEmailService
{
    Task SendNewAccountNotificationAsync(string userEmail, string firstName, string lastName, string? ipAddress, int totalUsers, List<User>? duplicateIpAccounts = null);
    Task SendWelcomeEmailAsync(string userEmail, string firstName);
    Task SendPasswordResetEmailAsync(string userEmail, string firstName, string resetToken);
    Task SendLoginNotificationAsync(string userEmail, string firstName, string lastName, string? ipAddress, int loginCount, DateTime? lastLoginAt);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly HttpClient _httpClient;
    private readonly IResend? _resend;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
        
        // Initialize Resend client if API key is configured
        var resendApiKey = configuration["Resend:ApiKey"];
        if (!string.IsNullOrEmpty(resendApiKey))
        {
            _resend = ResendClient.Create(resendApiKey);
            _logger.LogInformation("Resend email client initialized");
        }
    }

    private async Task<string> GetCountryFromIpAsync(string? ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1" || ipAddress == "127.0.0.1")
        {
            return "Localhost (Development)";
        }

        try
        {
            var response = await _httpClient.GetStringAsync($"http://ip-api.com/json/{ipAddress}?fields=status,country,city");
            var json = JsonDocument.Parse(response);
            
            if (json.RootElement.GetProperty("status").GetString() == "success")
            {
                var country = json.RootElement.GetProperty("country").GetString() ?? "Unknown";
                var city = json.RootElement.GetProperty("city").GetString() ?? "";
                return string.IsNullOrEmpty(city) ? country : $"{city}, {country}";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get country from IP: {IP}", ipAddress);
        }

        return "Unknown";
    }

    private string GetFromEmail()
    {
        // Use configured from email or default to onboarding@resend.dev (for testing)
        var fromEmail = _configuration["Resend:FromEmail"];
        return string.IsNullOrEmpty(fromEmail) ? "Plan My Future <onboarding@resend.dev>" : fromEmail;
    }

    public async Task SendNewAccountNotificationAsync(string userEmail, string firstName, string lastName, string? ipAddress, int totalUsers, List<User>? duplicateIpAccounts = null)
    {
        if (_resend == null)
        {
            _logger.LogWarning("Resend not configured. Skipping account notification.");
            return;
        }

        try
        {
            var notifyEmail = _configuration["Resend:NotifyEmail"] ?? "eren.netic@gmail.com";
            var location = await GetCountryFromIpAsync(ipAddress);
            
            // Build duplicate warning section
            var duplicateWarningHtml = "";
            var subjectWarning = "";
            
            if (duplicateIpAccounts != null && duplicateIpAccounts.Count > 0)
            {
                subjectWarning = "⚠️ DUBBLETT! ";
                var duplicateList = string.Join("", duplicateIpAccounts.Select(u => 
                    $"<li><strong>{u.FirstName} {u.LastName}</strong> ({u.Email}) - registrerad {u.CreatedAt:yyyy-MM-dd HH:mm}</li>"));
                
                duplicateWarningHtml = $@"
                    <div style='background: #FEE2E2; border: 2px solid #DC2626; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <h3 style='color: #DC2626; margin-top: 0;'>⚠️ VARNING: Flera konton från samma IP!</h3>
                        <p>Denna IP-adress har redan <strong>{duplicateIpAccounts.Count}</strong> andra konton registrerade:</p>
                        <ul style='margin: 10px 0;'>
                            {duplicateList}
                        </ul>
                        <p style='color: #DC2626; font-weight: bold;'>Detta kan indikera missbruk eller test av flera konton.</p>
                    </div>";
            }

            var htmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #171717;'>Nytt konto har skapats på Min Ekonomi</h2>
                    {duplicateWarningHtml}
                    <div style='background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <p><strong>👤 Namn:</strong> {firstName} {lastName}</p>
                        <p><strong>📧 Email:</strong> {userEmail}</p>
                        <p><strong>🌍 Plats:</strong> {location}</p>
                        <p><strong>🔢 IP-adress:</strong> {ipAddress ?? "N/A"}</p>
                        <p><strong>🕐 Tidpunkt:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
                    </div>
                    <div style='background: #171717; color: white; padding: 15px; border-radius: 8px; text-align: center;'>
                        <p style='margin: 0; font-size: 18px;'>📊 Totalt antal användare: <strong>{totalUsers}</strong></p>
                    </div>
                    <p style='color: #6b7280; font-size: 12px; margin-top: 20px;'>Detta meddelande skickades automatiskt från Min Ekonomi.</p>
                </body>
                </html>";

            var message = new EmailMessage
            {
                From = GetFromEmail(),
                To = notifyEmail,
                Subject = $"{subjectWarning}🆕 Min Ekonomi - Nytt konto #{totalUsers} - {firstName} {lastName}",
                HtmlBody = htmlBody
            };

            await _resend.EmailSendAsync(message);
            _logger.LogInformation("Account notification email sent for {Email} via Resend", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send account notification email for {Email}", userEmail);
        }
    }

    public async Task SendWelcomeEmailAsync(string userEmail, string firstName)
    {
        if (_resend == null)
        {
            _logger.LogWarning("Resend not configured. Skipping welcome email.");
            return;
        }

        try
        {
            var frontendUrl = _configuration["App:FrontendUrl"] ?? "https://planmyfuture.org";

            var htmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;'>
                    <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                        <div style='text-align: center; margin-bottom: 30px;'>
                            <h1 style='color: #171717; margin: 0;'>Min Ekonomi</h1>
                            <p style='color: #737373; margin-top: 5px;'>Få koll på din privatekonomi</p>
                        </div>
                        
                        <h2 style='color: #171717; margin-bottom: 20px;'>Välkommen, {firstName}! 🎉</h2>
                        
                        <p style='color: #525252; font-size: 16px; line-height: 1.6;'>
                            Tack för att du skapade ett konto på Min Ekonomi! Vi är glada att ha dig med oss.
                        </p>
                        
                        <p style='color: #525252; font-size: 16px; line-height: 1.6;'>
                            Med Min Ekonomi kan du:
                        </p>
                        
                        <ul style='color: #525252; font-size: 16px; line-height: 1.8;'>
                            <li>📊 Se din nettoförmögenhet</li>
                            <li>💰 Hålla koll på inkomster och utgifter</li>
                            <li>🏠 Spåra tillgångar och skulder</li>
                            <li>📈 Få prognoser för din ekonomiska framtid</li>
                        </ul>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{frontendUrl}/login' style='display: inline-block; background: #171717; color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;'>
                                Logga in nu
                            </a>
                        </div>
                        
                        <hr style='border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;' />
                        
                        <p style='color: #a3a3a3; font-size: 12px; text-align: center;'>
                            Detta meddelande skickades till {userEmail} eftersom du skapade ett konto på Min Ekonomi.<br/>
                            Om du inte skapade detta konto, vänligen ignorera detta meddelande.
                        </p>
                    </div>
                </body>
                </html>";

            var message = new EmailMessage
            {
                From = GetFromEmail(),
                To = userEmail,
                Subject = "🎉 Välkommen till Min Ekonomi!",
                HtmlBody = htmlBody
            };

            await _resend.EmailSendAsync(message);
            _logger.LogInformation("Welcome email sent to {Email} via Resend", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", userEmail);
        }
    }

    public async Task SendPasswordResetEmailAsync(string userEmail, string firstName, string resetToken)
    {
        if (_resend == null)
        {
            _logger.LogWarning("Resend not configured. Skipping password reset email.");
            throw new InvalidOperationException("Email service not configured");
        }

        try
        {
            var frontendUrl = _configuration["App:FrontendUrl"] ?? "https://planmyfuture.org";
            var resetLink = $"{frontendUrl}/reset-password?token={resetToken}";

            var htmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;'>
                    <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                        <div style='text-align: center; margin-bottom: 30px;'>
                            <h1 style='color: #171717; margin: 0;'>Min Ekonomi</h1>
                        </div>
                        
                        <h2 style='color: #171717; margin-bottom: 20px;'>Återställ ditt lösenord</h2>
                        
                        <p style='color: #525252; font-size: 16px; line-height: 1.6;'>
                            Hej {firstName},
                        </p>
                        
                        <p style='color: #525252; font-size: 16px; line-height: 1.6;'>
                            Vi har fått en begäran om att återställa ditt lösenord. Klicka på knappen nedan för att skapa ett nytt lösenord:
                        </p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{resetLink}' style='display: inline-block; background: #171717; color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;'>
                                Återställ lösenord
                            </a>
                        </div>
                        
                        <p style='color: #737373; font-size: 14px; line-height: 1.6;'>
                            Denna länk upphör att gälla om <strong>1 timme</strong>. Om du inte begärde detta kan du ignorera detta meddelande.
                        </p>
                        
                        <hr style='border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;' />
                        
                        <p style='color: #a3a3a3; font-size: 12px; text-align: center;'>
                            Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:<br/>
                            <a href='{resetLink}' style='color: #171717; word-break: break-all;'>{resetLink}</a>
                        </p>
                    </div>
                </body>
                </html>";

            var message = new EmailMessage
            {
                From = GetFromEmail(),
                To = userEmail,
                Subject = "🔐 Återställ ditt lösenord - Min Ekonomi",
                HtmlBody = htmlBody
            };

            await _resend.EmailSendAsync(message);
            _logger.LogInformation("Password reset email sent to {Email} via Resend", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", userEmail);
            throw;
        }
    }

    public async Task SendLoginNotificationAsync(string userEmail, string firstName, string lastName, string? ipAddress, int loginCount, DateTime? lastLoginAt)
    {
        if (_resend == null)
        {
            _logger.LogWarning("Resend not configured. Skipping login notification.");
            return;
        }

        try
        {
            var notifyEmail = _configuration["Resend:NotifyEmail"] ?? "eren.netic@gmail.com";
            var location = await GetCountryFromIpAsync(ipAddress);
            
            var lastLoginText = lastLoginAt.HasValue 
                ? $"{lastLoginAt.Value:yyyy-MM-dd HH:mm:ss}" 
                : "Första inloggningen!";

            var htmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #171717;'>🔑 Användare loggade in på Min Ekonomi</h2>
                    <div style='background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <p><strong>👤 Namn:</strong> {firstName} {lastName}</p>
                        <p><strong>📧 Email:</strong> {userEmail}</p>
                        <p><strong>🌍 Plats:</strong> {location}</p>
                        <p><strong>🔢 IP-adress:</strong> {ipAddress ?? "N/A"}</p>
                        <p><strong>🕐 Tidpunkt:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
                    </div>
                    <div style='background: #171717; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 15px;'>
                        <p style='margin: 0; font-size: 24px;'>🔢 Inloggning nummer: <strong>{loginCount}</strong></p>
                    </div>
                    <div style='background: #f5f5f5; border: 1px solid #e5e5e5; padding: 15px; border-radius: 8px;'>
                        <p style='margin: 0; color: #525252;'><strong>📅 Senaste inloggning:</strong> {lastLoginText}</p>
                    </div>
                    <p style='color: #6b7280; font-size: 12px; margin-top: 20px;'>Detta meddelande skickades automatiskt från Min Ekonomi.</p>
                </body>
                </html>";

            var message = new EmailMessage
            {
                From = GetFromEmail(),
                To = notifyEmail,
                Subject = $"🔑 Min Ekonomi - Inloggning #{loginCount} - {firstName} {lastName}",
                HtmlBody = htmlBody
            };

            await _resend.EmailSendAsync(message);
            _logger.LogInformation("Login notification email sent for {Email} via Resend", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send login notification email for {Email}", userEmail);
        }
    }
}
