using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
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

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
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

    public async Task SendNewAccountNotificationAsync(string userEmail, string firstName, string lastName, string? ipAddress, int totalUsers, List<User>? duplicateIpAccounts = null)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPassword = _configuration["Email:SmtpPassword"];
            var notifyEmail = _configuration["Email:NotifyEmail"];

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || 
                string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(notifyEmail))
            {
                _logger.LogWarning("Email configuration is incomplete. Skipping notification.");
                return;
            }

            var location = await GetCountryFromIpAsync(ipAddress);
            
            // Build duplicate warning section
            var duplicateWarningHtml = "";
            var duplicateWarningText = "";
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
                    
                duplicateWarningText = $"\n\n⚠️ VARNING: {duplicateIpAccounts.Count} andra konton från samma IP:\n" + 
                    string.Join("\n", duplicateIpAccounts.Select(u => $"  - {u.FirstName} {u.LastName} ({u.Email})"));
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("MyFuture", smtpUser));
            message.To.Add(new MailboxAddress("Admin", notifyEmail));
            message.Subject = $"{subjectWarning}🆕 Nytt konto #{totalUsers} - {firstName} {lastName}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #4F46E5;'>Nytt konto har skapats på MyFuture</h2>
                    {duplicateWarningHtml}
                    <div style='background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <p><strong>👤 Namn:</strong> {firstName} {lastName}</p>
                        <p><strong>📧 Email:</strong> {userEmail}</p>
                        <p><strong>🌍 Plats:</strong> {location}</p>
                        <p><strong>🔢 IP-adress:</strong> {ipAddress ?? "N/A"}</p>
                        <p><strong>🕐 Tidpunkt:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
                    </div>
                    <div style='background: #4F46E5; color: white; padding: 15px; border-radius: 8px; text-align: center;'>
                        <p style='margin: 0; font-size: 18px;'>📊 Totalt antal användare: <strong>{totalUsers}</strong></p>
                    </div>
                    <p style='color: #6b7280; font-size: 12px; margin-top: 20px;'>Detta meddelande skickades automatiskt från MyFuture.</p>
                </body>
                </html>",
                TextBody = $"Nytt konto skapat:\n\nNamn: {firstName} {lastName}\nEmail: {userEmail}\nPlats: {location}\nIP: {ipAddress}\nTidpunkt: {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n\nTotalt antal användare: {totalUsers}{duplicateWarningText}"
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            // Set longer timeout for cloud environments (2 minutes instead of default 30 seconds)
            client.Timeout = 120000;
            
            // Try SSL on port 465 first if port is 587, otherwise use configured settings
            var useSSL = smtpPort == 465;
            var secureOption = useSSL ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            
            await client.ConnectAsync(smtpHost, smtpPort, secureOption);
            await client.AuthenticateAsync(smtpUser, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Account notification email sent for {Email}", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send account notification email for {Email}", userEmail);
            // Don't throw - email failure shouldn't prevent registration
        }
    }

    public async Task SendWelcomeEmailAsync(string userEmail, string firstName)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPassword = _configuration["Email:SmtpPassword"];
            var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:5173";

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || 
                string.IsNullOrEmpty(smtpPassword))
            {
                _logger.LogWarning("Email configuration is incomplete. Skipping welcome email.");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("MyFuture", smtpUser));
            message.To.Add(new MailboxAddress(firstName, userEmail));
            message.Subject = "🎉 Välkommen till MyFuture!";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;'>
                    <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                        <div style='text-align: center; margin-bottom: 30px;'>
                            <h1 style='color: #171717; margin: 0;'>MyFuture</h1>
                            <p style='color: #737373; margin-top: 5px;'>Din ekonomiska framtid börjar här</p>
                        </div>
                        
                        <h2 style='color: #171717; margin-bottom: 20px;'>Välkommen, {firstName}! 🎉</h2>
                        
                        <p style='color: #525252; font-size: 16px; line-height: 1.6;'>
                            Tack för att du skapade ett konto på MyFuture! Vi är glada att ha dig med oss.
                        </p>
                        
                        <p style='color: #525252; font-size: 16px; line-height: 1.6;'>
                            Med MyFuture kan du:
                        </p>
                        
                        <ul style='color: #525252; font-size: 16px; line-height: 1.8;'>
                            <li>📊 Planera din privatekonomi</li>
                            <li>💰 Hantera budget och sparande</li>
                            <li>🏠 Spåra tillgångar och skulder</li>
                            <li>📈 Se din ekonomiska framtid</li>
                        </ul>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{frontendUrl}/login' style='display: inline-block; background: #171717; color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;'>
                                Logga in nu
                            </a>
                        </div>
                        
                        <hr style='border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;' />
                        
                        <p style='color: #a3a3a3; font-size: 12px; text-align: center;'>
                            Detta meddelande skickades till {userEmail} eftersom du skapade ett konto på MyFuture.<br/>
                            Om du inte skapade detta konto, vänligen ignorera detta meddelande.
                        </p>
                    </div>
                </body>
                </html>",
                TextBody = $"Välkommen till MyFuture, {firstName}!\n\nTack för att du skapade ett konto på MyFuture!\n\nMed MyFuture kan du:\n- Planera din privatekonomi\n- Hantera budget och sparande\n- Spåra tillgångar och skulder\n- Se din ekonomiska framtid\n\nLogga in här: {frontendUrl}/login\n\nMed vänliga hälsningar,\nMyFuture-teamet"
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            // Set longer timeout for cloud environments
            client.Timeout = 120000;
            var useSSL = smtpPort == 465;
            var secureOption = useSSL ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            
            await client.ConnectAsync(smtpHost, smtpPort, secureOption);
            await client.AuthenticateAsync(smtpUser, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Welcome email sent to {Email}", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", userEmail);
            // Don't throw - email failure shouldn't prevent registration
        }
    }

    public async Task SendPasswordResetEmailAsync(string userEmail, string firstName, string resetToken)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPassword = _configuration["Email:SmtpPassword"];
            var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:5173";

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || 
                string.IsNullOrEmpty(smtpPassword))
            {
                _logger.LogWarning("Email configuration is incomplete. Skipping password reset email.");
                return;
            }

            var resetLink = $"{frontendUrl}/reset-password?token={resetToken}";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("MyFuture", smtpUser));
            message.To.Add(new MailboxAddress(firstName, userEmail));
            message.Subject = "🔐 Reset your MyFuture password";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;'>
                    <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                        <div style='text-align: center; margin-bottom: 30px;'>
                            <h1 style='color: #0ea5e9; margin: 0;'>MyFuture</h1>
                        </div>
                        
                        <h2 style='color: #1e293b; margin-bottom: 20px;'>Password Reset Request</h2>
                        
                        <p style='color: #475569; font-size: 16px; line-height: 1.6;'>
                            Hi {firstName},
                        </p>
                        
                        <p style='color: #475569; font-size: 16px; line-height: 1.6;'>
                            We received a request to reset your password. Click the button below to create a new password:
                        </p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{resetLink}' style='display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;'>
                                Reset Password
                            </a>
                        </div>
                        
                        <p style='color: #64748b; font-size: 14px; line-height: 1.6;'>
                            This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
                        </p>
                        
                        <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;' />
                        
                        <p style='color: #94a3b8; font-size: 12px; text-align: center;'>
                            If the button doesn't work, copy and paste this link into your browser:<br/>
                            <a href='{resetLink}' style='color: #0ea5e9; word-break: break-all;'>{resetLink}</a>
                        </p>
                    </div>
                </body>
                </html>",
                TextBody = $"Hi {firstName},\n\nWe received a request to reset your MyFuture password.\n\nClick this link to reset your password:\n{resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email."
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            // Set longer timeout for cloud environments
            client.Timeout = 120000;
            var useSSL = smtpPort == 465;
            var secureOption = useSSL ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            
            await client.ConnectAsync(smtpHost, smtpPort, secureOption);
            await client.AuthenticateAsync(smtpUser, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Password reset email sent to {Email}", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", userEmail);
            throw; // Rethrow so the controller knows the email failed
        }
    }

    public async Task SendLoginNotificationAsync(string userEmail, string firstName, string lastName, string? ipAddress, int loginCount, DateTime? lastLoginAt)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:SmtpUser"];
            var smtpPassword = _configuration["Email:SmtpPassword"];
            var notifyEmail = _configuration["Email:NotifyEmail"];

            if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser) || 
                string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(notifyEmail))
            {
                _logger.LogWarning("Email configuration is incomplete. Skipping login notification.");
                return;
            }

            var location = await GetCountryFromIpAsync(ipAddress);
            
            var lastLoginText = lastLoginAt.HasValue 
                ? $"{lastLoginAt.Value:yyyy-MM-dd HH:mm:ss}" 
                : "Första inloggningen!";

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("MyFuture", smtpUser));
            message.To.Add(new MailboxAddress("Admin", notifyEmail));
            message.Subject = $"🔑 Inloggning #{loginCount} - {firstName} {lastName}";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #10B981;'>🔑 Användare loggade in på MyFuture</h2>
                    <div style='background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                        <p><strong>👤 Namn:</strong> {firstName} {lastName}</p>
                        <p><strong>📧 Email:</strong> {userEmail}</p>
                        <p><strong>🌍 Plats:</strong> {location}</p>
                        <p><strong>🔢 IP-adress:</strong> {ipAddress ?? "N/A"}</p>
                        <p><strong>🕐 Tidpunkt:</strong> {DateTime.Now:yyyy-MM-dd HH:mm:ss}</p>
                    </div>
                    <div style='background: #10B981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 15px;'>
                        <p style='margin: 0; font-size: 24px;'>🔢 Inloggning nummer: <strong>{loginCount}</strong></p>
                    </div>
                    <div style='background: #f0fdf4; border: 1px solid #10B981; padding: 15px; border-radius: 8px;'>
                        <p style='margin: 0; color: #166534;'><strong>📅 Senaste inloggning:</strong> {lastLoginText}</p>
                    </div>
                    <p style='color: #6b7280; font-size: 12px; margin-top: 20px;'>Detta meddelande skickades automatiskt från MyFuture.</p>
                </body>
                </html>",
                TextBody = $"Användare loggade in:\n\nNamn: {firstName} {lastName}\nEmail: {userEmail}\nPlats: {location}\nIP: {ipAddress}\nTidpunkt: {DateTime.Now:yyyy-MM-dd HH:mm:ss}\n\nInloggning nummer: {loginCount}\nSenaste inloggning: {lastLoginText}"
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            // Set longer timeout for cloud environments
            client.Timeout = 120000;
            var useSSL = smtpPort == 465;
            var secureOption = useSSL ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            
            await client.ConnectAsync(smtpHost, smtpPort, secureOption);
            await client.AuthenticateAsync(smtpUser, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Login notification email sent for {Email}", userEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send login notification email for {Email}", userEmail);
            // Don't throw - email failure shouldn't prevent login
        }
    }
}

