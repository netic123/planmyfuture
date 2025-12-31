using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;
using System.Security.Claims;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly HttpClient _httpClient;

    public AuthController(IAuthService authService, IHttpClientFactory httpClientFactory)
    {
        _authService = authService;
        _httpClient = httpClientFactory.CreateClient();
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        // Get client IP address
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        
        // Check for forwarded IP (when behind proxy/load balancer)
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            ipAddress = Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim();
        }

        // If localhost, get the real public IP (useful for development)
        if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1" || ipAddress == "127.0.0.1")
        {
            try
            {
                ipAddress = await _httpClient.GetStringAsync("https://api.ipify.org");
            }
            catch
            {
                // Keep localhost IP if external service fails
            }
        }

        var result = await _authService.RegisterAsync(request, ipAddress);
        if (result == null)
        {
            return BadRequest(new { message = "Email already exists" });
        }
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        // Get client IP address
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        
        // Check for forwarded IP (when behind proxy/load balancer)
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
        {
            ipAddress = Request.Headers["X-Forwarded-For"].FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim();
        }

        // If localhost, get the real public IP (useful for development)
        if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1" || ipAddress == "127.0.0.1")
        {
            try
            {
                ipAddress = await _httpClient.GetStringAsync("https://api.ipify.org");
            }
            catch
            {
                // Keep localhost IP if external service fails
            }
        }

        var result = await _authService.LoginAsync(request, ipAddress);
        if (result == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }

    [Authorize]
    [HttpPut("language")]
    public async Task<IActionResult> UpdateLanguage(UpdateLanguageRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var success = await _authService.UpdateLanguageAsync(userId, request.Language);
        if (!success)
        {
            return BadRequest(new { message = "Invalid language" });
        }
        return Ok(new { message = "Language updated", language = request.Language });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        await _authService.RequestPasswordResetAsync(request.Email);
        // Always return success to prevent email enumeration attacks
        return Ok(new { message = "If an account with that email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var success = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
        if (!success)
        {
            return BadRequest(new { message = "Invalid or expired reset token" });
        }
        return Ok(new { message = "Password has been reset successfully" });
    }
}

