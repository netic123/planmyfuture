using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;
using System.Security.Claims;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/gigs")]
public class GigController : ControllerBase
{
    private readonly IGigService _gigService;

    public GigController(IGigService gigService)
    {
        _gigService = gigService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    #region Gigs

    [HttpGet("search")]
    public async Task<ActionResult<GigSearchResult>> SearchGigs([FromQuery] GigSearchRequest request)
    {
        var result = await _gigService.SearchGigsAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GigDto>> GetGig(int id)
    {
        int? userId = User.Identity?.IsAuthenticated == true ? GetUserId() : null;
        var gig = await _gigService.GetGigAsync(id, userId);
        if (gig == null) return NotFound();
        return Ok(gig);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<GigDto>> CreateGig(CreateGigRequest request)
    {
        var gig = await _gigService.CreateGigAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetGig), new { id = gig.Id }, gig);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<GigDto>> UpdateGig(int id, UpdateGigRequest request)
    {
        var gig = await _gigService.UpdateGigAsync(GetUserId(), id, request);
        if (gig == null) return NotFound();
        return Ok(gig);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGig(int id)
    {
        var result = await _gigService.DeleteGigAsync(GetUserId(), id);
        if (!result) return NotFound();
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id}/publish")]
    public async Task<ActionResult> PublishGig(int id)
    {
        var result = await _gigService.PublishGigAsync(GetUserId(), id);
        if (!result) return NotFound();
        return Ok(new { message = "Gig published successfully" });
    }

    [Authorize]
    [HttpPost("{id}/close")]
    public async Task<ActionResult> CloseGig(int id)
    {
        var result = await _gigService.CloseGigAsync(GetUserId(), id);
        if (!result) return NotFound();
        return Ok(new { message = "Gig closed successfully" });
    }

    [Authorize]
    [HttpGet("my-gigs")]
    public async Task<ActionResult<IEnumerable<GigDto>>> GetMyGigs()
    {
        var gigs = await _gigService.GetMyGigsAsync(GetUserId());
        return Ok(gigs);
    }

    #endregion

    #region Applications

    [Authorize]
    [HttpPost("{gigId}/apply")]
    public async Task<ActionResult<GigApplicationDto>> ApplyToGig(int gigId, ApplyToGigRequest request)
    {
        var application = await _gigService.ApplyToGigAsync(GetUserId(), gigId, request);
        if (application == null) return BadRequest(new { message = "Could not apply to this gig. You may have already applied or this is your own gig." });
        return CreatedAtAction(nameof(GetMyApplications), application);
    }

    [Authorize]
    [HttpGet("{gigId}/applications")]
    public async Task<ActionResult<IEnumerable<GigApplicationDto>>> GetApplicationsForGig(int gigId)
    {
        var applications = await _gigService.GetApplicationsForGigAsync(GetUserId(), gigId);
        return Ok(applications);
    }

    [Authorize]
    [HttpGet("my-applications")]
    public async Task<ActionResult<IEnumerable<GigApplicationDto>>> GetMyApplications()
    {
        var applications = await _gigService.GetMyApplicationsAsync(GetUserId());
        return Ok(applications);
    }

    [Authorize]
    [HttpPut("applications/{applicationId}/status")]
    public async Task<ActionResult> UpdateApplicationStatus(int applicationId, UpdateApplicationStatusRequest request)
    {
        var result = await _gigService.UpdateApplicationStatusAsync(GetUserId(), applicationId, request);
        if (!result) return NotFound();
        return Ok(new { message = "Application status updated" });
    }

    [Authorize]
    [HttpPost("applications/{applicationId}/withdraw")]
    public async Task<ActionResult> WithdrawApplication(int applicationId)
    {
        var result = await _gigService.WithdrawApplicationAsync(GetUserId(), applicationId);
        if (!result) return NotFound();
        return Ok(new { message = "Application withdrawn" });
    }

    #endregion

    #region Profiles

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<ConsultantProfileDto>> GetMyProfile()
    {
        var profile = await _gigService.GetProfileAsync(GetUserId());
        if (profile == null) return NotFound(new { message = "Profile not found. Create one first." });
        return Ok(profile);
    }

    [HttpGet("profiles/{id}")]
    public async Task<ActionResult<ConsultantProfileDto>> GetProfile(int id)
    {
        var profile = await _gigService.GetProfileByIdAsync(id);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("profile")]
    public async Task<ActionResult<ConsultantProfileDto>> CreateOrUpdateProfile(CreateProfileRequest request)
    {
        var profile = await _gigService.CreateOrUpdateProfileAsync(GetUserId(), request);
        return Ok(profile);
    }

    [HttpGet("profiles/search")]
    public async Task<ActionResult<ConsultantSearchResult>> SearchConsultants([FromQuery] ConsultantSearchRequest request)
    {
        var result = await _gigService.SearchConsultantsAsync(request);
        return Ok(result);
    }

    #endregion
}

