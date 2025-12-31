using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyFuture.Api.DTOs;
using MyFuture.Api.Services;

namespace MyFuture.Api.Controllers;

[ApiController]
[Route("api/companies/{companyId}/[controller]")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AccountDto>>> GetAccounts(int companyId)
    {
        var accounts = await _accountService.GetAccountsAsync(companyId);
        return Ok(accounts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccountDto>> GetAccount(int companyId, int id)
    {
        var account = await _accountService.GetAccountAsync(id, companyId);
        if (account == null)
        {
            return NotFound();
        }
        return Ok(account);
    }

    [HttpPost]
    public async Task<ActionResult<AccountDto>> CreateAccount(int companyId, CreateAccountRequest request)
    {
        var account = await _accountService.CreateAccountAsync(request, companyId);
        if (account == null)
        {
            return BadRequest(new { message = "Account number already exists" });
        }
        return CreatedAtAction(nameof(GetAccount), new { companyId, id = account.Id }, account);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAccount(int companyId, int id)
    {
        var result = await _accountService.DeleteAccountAsync(id, companyId);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpGet("balances")]
    public async Task<ActionResult<List<AccountBalanceDto>>> GetAccountBalances(int companyId, [FromQuery] DateTime? asOfDate = null)
    {
        var balances = await _accountService.GetAccountBalancesAsync(companyId, asOfDate);
        return Ok(balances);
    }
}

