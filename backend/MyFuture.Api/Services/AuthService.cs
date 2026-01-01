using Microsoft.EntityFrameworkCore;
using MyFuture.Api.Data;
using MyFuture.Api.DTOs;
using MyFuture.Api.Models;

namespace MyFuture.Api.Services;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request, string? ipAddress = null);
    Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress = null);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<bool> UpdateLanguageAsync(int userId, string language);
    Task<bool> RequestPasswordResetAsync(string email);
    Task<bool> ResetPasswordAsync(string token, string newPassword);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;

    public AuthService(AppDbContext context, IJwtService jwtService, IEmailService emailService)
    {
        _context = context;
        _jwtService = jwtService;
        _emailService = emailService;
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request, string? ipAddress = null)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return null;
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            BirthYear = request.BirthYear,
            CreatedAt = DateTime.UtcNow,
            RegistrationIp = ipAddress
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Get total user count and check for duplicate IPs
        var totalUsers = await _context.Users.CountAsync();
        
        // Find other accounts from the same IP (excluding localhost)
        List<User> duplicateIpAccounts = new();
        if (!string.IsNullOrEmpty(ipAddress) && ipAddress != "::1" && ipAddress != "127.0.0.1")
        {
            duplicateIpAccounts = await _context.Users
                .Where(u => u.RegistrationIp == ipAddress && u.Id != user.Id)
                .ToListAsync();
        }
        
        // Send notification to admin (fire and forget - don't block registration)
        _ = Task.Run(() => _emailService.SendNewAccountNotificationAsync(user.Email, user.FirstName, user.LastName, ipAddress, totalUsers, duplicateIpAccounts));
        
        // Send welcome email to the new user (fire and forget)
        _ = Task.Run(() => _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName));

        var token = _jwtService.GenerateToken(user);

        return new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            token,
            user.PreferredLanguage,
            user.BirthYear
        );
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, string? ipAddress = null)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        // Store previous login time before updating
        var previousLoginAt = user.LastLoginAt;
        
        // Update login tracking
        user.LoginCount++;
        user.LastLoginAt = DateTime.UtcNow;
        user.LastLoginIp = ipAddress;
        await _context.SaveChangesAsync();

        // Send login notification email (fire and forget - don't block login)
        _ = Task.Run(() => _emailService.SendLoginNotificationAsync(
            user.Email, 
            user.FirstName, 
            user.LastName, 
            ipAddress, 
            user.LoginCount,
            previousLoginAt
        ));

        var token = _jwtService.GenerateToken(user);

        return new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            token,
            user.PreferredLanguage,
            user.BirthYear
        );
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.CreatedAt,
            user.PreferredLanguage,
            user.BirthYear
        );
    }

    public async Task<bool> UpdateLanguageAsync(int userId, string language)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        // Only allow valid languages
        if (language != "en" && language != "sv")
        {
            return false;
        }

        user.PreferredLanguage = language;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RequestPasswordResetAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            // Don't reveal if email exists - return true anyway for security
            return true;
        }

        // Generate a secure random token
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("/", "_")
            .Replace("+", "-")
            .TrimEnd('=');

        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour
        await _context.SaveChangesAsync();

        // Send the reset email (fire and forget - don't block request)
        _ = Task.Run(() => _emailService.SendPasswordResetEmailAsync(user.Email, user.FirstName, token));

        return true;
    }

    public async Task<bool> ResetPasswordAsync(string token, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => 
            u.PasswordResetToken == token && 
            u.PasswordResetTokenExpiry > DateTime.UtcNow);

        if (user == null)
        {
            return false; // Invalid or expired token
        }

        // Update password and clear reset token
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        await _context.SaveChangesAsync();

        return true;
    }
}

