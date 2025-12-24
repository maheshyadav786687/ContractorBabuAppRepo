using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;

namespace CleanArchitectureApp.Api.Filters;

public class JwtAuthorizationFilter : IAsyncAuthorizationFilter
{
    private readonly IConfiguration _configuration;

    public JwtAuthorizationFilter(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
        // Skip authorization for endpoints that don't require it
        var endpoint = context.HttpContext.GetEndpoint();
        if (endpoint?.Metadata?.GetMetadata<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>() != null)
        {
            return;
        }

        var authHeader = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            // Try to read the token without validating to inspect claims for debugging
            try
            {
                var raw = tokenHandler.ReadJwtToken(token);
                Console.WriteLine(" Token raw claims:");
                foreach (var c in raw.Claims)
                {
                    Console.WriteLine($"  {c.Type}: {c.Value}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Failed to read raw token: {ex.Message}");
            }
            var keyString = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
            var key = Encoding.UTF8.GetBytes(keyString);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                // During debugging, relax lifetime validation to rule out clock/expiry issues.
                // TODO: set back to true in production
                ValidateLifetime = false,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                ClockSkew = TimeSpan.FromSeconds(30)
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
            
            // Set the user principal
            context.HttpContext.User = principal;
            
            Console.WriteLine($" Token validated successfully for user: {principal.Identity?.Name}");
        }
        catch (Exception ex)
        {
            // Log full exception for debugging (includes inner exceptions and stack)
            Console.WriteLine($" Token validation failed: {ex}");
            context.Result = new UnauthorizedResult();
        }
        
        await Task.CompletedTask;
    }
}
