using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using tmsserver.Data;
using tmsserver.Models;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly UserService _userService;
    private readonly ApplicationDbContext _context;

    public AuthController(IConfiguration config, UserService userService, ApplicationDbContext context)
    {
        _config = config;
        _userService = userService;
        _context = context;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        if (string.IsNullOrWhiteSpace(model.Username) || string.IsNullOrWhiteSpace(model.Password))
        {
            return BadRequest(new { message = "Username and password are required" });
        }

        
        User? user = _userService.FindUserByUsername(model.Username);
        user ??= _userService.FindUserByEmail(model.Username);
        user ??= _userService.FindUserByIdentityNumber(model.Username);

        if (user == null || !_userService.ValidatePassword(model.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        
        if (user.Role == UserRole.PendingPlayer || !user.IsApproved)
        {
            return Unauthorized(new { message = "Your account is not yet approved. Please wait for admin approval." });
        }

        var token = GenerateToken(user.Id.ToString(), user.Username, user.Role.ToString());
        return Ok(new { 
            token, 
            id = user.Id,
            username = user.Username, 
            email = user.Email,
            identityNumber = user.IdentityNumber,
            role = user.Role.ToString()
        });
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] SignupModel model)
    {
        if (string.IsNullOrWhiteSpace(model.Username) || 
            string.IsNullOrWhiteSpace(model.IdentityNumber) ||
            string.IsNullOrWhiteSpace(model.Email) || 
            string.IsNullOrWhiteSpace(model.Password))
        {
            return BadRequest(new { message = "All fields are required" });
        }

        if (model.Password != model.ConfirmPassword)
        {
            return BadRequest(new { message = "Passwords do not match" });
        }

        if (model.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters" });
        }

        try
        {
            var user = await _userService.RegisterUserAsync(model.Username, model.IdentityNumber, model.Email, model.Password);
            
            
            var registrationRequest = new RegistrationRequest
            {
                UserId = user.Id,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _context.RegistrationRequests.Add(registrationRequest);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Registration submitted successfully. Please wait for admin approval.",
                userId = user.Id,
                username = user.Username,
                email = user.Email
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("pending-registrations")]
    [Authorize]
    public async Task<IActionResult> GetPendingRegistrations()
    {
        try
        {
            var pendingUsers = await _userService.GetPendingRegistrationsAsync();
            return Ok(pendingUsers);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("approve-registration/{userId}")]
    [Authorize]
    public async Task<IActionResult> ApproveRegistration(int userId)
    {
        try
        {
            
            var adminIdClaim = User.FindFirst("sub") 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)
                ?? User.FindFirst("userId");
            
            if (adminIdClaim == null || !int.TryParse(adminIdClaim.Value, out int adminId))
            {
                return Unauthorized(new { message = "Invalid admin info" });
            }

            
            var admin = _userService.FindUserById(adminId);
            if (admin?.Role != UserRole.Admin && admin?.Role != UserRole.SystemAdmin)
            {
                return Forbid();
            }

            await _userService.ApproveRegistrationAsync(userId, adminId);
            return Ok(new { message = "Registration approved successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reject-registration/{userId}")]
    [Authorize]
    public async Task<IActionResult> RejectRegistration(int userId, [FromBody] RejectionModel model)
    {
        try
        {
            
            var adminIdClaim = User.FindFirst("sub") 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)
                ?? User.FindFirst("userId");
            
            if (adminIdClaim == null || !int.TryParse(adminIdClaim.Value, out int adminId))
            {
                return Unauthorized(new { message = "Invalid admin info" });
            }

         
            var admin = _userService.FindUserById(adminId);
            if (admin?.Role != UserRole.Admin && admin?.Role != UserRole.SystemAdmin)
            {
                return Forbid();
            }

            await _userService.RejectRegistrationAsync(userId, adminId, model?.Reason);
            return Ok(new { message = "Registration rejected successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string GenerateToken(string userId, string username, string role)
    {
        var jwtSettings = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim("sub", userId),
            new Claim("userId", userId),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class RejectionModel
{
    public string? Reason { get; set; }
}
