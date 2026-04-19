using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using tmsserver.Data.Repositories;
using tmsserver.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace tmsserver.Tests;

public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    public CustomWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("AZURE_SQL_CONNECTIONSTRING", "Server=dummy;Database=dummy;User Id=dummy;Password=dummy;");
    }

    public Mock<IUserRepository> UserRepositoryMock { get; } = new();
    public Mock<ITournamentRepository> TournamentRepositoryMock { get; } = new();
    public Mock<IRoleRepository> RoleRepositoryMock { get; } = new();
    public Mock<IRegistrationRequestRepository> RegistrationRequestRepositoryMock { get; } = new();
    public Mock<IGroupRepository> GroupRepositoryMock { get; } = new();
    public Mock<ITournamentTeamRepository> TournamentTeamRepositoryMock { get; } = new();
    public Mock<ITournamentMatchRepository> TournamentMatchRepositoryMock { get; } = new();
    public Mock<IMatchScoreRepository> MatchScoreRepositoryMock { get; } = new();
    public Mock<ILiveGameScoreRepository> LiveGameScoreRepositoryMock { get; } = new();
    public Mock<IPracticeSessionRepository> PracticeSessionRepositoryMock { get; } = new();
    public Mock<IInventoryRepository> InventoryRepositoryMock { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace repository registrations with mocks
            ReplaceService(services, UserRepositoryMock.Object);
            ReplaceService(services, TournamentRepositoryMock.Object);
            ReplaceService(services, RoleRepositoryMock.Object);
            ReplaceService(services, RegistrationRequestRepositoryMock.Object);
            ReplaceService(services, GroupRepositoryMock.Object);
            ReplaceService(services, TournamentTeamRepositoryMock.Object);
            ReplaceService(services, TournamentMatchRepositoryMock.Object);
            ReplaceService(services, MatchScoreRepositoryMock.Object);
            ReplaceService(services, LiveGameScoreRepositoryMock.Object);
            ReplaceService(services, PracticeSessionRepositoryMock.Object);
            ReplaceService(services, InventoryRepositoryMock.Object);

            // Mock PracticeSessionRepository (it's a class, not an interface, so we might need to mock its methods if they are virtual, or replace it with a mock if it has a parameterless constructor or if we use an interface)
            // Looking at Program.cs, it's registered as: builder.Services.AddScoped<PracticeSessionRepository>();
            // If it's not an interface, we might have issue mocking it directly without virtual methods.
            
            // Add a fake authentication handler
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "TestScheme";
                options.DefaultChallengeScheme = "TestScheme";
            }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("TestScheme", options => { });
        });
    }

    private static void ReplaceService<TService>(IServiceCollection services, TService implementation) where TService : class
    {
        var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(TService));
        if (descriptor != null)
        {
            services.Remove(descriptor);
        }
        services.AddScoped(_ => implementation);
    }
}

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[] { 
            new Claim(ClaimTypes.Name, "TestUser"),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim("sub", "1"),
            new Claim("userId", "1")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "TestScheme");

        var result = AuthenticateResult.Success(ticket);

        return Task.FromResult(result);
    }
}
